using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;

namespace CarDealer.Api.Tests;

/// <summary>"Min bokning": customers find, move and cancel their own booking without an account.</summary>
public class MyBookingTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<BookingConfirmationDto> BookAsync(DateOnly date, string time = "10:00", string service = "service-liten")
    {
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings", new CreateBookingRequest
        {
            ServiceCode = service, Date = date, Time = time, Name = "Anna Svensson", Email = "Anna@Example.se",
            Phone = "070-123 45 67", RegNumber = "abc 12d",
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return (await res.Content.ReadFromJsonAsync<BookingConfirmationDto>())!;
    }

    private Task<HttpResponseMessage> FindAsync(string reference, string? token = null, string? contact = null) =>
        _client.PostAsJsonAsync("/api/workshop/bookings/manage", new BookingAccessRequest { Reference = reference, Token = token, Contact = contact });

    [Fact]
    public async Task Confirmation_contains_a_long_secret_for_the_personal_link()
    {
        var conf = await BookAsync(new DateOnly(2026, 11, 16));
        Assert.True(conf.ManageToken.Length >= 32);
        Assert.DoesNotContain('+', conf.ManageToken); // URL-safe
    }

    [Theory]
    [InlineData("token", "11:00")]
    [InlineData("anna@example.se", "12:00")] // case-insensitive
    [InlineData("ABC 12D", "13:00")]          // registration number, any spacing
    public async Task Booking_is_found_with_the_link_secret_email_or_registration_number(string how, string time)
    {
        var conf = await BookAsync(new DateOnly(2026, 11, 16), time);
        var res = how == "token" ? await FindAsync(conf.Reference, token: conf.ManageToken)
                                 : await FindAsync(conf.Reference.ToLowerInvariant(), contact: how);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var b = (await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.Equal(conf.Reference, b.Reference);
        Assert.Equal(time, b.Time);
        Assert.Equal("ABC12D", b.RegNumber);
        Assert.True(b.CanChange);
        // No e-mail or phone in the response.
        Assert.DoesNotContain("example.se", await res.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Wrong_details_and_unknown_numbers_give_the_same_answer()
    {
        var conf = await BookAsync(new DateOnly(2026, 11, 16), "14:00");
        var wrongToken = await FindAsync(conf.Reference, token: "not-the-token");
        var wrongEmail = await FindAsync(conf.Reference, contact: "someone@else.se");
        var unknown = await FindAsync("CD-ZZZZZZ", contact: "anna@example.se");
        var noProof = await FindAsync(conf.Reference);

        foreach (var res in new[] { wrongToken, wrongEmail, unknown, noProof })
        {
            Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
            Assert.Contains("Vi hittade ingen bokning med de uppgifterna.", await res.Content.ReadAsStringAsync());
        }
    }

    [Fact]
    public async Task Customer_can_cancel_and_the_slot_becomes_free()
    {
        var day = new DateOnly(2026, 11, 17);
        var conf = await BookAsync(day, "09:00");
        await BookAsync(day, "09:00"); // both bays taken

        var res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/cancel",
            new BookingAccessRequest { Reference = conf.Reference, Token = conf.ManageToken });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var b = (await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.Equal("Cancelled", b.Status);
        Assert.False(b.CanChange);

        var free = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=service-liten&date={day:yyyy-MM-dd}");
        Assert.Contains("09:00", free!.Slots);
    }

    [Fact]
    public async Task Customer_can_move_the_booking_and_its_own_slot_does_not_block_it()
    {
        var day = new DateOnly(2026, 11, 18);
        var conf = await BookAsync(day, "10:00");
        await BookAsync(day, "10:30"); // one bay taken 10:30–11:30 by someone else

        // Moving 30 min later overlaps the customer's own old time: allowed.
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new RescheduleBookingRequest { Reference = conf.Reference, Contact = "ABC12D", Date = day, Time = "10:30" });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var moved = (await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.Equal("10:30", moved.Time);

        var next = new DateOnly(2026, 11, 19);
        res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new RescheduleBookingRequest { Reference = conf.Reference, Token = conf.ManageToken, Date = next, Time = "15:00" });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal(next, (await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!.Date);
    }

    [Fact]
    public async Task Moving_to_a_full_slot_is_a_conflict()
    {
        var day = new DateOnly(2026, 11, 20);
        var conf = await BookAsync(day, "08:00");
        await BookAsync(day, "13:00");
        await BookAsync(day, "13:00");

        var res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new RescheduleBookingRequest { Reference = conf.Reference, Token = conf.ManageToken, Date = day, Time = "13:00" });
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Bookings_cannot_be_changed_online_close_to_the_appointment()
    {
        // Today (Mon 9 Nov, clock 07:00) at 14:00 is within the 24-hour cut-off.
        var conf = await BookAsync(new DateOnly(2026, 11, 9), "14:00", "dackbyte");
        var found = (await (await FindAsync(conf.Reference, token: conf.ManageToken)).Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.False(found.CanChange);

        var res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/cancel",
            new BookingAccessRequest { Reference = conf.Reference, Token = conf.ManageToken });
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
        Assert.Contains("24 timmar", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Staff_check_in_marks_the_customer_as_arrived()
    {
        var conf = await BookAsync(new DateOnly(2026, 11, 23), "11:00");
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await _client.PostAsJsonAsync("/api/workshop/bookings/check-in", new CheckInRequest(conf.Reference))).StatusCode);

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var res = await admin.PostAsJsonAsync("/api/workshop/bookings/check-in", new CheckInRequest(conf.Reference));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("Arrived", (await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!.Status);
    }

    [Fact]
    public void Personal_link_keeps_the_secret_in_the_fragment()
    {
        var business = Configuration.BusinessInfo.Load(Path.Combine(AppContext.BaseDirectory, "Data", "business.json"));
        var link = business.ManageBookingLink("CD-ABC234", "s3cret");
        Assert.EndsWith("/min-bokning/?ref=CD-ABC234#t=s3cret", link);
        Assert.StartsWith(business.Url, link);
    }
}
