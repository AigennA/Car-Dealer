using System.Data;
using System.Security.Cryptography;
using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Workshop;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

public interface IBookingService
{
    Task<Result<AvailabilityDto>> AvailabilityAsync(string serviceCode, DateOnly date, CancellationToken ct);
    Task<Result<IReadOnlyList<BookableDayDto>>> BookableDaysAsync(string serviceCode, CancellationToken ct);
    Task<Result<BookingConfirmationDto>> BookAsync(CreateBookingRequest request, CancellationToken ct);
    Task<IReadOnlyList<BookingDto>> ListAsync(DateOnly? from, DateOnly? to, CancellationToken ct);
    Task<Result> SetStatusAsync(int id, BookingStatus status, CancellationToken ct);
}

/// <summary>Short booking codes the customer can read out on the phone.</summary>
public interface IReferenceGenerator
{
    string Next();
}

public sealed class RandomReferenceGenerator : IReferenceGenerator
{
    private const string Prefix = "CD-";
    private const int Length = 6;
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

    public string Next() => Prefix + new string(Enumerable.Range(0, Length)
        .Select(_ => Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]).ToArray());
}

/// <summary>Workshop and inspection booking use cases. Scheduling rules live in <see cref="Workshop.Availability"/>.</summary>
public sealed class BookingService(
    AppDbContext db, WorkshopCatalog catalog, TimeProvider clock, INotificationService notify, IReferenceGenerator references)
    : IBookingService
{
    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;
    private IQueryable<Booking> Active => db.Bookings.Where(b => b.Status != BookingStatus.Cancelled);

    private Result<AvailabilityDto> Availability(string serviceCode, DateOnly date, IReadOnlyList<Occupied> taken)
    {
        if (catalog.Find(serviceCode) is not { } svc) return Error.NotFound(Messages.ServiceNotFound);
        var slots = Workshop.Availability.FreeStarts(catalog, svc, date, UtcNow, taken);
        return new AvailabilityDto(svc.Code, date, slots.Select(Format).ToArray());
    }

    public async Task<Result<AvailabilityDto>> AvailabilityAsync(string serviceCode, DateOnly date, CancellationToken ct) =>
        Availability(serviceCode, date, await TakenAsync(date, date, ct));

    public async Task<Result<IReadOnlyList<BookableDayDto>>> BookableDaysAsync(string serviceCode, CancellationToken ct)
    {
        if (catalog.Find(serviceCode) is not { } svc) return Error.NotFound(Messages.ServiceNotFound);
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(UtcNow, catalog.Zone));
        var last = today.AddDays(catalog.BookingHorizonDays);
        var taken = await db.Bookings.Where(b => b.Status != BookingStatus.Cancelled && b.Date >= today && b.Date <= last)
            .Select(b => new { b.Date, b.StartTime, b.DurationMinutes }).ToListAsync(ct);

        var days = new List<BookableDayDto>();
        for (var d = today; d <= last; d = d.AddDays(1))
        {
            if (catalog.HoursFor(d) is null) continue;
            var occupied = taken.Where(t => t.Date == d).Select(t => new Occupied(t.StartTime, t.DurationMinutes));
            days.Add(new BookableDayDto(d, Workshop.Availability.FreeStarts(catalog, svc, d, UtcNow, occupied).Count));
        }
        return days;
    }

    public async Task<Result<BookingConfirmationDto>> BookAsync(CreateBookingRequest r, CancellationToken ct)
    {
        if (catalog.Find(r.ServiceCode) is not { } svc) return Error.Validation(nameof(r.ServiceCode), Messages.ServiceRequired);
        if (!TimeOnly.TryParse(r.Time, out var start)) return Error.Validation(nameof(r.Time), Messages.TimeRequired);
        var date = r.Date!.Value;

        // Re-check inside a serializable transaction so two customers cannot take the last bay.
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var free = Workshop.Availability.FreeStarts(catalog, svc, date, UtcNow, await TakenAsync(date, date, ct));
            if (!free.Contains(start))
                return Result<BookingConfirmationDto>.Failure(Error.Conflict(Messages.SlotTaken, Messages.SlotTakenDetail));

            var booking = new Booking
            {
                Reference = await UniqueReferenceAsync(ct),
                ServiceCode = svc.Code, Date = date, StartTime = start, DurationMinutes = svc.Minutes,
                Name = r.Name.Trim(), Email = r.Email.Trim(), Phone = r.Phone.Trim(),
                RegNumber = RegistrationNumber.Normalize(r.RegNumber), Message = r.Message?.Trim(), CreatedAt = UtcNow,
            };
            db.Bookings.Add(booking);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            await notify.NewBookingAsync(booking, svc.Name, ct);

            return new BookingConfirmationDto(booking.Reference, svc.Name, date, Format(start), svc.Minutes,
                string.Format(Messages.BookingThanks, booking.Reference));
        });
    }

    public async Task<IReadOnlyList<BookingDto>> ListAsync(DateOnly? from, DateOnly? to, CancellationToken ct)
    {
        var q = db.Bookings.AsNoTracking();
        if (from is { } f) q = q.Where(b => b.Date >= f);
        if (to is { } t) q = q.Where(b => b.Date <= t);
        var list = await q.OrderBy(b => b.Date).ThenBy(b => b.StartTime).ToListAsync(ct);
        return list.Select(b => new BookingDto(b.Id, b.Reference, b.ServiceCode, catalog.Find(b.ServiceCode)?.Name ?? b.ServiceCode,
            b.Date, Format(b.StartTime), b.DurationMinutes, b.Name, b.Email, b.Phone, b.RegNumber, b.Message,
            b.Status.ToString(), b.CreatedAt)).ToList();
    }

    public async Task<Result> SetStatusAsync(int id, BookingStatus status, CancellationToken ct)
    {
        var b = await db.Bookings.FindAsync([id], ct);
        if (b is null) return Error.NotFound(Messages.NotFound);
        b.Status = status;
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private async Task<IReadOnlyList<Occupied>> TakenAsync(DateOnly from, DateOnly to, CancellationToken ct) =>
        await Active.Where(b => b.Date >= from && b.Date <= to)
            .Select(b => new Occupied(b.StartTime, b.DurationMinutes)).ToListAsync(ct);

    private async Task<string> UniqueReferenceAsync(CancellationToken ct)
    {
        string code;
        do code = references.Next();
        while (await db.Bookings.AnyAsync(b => b.Reference == code, ct));
        return code;
    }

    private static string Format(TimeOnly t) => t.ToString("HH:mm");
}
