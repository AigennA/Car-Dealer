using System.Text.Json;

namespace CarDealer.Api.Configuration;

/// <summary>
/// The dealer's business facts from data/business.json — the same file the
/// website reads (src/config/business.ts). Only what the API needs is mapped.
/// </summary>
public sealed record BusinessInfo(string Name, string LegalName, BusinessPolicies Policies)
{
    public static BusinessInfo Load(string path) =>
        JsonSerializer.Deserialize<BusinessInfo>(File.ReadAllText(path), new JsonSerializerOptions(JsonSerializerDefaults.Web))
        ?? throw new InvalidOperationException($"Could not read {path}");
}

public sealed record BusinessPolicies(int WarrantyMonths, int OpenPurchaseDays, int ResponseHours);
