using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

public interface ILeadService
{
    Task<CreatedResponse> CreateAsync(CreateLeadRequest request, CancellationToken ct);
    Task<IReadOnlyList<LeadDto>> ListAsync(RequestStatus? status, CancellationToken ct);
    Task<Result> SetStatusAsync(int id, RequestStatus status, CancellationToken ct);
}

public interface ITradeInService
{
    Task<Result<CreatedResponse>> CreateAsync(CreateTradeInRequest request, CancellationToken ct);
    Task<IReadOnlyList<TradeInDto>> ListAsync(RequestStatus? status, CancellationToken ct);
    Task<Result> SetStatusAsync(int id, RequestStatus status, CancellationToken ct);
}

/// <summary>Contact-form messages ("Kontakta oss", "Boka provkörning").</summary>
public sealed class LeadService(AppDbContext db, INotificationService notify, BusinessInfo business, TimeProvider clock) : ILeadService
{
    public async Task<CreatedResponse> CreateAsync(CreateLeadRequest r, CancellationToken ct)
    {
        int? carId = string.IsNullOrWhiteSpace(r.CarSlug)
            ? null
            : await db.Cars.Where(c => c.Slug == r.CarSlug).Select(c => (int?)c.Id).FirstOrDefaultAsync(ct);

        var lead = new Lead
        {
            Name = r.Name.Trim(), Email = r.Email.Trim(), Phone = r.Phone?.Trim(), Subject = r.Subject,
            Message = r.Message.Trim(), CarId = carId, CreatedAt = clock.GetUtcNow().UtcDateTime,
        };
        db.Leads.Add(lead);
        await db.SaveChangesAsync(ct);
        await notify.NewLeadAsync(lead, ct);
        return new CreatedResponse(lead.Id, string.Format(Messages.LeadThanks, business.Policies.ResponseHours));
    }

    public async Task<IReadOnlyList<LeadDto>> ListAsync(RequestStatus? status, CancellationToken ct) =>
        await db.Leads.AsNoTracking()
            .Where(l => status == null || l.Status == status)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LeadDto(l.Id, l.Name, l.Email, l.Phone, l.Subject, l.Message,
                l.Car != null ? l.Car.Slug : null, l.Car != null ? l.Car.Make + " " + l.Car.Model : null,
                l.Status.ToString(), l.CreatedAt))
            .ToListAsync(ct);

    public async Task<Result> SetStatusAsync(int id, RequestStatus status, CancellationToken ct)
    {
        var lead = await db.Leads.FindAsync([id], ct);
        if (lead is null) return Error.NotFound(Messages.NotFound);
        lead.Status = status;
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>Trade-in valuation requests ("Begär värdering").</summary>
public sealed class TradeInService(AppDbContext db, INotificationService notify, BusinessInfo business, TimeProvider clock) : ITradeInService
{
    public async Task<Result<CreatedResponse>> CreateAsync(CreateTradeInRequest r, CancellationToken ct)
    {
        var now = clock.GetUtcNow();
        var maxYear = now.Year + 1;
        if (r.Year > maxYear)
            return Error.Validation(nameof(r.Year), string.Format(Messages.TradeInYearRange, null, Limits.TradeInMinYear, maxYear));

        var t = new TradeIn
        {
            Name = r.Name.Trim(), Email = r.Email.Trim(), Phone = r.Phone?.Trim(), Brand = r.Brand.Trim(),
            Model = r.Model.Trim(), Year = r.Year, Mileage = r.Mileage, Message = r.Message?.Trim(),
            CreatedAt = now.UtcDateTime,
        };
        db.TradeIns.Add(t);
        await db.SaveChangesAsync(ct);
        await notify.NewTradeInAsync(t, ct);
        return new CreatedResponse(t.Id, string.Format(Messages.TradeInThanks, business.Policies.ResponseHours));
    }

    public async Task<IReadOnlyList<TradeInDto>> ListAsync(RequestStatus? status, CancellationToken ct) =>
        await db.TradeIns.AsNoTracking()
            .Where(t => status == null || t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TradeInDto(t.Id, t.Name, t.Email, t.Phone, t.Brand, t.Model, t.Year, t.Mileage,
                t.Message, t.Status.ToString(), t.CreatedAt))
            .ToListAsync(ct);

    public async Task<Result> SetStatusAsync(int id, RequestStatus status, CancellationToken ct)
    {
        var t = await db.TradeIns.FindAsync([id], ct);
        if (t is null) return Error.NotFound(Messages.NotFound);
        t.Status = status;
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
