using System.Text.Json;

namespace CarDealer.Api.Configuration;

/// <summary>
/// The dealer's business facts from data/business.json — the same file the
/// website reads (src/config/business.ts). Only what the API needs is mapped.
/// </summary>
public sealed record BusinessInfo(
    string Name, string LegalName, string Url, string ManageBookingPath,
    Dictionary<string, string[]> ShowroomHours, TestDriveSettings TestDrive, BusinessPolicies Policies)
{
    /// <summary>The customer's personal "Hantera bokning" link. The secret is in the #fragment, so it never reaches web-server logs.</summary>
    public string ManageBookingLink(string reference, string token) =>
        $"{Url.TrimEnd('/')}{ManageBookingPath}/?ref={Uri.EscapeDataString(reference)}#t={Uri.EscapeDataString(token)}";

    public static BusinessInfo Load(string path) =>
        JsonSerializer.Deserialize<BusinessInfo>(File.ReadAllText(path), new JsonSerializerOptions(JsonSerializerDefaults.Web))
        ?? throw new InvalidOperationException($"Could not read {path}");
}

public sealed record BusinessPolicies(int WarrantyMonths, int OpenPurchaseDays, int ResponseHours, int SoldVisibleDays);

/// <summary>
/// Test drives ("Boka provkörning"): they are booked in the showroom's opening hours
/// (<see cref="BusinessInfo.ShowroomHours"/>), one car at a time.
/// </summary>
public sealed record TestDriveSettings(int DurationMinutes, int SlotMinutes, int MinLeadMinutes, int BookingHorizonDays, int ChangeCutoffHours);
