using System.Data;
using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Workshop;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

/// <summary>What a customer filled in; the same for workshop bookings and test drives.</summary>
public sealed record NewBooking(DateOnly Date, TimeOnly Start, string Name, string Email, string Phone, string RegNumber, string? Message);

/// <summary>
/// Creates a booking: checks the slot is still free inside a serializable transaction (so two customers
/// cannot take the last one), stores it with a reference and a hashed secret, and sends the notifications.
/// Shared by the workshop booking and the test-drive booking, which differ only in the schedule
/// and in which existing bookings count as taken.
/// </summary>
public sealed class BookingCreator(
    AppDbContext db, TimeProvider clock, INotificationService notify, IReferenceGenerator references, BusinessInfo business)
{
    public async Task<Result<BookingConfirmationDto>> CreateAsync(
        NewBooking n, WorkshopCatalog schedule, WorkshopService service, string displayName, string thanksFormat,
        int? carId, CancellationToken ct)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            var utcNow = clock.GetUtcNow().UtcDateTime;
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var free = Availability.FreeStarts(schedule, service, n.Date, utcNow, await db.OccupiedAsync(n.Date, n.Date, ct, carId: carId));
            if (!free.Contains(n.Start))
                return Result<BookingConfirmationDto>.Failure(Error.Conflict(Messages.SlotTaken, Messages.SlotTakenDetail));

            var token = references.NewManageToken();
            var booking = new Booking
            {
                Reference = await UniqueReferenceAsync(ct),
                ServiceCode = service.Code, Date = n.Date, StartTime = n.Start, DurationMinutes = service.Minutes,
                Name = n.Name.Trim(), Email = n.Email.Trim(), Phone = n.Phone.Trim(),
                RegNumber = n.RegNumber, Message = n.Message?.Trim(), CarId = carId, CreatedAt = utcNow,
                ManageTokenHash = ManageToken.Hash(token),
            };
            db.Bookings.Add(booking);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            await notify.NewBookingAsync(booking, displayName, ct);
            await notify.BookingReceiptAsync(booking, displayName, business.ManageBookingLink(booking.Reference, token), ct);

            return new BookingConfirmationDto(booking.Reference, displayName, n.Date, BookingQueries.Format(n.Start), service.Minutes,
                string.Format(thanksFormat, booking.Reference), token);
        });
    }

    private async Task<string> UniqueReferenceAsync(CancellationToken ct)
    {
        string code;
        do code = references.Next();
        while (await db.Bookings.AnyAsync(b => b.Reference == code, ct));
        return code;
    }
}
