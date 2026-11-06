using System.Data;
using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Workshop;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

/// <summary>
/// "Min bokning": the customer finds, moves or cancels their own booking
/// without an account. Access = booking number + the secret from their link,
/// or + the e-mail address / registration number they booked with.
/// </summary>
public interface IBookingManagementService
{
    Task<Result<ManagedBookingDto>> FindAsync(BookingAccessRequest access, CancellationToken ct);
    Task<Result<ManagedBookingDto>> CancelAsync(BookingAccessRequest access, CancellationToken ct);
    Task<Result<ManagedBookingDto>> RescheduleAsync(RescheduleBookingRequest request, CancellationToken ct);
    /// <summary>Staff scan the customer's QR code at the reception.</summary>
    Task<Result<ManagedBookingDto>> CheckInAsync(string reference, CancellationToken ct);
}

public sealed class BookingManagementService(AppDbContext db, WorkshopCatalog catalog, TimeProvider clock, INotificationService notify)
    : IBookingManagementService
{
    private static readonly BookingStatus[] Changeable = [BookingStatus.Booked, BookingStatus.Confirmed];
    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;

    public async Task<Result<ManagedBookingDto>> FindAsync(BookingAccessRequest access, CancellationToken ct) =>
        await AuthorizeAsync(access, ct) is { } b ? ToDto(b) : NotFound();

    public async Task<Result<ManagedBookingDto>> CancelAsync(BookingAccessRequest access, CancellationToken ct)
    {
        if (await AuthorizeAsync(access, ct) is not { } b) return NotFound();
        if (b.Status == BookingStatus.Cancelled) return ToDto(b); // idempotent
        if (!CanChange(b)) return Locked();

        b.Status = BookingStatus.Cancelled;
        await db.SaveChangesAsync(ct);
        await notify.BookingChangedAsync(b, ServiceName(b), ct);
        return ToDto(b);
    }

    public async Task<Result<ManagedBookingDto>> RescheduleAsync(RescheduleBookingRequest r, CancellationToken ct)
    {
        if (!TimeOnly.TryParse(r.Time, out var start)) return Error.Validation(nameof(r.Time), Messages.TimeRequired);
        var date = r.Date!.Value;

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            if (await AuthorizeAsync(r, ct) is not { } b) return NotFound();
            if (!CanChange(b)) return Locked();
            if (catalog.Find(b.ServiceCode) is not { } svc)
                return Result<ManagedBookingDto>.Failure(Error.NotFound(Messages.ServiceNotFound));

            // The customer's own current slot does not block the new one.
            var free = Workshop.Availability.FreeStarts(catalog, svc, date, UtcNow, await db.OccupiedAsync(date, date, ct, b.Id));
            if (!free.Contains(start))
                return Result<ManagedBookingDto>.Failure(Error.Conflict(Messages.SlotTaken, Messages.SlotTakenDetail));

            b.Date = date;
            b.StartTime = start;
            b.DurationMinutes = svc.Minutes;
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            await notify.BookingChangedAsync(b, svc.Name, ct);
            return ToDto(b);
        });
    }

    public async Task<Result<ManagedBookingDto>> CheckInAsync(string reference, CancellationToken ct)
    {
        var b = await db.Bookings.FirstOrDefaultAsync(x => x.Reference == Normalize(reference), ct);
        if (b is null) return Error.NotFound(Messages.BookingNotFound);
        if (b.Status == BookingStatus.Cancelled) return Locked();
        b.Status = BookingStatus.Arrived;
        await db.SaveChangesAsync(ct);
        return ToDto(b);
    }

    /// <summary>
    /// Returns the booking only if the caller proved ownership. Every failure
    /// looks the same, so the endpoint does not reveal which booking numbers exist.
    /// </summary>
    private async Task<Booking?> AuthorizeAsync(BookingAccessRequest access, CancellationToken ct)
    {
        var b = await db.Bookings.FirstOrDefaultAsync(x => x.Reference == Normalize(access.Reference), ct);
        if (b is null) return null;
        if (ManageToken.Matches(access.Token, b.ManageTokenHash)) return b;

        var contact = access.Contact?.Trim();
        if (string.IsNullOrEmpty(contact)) return null;
        var emailMatches = string.Equals(contact, b.Email, StringComparison.OrdinalIgnoreCase);
        var regMatches = RegistrationNumber.IsValid(contact) && RegistrationNumber.Normalize(contact) == b.RegNumber;
        return emailMatches || regMatches ? b : null;
    }

    private DateTime ChangeDeadline(Booking b) => catalog.ToUtc(b.Date, b.StartTime).AddHours(-catalog.ChangeCutoffHours);
    private bool CanChange(Booking b) => Changeable.Contains(b.Status) && UtcNow <= ChangeDeadline(b);
    private string ServiceName(Booking b) => catalog.Find(b.ServiceCode)?.Name ?? b.ServiceCode;

    private ManagedBookingDto ToDto(Booking b)
    {
        var svc = catalog.Find(b.ServiceCode);
        return new ManagedBookingDto(b.Reference, b.ServiceCode, svc?.Name ?? b.ServiceCode, svc?.Category ?? "", b.Date,
            BookingQueries.Format(b.StartTime), b.DurationMinutes, b.RegNumber, b.Status.ToString(), CanChange(b), ChangeDeadline(b));
    }

    private static string Normalize(string reference) => reference.Trim().ToUpperInvariant().Replace(" ", "");

    private static Result<ManagedBookingDto> NotFound() => Error.NotFound(Messages.BookingNotFound, Messages.BookingNotFoundDetail);

    private Result<ManagedBookingDto> Locked() =>
        Error.Conflict(Messages.BookingLocked, string.Format(Messages.BookingLockedDetail, catalog.ChangeCutoffHours));
}
