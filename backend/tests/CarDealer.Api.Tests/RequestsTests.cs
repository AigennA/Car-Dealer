using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using CarDealer.Api.Domain;

namespace CarDealer.Api.Tests;

public class RequestsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static CreateLeadRequest Lead(string? carSlug = null) => new()
    {
        Name = "Anna Svensson", Email = "anna@example.se", Phone = "070-123 45 67",
        Subject = "provkorning", Message = "Hej! Kan jag provköra bilen på lördag?", CarSlug = carSlug,
    };

    [Fact]
    public async Task Contact_form_message_is_stored_and_linked_to_the_car()
    {
        var res = await _client.PostAsJsonAsync("/api/leads", Lead("bmw-x5-xdrive30d"));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var created = await res.Content.ReadFromJsonAsync<CreatedResponse>();
        Assert.Contains("Tack", created!.Message);

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var leads = await admin.GetFromJsonAsync<List<LeadDto>>("/api/leads");
        var lead = leads!.Single(l => l.Id == created.Id);
        Assert.Equal("BMW X5 xDrive30d", lead.CarTitle);
        Assert.Equal("New", lead.Status);
    }

    [Fact]
    public async Task Invalid_contact_form_returns_swedish_field_errors()
    {
        var res = await _client.PostAsJsonAsync("/api/leads", new CreateLeadRequest { Name = "", Email = "anna@", Message = "hej" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var body = await res.Content.ReadAsStringAsync();
        Assert.Contains("Fyll i ditt namn.", body);
        Assert.Contains("E-postadressen verkar inte stämma", body);
        Assert.Contains("minst 10 tecken", body);
    }

    [Fact]
    public async Task Honeypot_submissions_are_accepted_but_not_stored()
    {
        var spam = Lead();
        spam.Website = "http://spam.example";
        spam.Message = "Honeypot-meddelande som inte ska sparas";
        var res = await _client.PostAsJsonAsync("/api/leads", spam);
        Assert.Equal(HttpStatusCode.Accepted, res.StatusCode);

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var leads = await admin.GetFromJsonAsync<List<LeadDto>>("/api/leads");
        Assert.DoesNotContain(leads!, l => l.Message == spam.Message);
    }

    [Fact]
    public async Task Customer_requests_are_private()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.GetAsync("/api/leads")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.GetAsync("/api/tradeins")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Staff_can_move_a_request_through_the_workflow()
    {
        var created = await (await _client.PostAsJsonAsync("/api/leads", Lead())).Content.ReadFromJsonAsync<CreatedResponse>();
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);

        var patch = await admin.PatchAsJsonAsync($"/api/leads/{created!.Id}/status", new UpdateStatusRequest(RequestStatus.Closed));
        Assert.Equal(HttpStatusCode.NoContent, patch.StatusCode);
        var closed = await admin.GetFromJsonAsync<List<LeadDto>>("/api/leads?status=Closed");
        Assert.Contains(closed!, l => l.Id == created.Id);
    }

    [Fact]
    public async Task Trade_in_request_is_validated_and_stored()
    {
        var bad = await _client.PostAsJsonAsync("/api/tradeins", new CreateTradeInRequest
        {
            Name = "Ali", Email = "ali@example.se", Brand = "Volvo", Model = "V60", Year = 2099, Mileage = 8500,
        });
        Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
        Assert.Contains("Årsmodellen ska vara ett årtal", await bad.Content.ReadAsStringAsync());

        var ok = await _client.PostAsJsonAsync("/api/tradeins", new CreateTradeInRequest
        {
            Name = "Ali", Email = "ali@example.se", Brand = "Volvo", Model = "V60", Year = 2019, Mileage = 8500,
        });
        Assert.Equal(HttpStatusCode.Created, ok.StatusCode);

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var list = await admin.GetFromJsonAsync<List<TradeInDto>>("/api/tradeins");
        Assert.Contains(list!, t => t.Brand == "Volvo" && t.Mileage == 8500);

        var dash = await admin.GetFromJsonAsync<DashboardDto>("/api/dashboard");
        Assert.True(dash!.NewTradeIns >= 1);
        Assert.True(dash.CarsAvailable >= 24);
        Assert.True(dash.InventoryValue > 0);
    }
}

public class RateLimitTests(StrictRateLimitFactory factory) : IClassFixture<StrictRateLimitFactory>
{
    [Fact]
    public async Task Public_forms_are_rate_limited()
    {
        var client = factory.CreateClient();
        var lead = new CreateLeadRequest { Name = "Bot", Email = "bot@example.se", Message = "Massutskick av meddelanden" };
        var codes = new List<HttpStatusCode>();
        for (var i = 0; i < 3; i++) codes.Add((await client.PostAsJsonAsync("/api/leads", lead)).StatusCode);
        Assert.Equal([HttpStatusCode.Created, HttpStatusCode.Created, HttpStatusCode.TooManyRequests], codes);
    }
}
