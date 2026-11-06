using CarDealer.Api.Auth;
using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Domain;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CarDealer.Api.Controllers;

/// <summary>Contact-form messages ("Kontakta oss", "Boka provkörning").</summary>
[ApiController]
[Route("api/leads")]
[Produces("application/json")]
public class LeadsController(ILeadService leads) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<CreatedResponse>> Create(CreateLeadRequest request, CancellationToken ct)
    {
        if (Honeypot.IsTriggered(request.Website)) return Accepted(Honeypot.Response);
        return StatusCode(StatusCodes.Status201Created, await leads.CreateAsync(request, ct));
    }

    [HttpGet]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IReadOnlyList<LeadDto>> List([FromQuery] RequestStatus? status, CancellationToken ct) =>
        await leads.ListAsync(status, ct);

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateStatusRequest request, CancellationToken ct) =>
        this.ToActionResult(await leads.SetStatusAsync(id, request.Status, ct));
}

/// <summary>Trade-in valuation requests ("Begär värdering").</summary>
[ApiController]
[Route("api/tradeins")]
[Produces("application/json")]
public class TradeInsController(ITradeInService tradeIns) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.Forms)]
    public async Task<ActionResult<CreatedResponse>> Create(CreateTradeInRequest request, CancellationToken ct)
    {
        if (Honeypot.IsTriggered(request.Website)) return Accepted(Honeypot.Response);
        return this.ToActionResult(await tradeIns.CreateAsync(request, ct),
            created => StatusCode(StatusCodes.Status201Created, created));
    }

    [HttpGet]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IReadOnlyList<TradeInDto>> List([FromQuery] RequestStatus? status, CancellationToken ct) =>
        await tradeIns.ListAsync(status, ct);

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateStatusRequest request, CancellationToken ct) =>
        this.ToActionResult(await tradeIns.SetStatusAsync(id, request.Status, ct));
}

/// <summary>
/// Bot trap: a hidden "website" field real users leave empty. Bots that fill
/// it get a normal-looking success so they don't adapt, and nothing is stored.
/// </summary>
internal static class Honeypot
{
    public static bool IsTriggered(string? value) => !string.IsNullOrEmpty(value);
    public static readonly CreatedResponse Response = new(0, "Tack!");
}
