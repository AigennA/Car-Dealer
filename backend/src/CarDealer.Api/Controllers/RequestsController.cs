using CarDealer.Api.Auth;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Controllers;

/// <summary>Contact-form messages ("Kontakta oss", "Boka provkörning").</summary>
[ApiController]
[Route("api/leads")]
[Produces("application/json")]
public class LeadsController(AppDbContext db, INotificationService notify) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("forms")]
    public async Task<ActionResult<CreatedResponse>> Create(CreateLeadRequest req, CancellationToken ct)
    {
        // Honeypot filled in → pretend success, store nothing.
        if (!string.IsNullOrEmpty(req.Website)) return Accepted(new CreatedResponse(0, "Tack för ditt meddelande!"));

        int? carId = null;
        if (!string.IsNullOrWhiteSpace(req.CarSlug))
            carId = await db.Cars.Where(c => c.Slug == req.CarSlug).Select(c => (int?)c.Id).FirstOrDefaultAsync(ct);

        var lead = new Lead
        {
            Name = req.Name.Trim(), Email = req.Email.Trim(), Phone = req.Phone?.Trim(),
            Subject = req.Subject, Message = req.Message.Trim(), CarId = carId,
        };
        db.Leads.Add(lead);
        await db.SaveChangesAsync(ct);
        await notify.NewLeadAsync(lead, ct);
        return StatusCode(201, new CreatedResponse(lead.Id, "Tack för ditt meddelande! Vi återkommer inom 24 timmar."));
    }

    [HttpGet]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<List<LeadDto>>> List([FromQuery] RequestStatus? status, CancellationToken ct) =>
        await db.Leads.AsNoTracking()
            .Where(l => status == null || l.Status == status)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LeadDto(l.Id, l.Name, l.Email, l.Phone, l.Subject, l.Message,
                l.Car != null ? l.Car.Slug : null, l.Car != null ? l.Car.Make + " " + l.Car.Model : null,
                l.Status.ToString(), l.CreatedAt))
            .ToListAsync(ct);

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateStatusRequest req, CancellationToken ct)
    {
        var lead = await db.Leads.FindAsync([id], ct);
        if (lead is null) return NotFound();
        lead.Status = req.Status;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

/// <summary>Trade-in valuation requests ("Begär värdering").</summary>
[ApiController]
[Route("api/tradeins")]
[Produces("application/json")]
public class TradeInsController(AppDbContext db, INotificationService notify, TimeProvider clock) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("forms")]
    public async Task<ActionResult<CreatedResponse>> Create(CreateTradeInRequest req, CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(req.Website)) return Accepted(new CreatedResponse(0, "Tack för din förfrågan!"));
        if (req.Year > clock.GetUtcNow().Year + 1)
        {
            ModelState.AddModelError(nameof(req.Year), $"Årsmodellen ska vara ett årtal mellan 1950 och {clock.GetUtcNow().Year + 1}.");
            return ValidationProblem(ModelState);
        }

        var t = new TradeIn
        {
            Name = req.Name.Trim(), Email = req.Email.Trim(), Phone = req.Phone?.Trim(),
            Brand = req.Brand.Trim(), Model = req.Model.Trim(), Year = req.Year, Mileage = req.Mileage,
            Message = req.Message?.Trim(),
        };
        db.TradeIns.Add(t);
        await db.SaveChangesAsync(ct);
        await notify.NewTradeInAsync(t, ct);
        return StatusCode(201, new CreatedResponse(t.Id, "Tack för din förfrågan! Vi återkommer med en värdering inom 24 timmar."));
    }

    [HttpGet]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<List<TradeInDto>>> List([FromQuery] RequestStatus? status, CancellationToken ct) =>
        await db.TradeIns.AsNoTracking()
            .Where(t => status == null || t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TradeInDto(t.Id, t.Name, t.Email, t.Phone, t.Brand, t.Model, t.Year, t.Mileage,
                t.Message, t.Status.ToString(), t.CreatedAt))
            .ToListAsync(ct);

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IActionResult> SetStatus(int id, UpdateStatusRequest req, CancellationToken ct)
    {
        var t = await db.TradeIns.FindAsync([id], ct);
        if (t is null) return NotFound();
        t.Status = req.Status;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
