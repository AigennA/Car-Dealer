using CarDealer.Api.Domain;

namespace CarDealer.Api.Services;

/// <summary>
/// Tells staff that a customer request arrived. The default implementation
/// logs it; swap in an e-mail sender (SMTP, SendGrid, Azure Communication
/// Services…) by registering another implementation in Program.cs.
/// </summary>
public interface INotificationService
{
    Task NewLeadAsync(Lead lead, CancellationToken ct);
    Task NewTradeInAsync(TradeIn tradeIn, CancellationToken ct);
    Task NewBookingAsync(Booking booking, string serviceName, CancellationToken ct);
}

public class LogNotificationService(ILogger<LogNotificationService> log) : INotificationService
{
    // Note: no personal data (name, e-mail, message) is written to the logs.
    public Task NewLeadAsync(Lead lead, CancellationToken ct)
    {
        log.LogInformation("Nytt meddelande #{Id} (ämne: {Subject}, bil: {CarId})", lead.Id, lead.Subject ?? "–", lead.CarId);
        return Task.CompletedTask;
    }

    public Task NewTradeInAsync(TradeIn t, CancellationToken ct)
    {
        log.LogInformation("Ny inbytesförfrågan #{Id}: {Brand} {Model} {Year}", t.Id, t.Brand, t.Model, t.Year);
        return Task.CompletedTask;
    }

    public Task NewBookingAsync(Booking b, string serviceName, CancellationToken ct)
    {
        log.LogInformation("Ny bokning {Reference}: {Service} {Date} {Time}", b.Reference, serviceName, b.Date, b.StartTime);
        return Task.CompletedTask;
    }
}
