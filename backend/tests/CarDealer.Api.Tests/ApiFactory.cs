using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace CarDealer.Api.Tests;

/// <summary>
/// Boots the real API in memory against a throw-away SQLite database file,
/// seeded with the 24 cars and two staff accounts (Admin and Sales).
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@test.se";
    public const string AdminPassword = "Admin-Password-123";
    public const string SalesEmail = "saljare@test.se";
    public const string SalesPassword = "Sales-Password-123";

    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"cardealer-test-{Guid.NewGuid():N}.db");
    protected virtual int FormsPerMinute => 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Database:Provider", "Sqlite");
        builder.UseSetting("ConnectionStrings:Default", $"Data Source={_dbPath}");
        builder.UseSetting("Jwt:Key", "test-signing-key-that-is-long-enough-0123456789");
        builder.UseSetting("Admin:Email", AdminEmail);
        builder.UseSetting("Admin:Password", AdminPassword);
        builder.UseSetting("RateLimits:FormsPerMinute", FormsPerMinute.ToString());
        builder.UseSetting("RateLimits:LoginPerMinute", "1000");
        builder.UseSetting("ApiDocs:Enabled", "true");
    }

    /// <summary>Creates a Sales user (once) through the Identity APIs.</summary>
    public async Task EnsureSalesUserAsync()
    {
        using var scope = Services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<Microsoft.AspNetCore.Identity.IdentityUser>>();
        if (await users.FindByEmailAsync(SalesEmail) is not null) return;
        var u = new Microsoft.AspNetCore.Identity.IdentityUser { UserName = SalesEmail, Email = SalesEmail };
        await users.CreateAsync(u, SalesPassword);
        await users.AddToRoleAsync(u, Auth.Roles.Sales);
    }

    public async Task<HttpClient> ClientAsAsync(string email, string password)
    {
        var client = CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password));
        res.EnsureSuccessStatusCode();
        var login = await res.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.AccessToken);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        try { File.Delete(_dbPath); } catch (IOException) { /* best effort */ }
    }
}

public class StrictRateLimitFactory : ApiFactory
{
    protected override int FormsPerMinute => 2;
}
