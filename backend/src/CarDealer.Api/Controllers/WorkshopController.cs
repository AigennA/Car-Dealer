using System.Data;
using System.Security.Cryptography;
using CarDealer.Api.Auth;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Services;
using CarDealer.Api.Workshop;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Controllers;

/// <summary>Workshop ("Verkstad") and inspection ("Besiktning") services and online booking.</summary>
[ApiController]
[Route("api/workshop")]
[Produces("application/json")]
public class WorkshopController(AppDbContext db, WorkshopCatalog catalog, TimeProvider clock, INotificationService notify) : ControllerBase
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

    /// <summary>Service catalogue and opening hours.</summary>
    [HttpGet("services")]
    public ActionResult<WorkshopCatalog> Services() => catalog;

    /// <summary>Free start times for a service on a given day.</summary>
    [HttpGet("availability")]
    public async Task<ActionResult<AvailabilityDto>> GetAvailability([FromQuery] string service, [FromQuery] DateOnly date, CancellationToken ct)
    {
        var svc = catalog.Find(service);
        if (svc is null) return Problem(statusCode: 404, title: "Tjänsten finns inte.");
        var slots = await FreeStartsAsync(svc, date, ct);
        return new AvailabilityDto(svc.Code, date, slots.Select(t => t.ToString("HH:mm")).ToArray());
    }

    /// <summary>The coming days and how many free start times each has — for the date picker.</summary>
    [HttpGet("days")]
    public async Task<ActionResult<List<BookableDayDto>>> Days([FromQuery] string service, CancellationToken ct)
    {
        var svc = catalog.Find(service);
        if (svc is null) return Problem(statusCode: 404, title: "Tjänsten finns inte.");
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(clock.GetUtcNow().UtcDateTime, catalog.Zone));
        var last = today.AddDays(catalog.BookingHorizonDays);

        var taken = await ActiveBookings().Where(b => b.Date >= today && b.Date <= last)
            .Select(b => new { b.Date, b.StartTime, b.DurationMinutes }).ToListAsync(ct);

        var days = new List<BookableDayDto>();
        for (var d = today; d <= last; d = d.AddDays(1))
        {
            if (catalog.HoursFor(d) is null) continue;
            var free = Availability.FreeStarts(catalog, svc, d, clock.GetUtcNow().UtcDateTime,
                taken.Where(t => t.Date == d).Select(t => new Occupied(t.StartTime, t.DurationMinutes)));
            days.Add(new BookableDayDto(d, free.Count));
        }
        return days;
    }

    [HttpPost("bookings")]
    [EnableRateLimiting("forms")]
    public async Task<ActionResult<BookingConfirmationDto>> Book(CreateBookingRequest req, CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(req.Website))
            return Accepted(new BookingConfirmationDto("", "", default, "", 0, "Tack för din bokning!"));

        var svc = catalog.Find(req.ServiceCode);
        if (svc is null) ModelState.AddModelError(nameof(req.ServiceCode), "Välj en tjänst.");
        if (!TimeOnly.TryParse(req.Time, out var start)) ModelState.AddModelError(nameof(req.Time), "Välj en tid.");
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var date = req.Date!.Value;

        // Re-check the slot inside a serializable transaction so two customers
        // cannot take the last bay at the same time.
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var free = await FreeStartsAsync(svc!, date, ct);
            if (!free.Contains(start))
                return (ActionResult<BookingConfirmationDto>)Problem(statusCode: 409,
                    title: "Tiden är inte längre ledig.",
                    detail: "Någon hann boka tiden före dig. Välj en annan tid.");

            var booking = new Booking
            {
                Reference = await NewReferenceAsync(ct),
                ServiceCode = svc!.Code, Date = date, StartTime = start, DurationMinutes = svc.Minutes,
                Name = req.Name.Trim(), Email = req.Email.Trim(), Phone = req.Phone.Trim(),
                RegNumber = NormalizeReg(req.RegNumber), Message = req.Message?.Trim(),
            };
            db.Bookings.Add(booking);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            await notify.NewBookingAsync(booking, svc.Name, ct);

            return StatusCode(201, new BookingConfirmationDto(booking.Reference, svc.Name, date, start.ToString("HH:mm"),
                svc.Minutes, $"Tack! Din tid är bokad. Bokningsnummer {booking.Reference}."));
        });
    }

    [HttpGet("bookings")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<List<BookingDto>>> List([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var q = db.Bookings.AsNoTracking();
        if (from is { } f) q = q.Where(b => b.Date >= f);
        if (to is { } t) q = q.Where(b => b.Date <= t);
        var list = await q.OrderBy(b => b.Date).ThenBy(b => b.StartTime).ToListAsync(ct);
        return list.Select(b => new BookingDto(b.Id, b.Reference, b.ServiceCode, catalog.Find(b.ServiceCode)?.Name ?? b.ServiceCode,
            b.Date, b.StartTime.ToString("HH:mm"), b.DurationMinutes, b.Name, b.Email, b.Phone, b.RegNumber, b.Message,
            b.Status.ToString(), b.CreatedAt)).ToList();
    }

    [HttpPatch("bookings/{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateBookingStatusRequest req, CancellationToken ct)
    {
        var b = await db.Bookings.FindAsync([id], ct);
        if (b is null) return NotFound();
        b.Status = req.Status;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private IQueryable<Booking> ActiveBookings() => db.Bookings.Where(b => b.Status != BookingStatus.Cancelled);

    private async Task<IReadOnlyList<TimeOnly>> FreeStartsAsync(WorkshopService svc, DateOnly date, CancellationToken ct)
    {
        var taken = await ActiveBookings().Where(b => b.Date == date)
            .Select(b => new Occupied(b.StartTime, b.DurationMinutes)).ToListAsync(ct);
        return Availability.FreeStarts(catalog, svc, date, clock.GetUtcNow().UtcDateTime, taken);
    }

    private async Task<string> NewReferenceAsync(CancellationToken ct)
    {
        while (true)
        {
            var code = "CD-" + new string(Enumerable.Range(0, 6).Select(_ => Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]).ToArray());
            if (!await db.Bookings.AnyAsync(b => b.Reference == code, ct)) return code;
        }
    }

    /// <summary>" abc 12d " → "ABC12D".</summary>
    public static string NormalizeReg(string reg) => new(reg.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
}
