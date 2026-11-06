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

    /// <summary>
    /// Confirmation to the customer with their personal "Hantera bokning" link
    /// (which is also what the QR code on the confirmation encodes).
    /// </summary>
    Task BookingReceiptAsync(Booking booking, string serviceName, string manageLink, CancellationToken ct);

    /// <summary>The customer cancelled or moved their booking on "Min bokning".</summary>
    Task BookingChangedAsync(Booking booking, string serviceName, CancellationToken ct);
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

    // The manage link is a secret, so it is never logged; a real e-mail sender puts it in the message.
    public Task BookingReceiptAsync(Booking b, string serviceName, string manageLink, CancellationToken ct)
    {
        log.LogInformation("Bokningsbekräftelse {Reference} skulle skickas till kunden (e-post ej konfigurerad)", b.Reference);
        return Task.CompletedTask;
    }

    public Task BookingChangedAsync(Booking b, string serviceName, CancellationToken ct)
    {
        log.LogInformation("Bokning {Reference} ändrad av kunden: {Status} {Date} {Time}", b.Reference, b.Status, b.Date, b.StartTime);
        return Task.CompletedTask;
    }
}
