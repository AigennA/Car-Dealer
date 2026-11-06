using CarDealer.Api.Auth;
using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Services;
using CarDealer.Api.Workshop;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CarDealer.Api.Controllers;

/// <summary>Workshop ("Verkstad") and inspection ("Besiktning") services and online booking.</summary>
[ApiController]
[Route("api/workshop")]
[Produces("application/json")]
public class WorkshopController(WorkshopCatalog catalog, IBookingService bookings, IBookingManagementService manage) : ControllerBase
{
    [HttpGet("services")]
    public WorkshopCatalog Services() => catalog;

    [HttpGet("availability")]
    public async Task<ActionResult<AvailabilityDto>> Availability([FromQuery] string service, [FromQuery] DateOnly date, CancellationToken ct) =>
        this.ToActionResult(await bookings.AvailabilityAsync(service, date, ct));

    [HttpGet("days")]
    public async Task<ActionResult<IReadOnlyList<BookableDayDto>>> Days([FromQuery] string service, CancellationToken ct) =>
        this.ToActionResult(await bookings.BookableDaysAsync(service, ct));

    [HttpPost("bookings")]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<BookingConfirmationDto>> Book(CreateBookingRequest request, CancellationToken ct)
    {
        if (Honeypot.IsTriggered(request.Website)) return Accepted(Honeypot.Response);
        return this.ToActionResult(await bookings.BookAsync(request, ct),
            confirmation => StatusCode(StatusCodes.Status201Created, confirmation));
    }

    [HttpGet("bookings")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IReadOnlyList<BookingDto>> List([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct) =>
        await bookings.ListAsync(from, to, ct);

    [HttpPatch("bookings/{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateBookingStatusRequest request, CancellationToken ct) =>
        this.ToActionResult(await bookings.SetStatusAsync(id, request.Status, ct));

    // "Min bokning" – POST so the secret and contact details never end up in URLs or logs.
    // Rate-limited like the forms, which also makes guessing booking numbers impractical.

    [HttpPost("bookings/manage")]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<ManagedBookingDto>> Find(BookingAccessRequest access, CancellationToken ct) =>
        this.ToActionResult(await manage.FindAsync(access, ct));

    [HttpPost("bookings/manage/cancel")]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<ManagedBookingDto>> Cancel(BookingAccessRequest access, CancellationToken ct) =>
        this.ToActionResult(await manage.CancelAsync(access, ct));

    [HttpPost("bookings/manage/reschedule")]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<ManagedBookingDto>> Reschedule(RescheduleBookingRequest request, CancellationToken ct) =>
        this.ToActionResult(await manage.RescheduleAsync(request, ct));

    [HttpPost("bookings/check-in")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<ManagedBookingDto>> CheckIn(CheckInRequest request, CancellationToken ct) =>
        this.ToActionResult(await manage.CheckInAsync(request.Reference, ct));
}
