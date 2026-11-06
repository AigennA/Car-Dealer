namespace CarDealer.Api.Configuration;

// Every tunable value comes from configuration (appsettings / environment
// variables). Defaults here are safe fallbacks, not business decisions.

public sealed class DatabaseOptions
{
    public const string Section = "Database";
    /// <summary>"SqlServer" (production) or "Sqlite" (local dev / tests).</summary>
    public string Provider { get; set; } = "Sqlite";
    public bool IsSqlServer => Provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase);
}

public sealed class IdentityPolicyOptions
{
    public const string Section = "IdentityPolicy";
    public int RequiredPasswordLength { get; set; } = 12;
    public int MaxFailedAccessAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
}

public sealed class RateLimitOptions
{
    public const string Section = "RateLimits";
    public int FormsPerMinute { get; set; } = 5;
    public int LoginPerMinute { get; set; } = 10;
}

/// <summary>Names of the rate-limit policies used by [EnableRateLimiting].</summary>
public static class RateLimitPolicies
{
    public const string Forms = "forms";
    public const string Login = "login";
}

public sealed class CorsOptions
{
    public const string Section = "Cors";
    public string[] AllowedOrigins { get; set; } = [];
}

public sealed class AdminSeedOptions
{
    public const string Section = "Admin";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public sealed class ApiDocsOptions
{
    public const string Section = "ApiDocs";
    public bool Enabled { get; set; }
    public string Title { get; set; } = "Car Dealer API";
}

public sealed class DataFilesOptions
{
    public const string Section = "DataFiles";
    /// <summary>Relative to the app's base directory.</summary>
    public string Workshop { get; set; } = "Data/workshop.json";
    public string SeedCars { get; set; } = "Data/seed-cars.json";
    public string Business { get; set; } = "Data/business.json";

    public static string Resolve(string relative) => Path.Combine(AppContext.BaseDirectory, relative);
}
