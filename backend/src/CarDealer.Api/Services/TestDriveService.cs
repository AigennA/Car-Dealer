using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Workshop;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

public interface ITestDriveService
{
    Task<Result<IReadOnlyList<BookableDayDto>>> BookableDaysAsync(string carSlug, CancellationToken ct);
    Task<Result<AvailabilityDto>> AvailabilityAsync(string carSlug, DateOnly date, CancellationToken ct);
    Task<Result<BookingConfirmationDto>> BookAsync(CreateTestDriveRequest request, CancellationToken ct);
}

/// <summary>
/// "Boka provkörning": a slot for one specific car in the showroom's opening hours. Only a car that is
/// for sale and not reserved can be test driven, and one car can only be out with one customer at a time.
/// </summary>
public sealed class TestDriveService(AppDbContext db, TimeProvider clock, BookingCreator creator, TestDriveSchedule schedule)
    : ITestDriveService
{
    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;

    public async Task<Result<IReadOnlyList<BookableDayDto>>> BookableDaysAsync(string carSlug, CancellationToken ct)
    {
        var car = await FindBookableCarAsync(carSlug, ct);
        if (!car.IsSuccess) return car.Error!;

        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(UtcNow, schedule.Catalog.Zone));
        var last = today.AddDays(schedule.Catalog.BookingHorizonDays);
        var taken = await db.Bookings
            .Where(b => b.Status != BookingStatus.Cancelled && b.CarId == car.Value!.Id && b.Date >= today && b.Date <= last)
            .Select(b => new { b.Date, b.StartTime, b.DurationMinutes }).ToListAsync(ct);
        var occupied = taken.Select(t => (t.Date, new Occupied(t.StartTime, t.DurationMinutes))).ToList();
        return Availability.OpenDays(schedule.Catalog, schedule.Service, UtcNow, occupied)
            .Select(d => new BookableDayDto(d.Date, d.FreeSlots)).ToList();
    }

    public async Task<Result<AvailabilityDto>> AvailabilityAsync(string carSlug, DateOnly date, CancellationToken ct)
    {
        var car = await FindBookableCarAsync(carSlug, ct);
        if (!car.IsSuccess) return car.Error!;

        var taken = await db.OccupiedAsync(date, date, ct, carId: car.Value!.Id);
        var slots = Availability.FreeStarts(schedule.Catalog, schedule.Service, date, UtcNow, taken);
        return new AvailabilityDto(schedule.Service.Code, date, slots.Select(BookingQueries.Format).ToArray());
    }

    public async Task<Result<BookingConfirmationDto>> BookAsync(CreateTestDriveRequest r, CancellationToken ct)
    {
        if (!TimeOnly.TryParse(r.Time, out var start)) return Error.Validation(nameof(r.Time), Messages.TimeRequired);
        var car = await FindBookableCarAsync(r.CarSlug, ct);
        if (!car.IsSuccess) return car.Error!;

        var booking = new NewBooking(r.Date!.Value, start, r.Name, r.Email, r.Phone, RegNumber: "", r.Message);
        var displayName = $"{schedule.Service.Name} – {car.Value!.Title}";
        return await creator.CreateAsync(booking, schedule.Catalog, schedule.Service, displayName, Messages.TestDriveThanks,
            car.Value.Id, ct);
    }

    private async Task<Result<Car>> FindBookableCarAsync(string slug, CancellationToken ct)
    {
        var car = await db.Cars.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == slug && c.Status != CarStatus.Draft, ct);
        if (car is null) return Error.NotFound(Messages.CarNotFound);
        return car.Status == CarStatus.Available ? car : Error.Conflict(Messages.CarNotBookable, Messages.CarNotBookableDetail);
    }
}
