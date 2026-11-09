using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Configuration;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CarDealer.Api.Controllers;

/// <summary>Test drives ("Boka provkörning"). Changing or cancelling one is done through "Min bokning" (WorkshopController).</summary>
[ApiController]
[Route("api/testdrive")]
[Produces("application/json")]
public class TestDriveController(ITestDriveService testDrives) : ControllerBase
{
    [HttpGet("days")]
    public async Task<ActionResult<IReadOnlyList<BookableDayDto>>> Days([FromQuery] string car, CancellationToken ct) =>
        this.ToActionResult(await testDrives.BookableDaysAsync(car, ct));

    [HttpGet("availability")]
    public async Task<ActionResult<AvailabilityDto>> Availability([FromQuery] string car, [FromQuery] DateOnly date, CancellationToken ct) =>
        this.ToActionResult(await testDrives.AvailabilityAsync(car, date, ct));

    [HttpPost("bookings")]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<BookingConfirmationDto>> Book(CreateTestDriveRequest request, CancellationToken ct)
    {
        if (Honeypot.IsTriggered(request.Website)) return Accepted(Honeypot.Response);
        return this.ToActionResult(await testDrives.BookAsync(request, ct),
            confirmation => StatusCode(StatusCodes.Status201Created, confirmation));
    }
}
