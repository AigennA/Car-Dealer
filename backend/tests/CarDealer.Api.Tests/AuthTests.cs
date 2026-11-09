using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;

namespace CarDealer.Api.Tests;

public class AuthTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Admin_from_configuration_can_log_in_and_gets_a_role_claim()
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(ApiFactory.AdminEmail, ApiFactory.AdminPassword));
        res.EnsureSuccessStatusCode();
        var login = await res.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.Contains("Admin", login!.Roles);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(login.AccessToken);
        Assert.True(jwt.ValidTo > factory.Clock.GetUtcNow().UtcDateTime); // valid on the API's own clock
    }

    [Fact]
    public async Task Wrong_password_gives_the_same_message_as_unknown_user()
    {
        var wrong = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(ApiFactory.AdminEmail, "fel-losenord"));
        var unknown = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("ingen@test.se", "fel-losenord"));
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        // No user enumeration: identical error text.
        Assert.Contains("Fel e-post eller lösenord.", await wrong.Content.ReadAsStringAsync());
        Assert.Contains("Fel e-post eller lösenord.", await unknown.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Account_is_locked_after_five_wrong_passwords()
    {
        await factory.EnsureSalesUserAsync();
        for (var i = 0; i < 5; i++)
            await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(ApiFactory.SalesEmail, "fel-losenord"));
        var correct = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(ApiFactory.SalesEmail, ApiFactory.SalesPassword));
        Assert.Equal(HttpStatusCode.Unauthorized, correct.StatusCode);
    }

    [Fact]
    public async Task Tampered_token_is_rejected()
    {
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var token = admin.DefaultRequestHeaders.Authorization!.Parameter!;
        _client.DefaultRequestHeaders.Authorization = new("Bearer", token[..^4] + "AAAA");
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Health_and_security_headers()
    {
        var res = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("nosniff", res.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", res.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task OpenApi_document_is_published()
    {
        var doc = await _client.GetStringAsync("/openapi/v1.json");
        Assert.Contains("/api/cars", doc);
        Assert.Contains("/api/leads", doc);
    }
}
