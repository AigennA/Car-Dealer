using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using CarDealer.Api.Controllers;
using CarDealer.Api.Workshop;

namespace CarDealer.Api.Tests;

/// <summary>Pure scheduling rules — no HTTP, no database.</summary>
public class AvailabilityRulesTests
{
    private static readonly WorkshopCatalog Catalog = WorkshopCatalog.Load(Path.Combine(AppContext.BaseDirectory, "Data", "workshop.json"));
    private static readonly WorkshopService Hour = new("x", "verkstad", "Test", "", 60, 100);
    // Monday 9 Nov 2026 07:00 Stockholm = 06:00 UTC
    private static readonly DateTime Now = new(2026, 11, 9, 6, 0, 0, DateTimeKind.Utc);
    private static readonly DateOnly Monday = new(2026, 11, 9);

    [Fact]
    public void Slots_respect_opening_hours_and_lead_time()
    {
        var slots = Availability.FreeStarts(Catalog, Hour, Monday, Now, []);
        // Opens 08:00 but lead time is 2 h from 07:00 → first slot 09:00; a 60-min job must end by 17:00.
        Assert.Equal(new TimeOnly(9, 0), slots.First());
        Assert.Equal(new TimeOnly(16, 0), slots.Last());
    }

    [Fact]
    public void Friday_closes_earlier_and_weekends_are_closed()
    {
        Assert.Equal(new TimeOnly(15, 0), Availability.FreeStarts(Catalog, Hour, new DateOnly(2026, 11, 13), Now, []).Last());
        Assert.Empty(Availability.FreeStarts(Catalog, Hour, new DateOnly(2026, 11, 14), Now, []));
        Assert.Empty(Availability.FreeStarts(Catalog, Hour, new DateOnly(2026, 11, 15), Now, []));
    }

    [Fact]
    public void Past_days_and_days_beyond_the_horizon_are_not_bookable()
    {
        Assert.Empty(Availability.FreeStarts(Catalog, Hour, Monday.AddDays(-7), Now, []));
        Assert.Empty(Availability.FreeStarts(Catalog, Hour, Monday.AddDays(Catalog.BookingHorizonDays + 1), Now, []));
    }

    [Fact]
    public void A_slot_is_full_when_all_bays_are_taken_at_any_point_of_the_job()
    {
        // Two 2-hour jobs from 10:00 fill both bays 10:00–12:00.
        var taken = new[] { new Occupied(new(10, 0), 120), new Occupied(new(10, 0), 120) };
        var slots = Availability.FreeStarts(Catalog, Hour, Monday, Now, taken);
        Assert.DoesNotContain(new TimeOnly(9, 30), slots); // would overlap 10:00–10:30
        Assert.DoesNotContain(new TimeOnly(11, 0), slots);
        Assert.Contains(new TimeOnly(9, 0), slots);         // ends exactly at 10:00
        Assert.Contains(new TimeOnly(12, 0), slots);
    }

    [Fact]
    public void One_booking_leaves_the_second_bay_free()
    {
        var slots = Availability.FreeStarts(Catalog, Hour, Monday, Now, [new Occupied(new(10, 0), 60)]);
        Assert.Contains(new TimeOnly(10, 0), slots);
    }

    [Theory]
    [InlineData(" abc 12d ", "ABC12D")]
    [InlineData("ABC123", "ABC123")]
    public void Registration_numbers_are_normalised(string input, string expected) =>
        Assert.Equal(expected, Domain.RegistrationNumber.Normalize(input));

    [Fact]
    public void Shared_catalog_has_both_categories()
    {
        Assert.Contains(Catalog.Services, s => s.Category == "verkstad");
        Assert.Contains(Catalog.Services, s => s.Category == "besiktning");
        Assert.All(Catalog.Services, s => Assert.Equal(0, s.Minutes % Catalog.SlotMinutes));
    }
}

public class WorkshopApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();
    private static readonly DateOnly Tuesday = new(2026, 11, 10);

    private static CreateBookingRequest Booking(string time = "10:00", string service = "service-stor", DateOnly? date = null) => new()
    {
        ServiceCode = service, Date = date ?? Tuesday, Time = time, Name = "Anna Svensson", Email = "anna@example.se",
        Phone = "070-123 45 67", RegNumber = "abc 12d", Message = "Det gnisslar från bromsarna.",
    };

    [Fact]
    public async Task Catalog_is_public()
    {
        var catalog = await _client.GetFromJsonAsync<WorkshopCatalog>("/api/workshop/services");
        Assert.Contains(catalog!.Services, s => s.Code == "besiktning-partner");
    }

    [Fact]
    public async Task Days_list_skips_weekends()
    {
        var days = await _client.GetFromJsonAsync<List<BookableDayDto>>("/api/workshop/days?service=dackbyte");
        Assert.NotEmpty(days!);
        Assert.DoesNotContain(days!, d => d.Date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday);
        Assert.Equal(new DateOnly(2026, 11, 9), days![0].Date);
    }

    [Fact]
    public async Task Booking_succeeds_and_returns_a_reference()
    {
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("08:00", "dackbyte"));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var conf = await res.Content.ReadFromJsonAsync<BookingConfirmationDto>();
        Assert.Matches("^CD-[A-Z2-9]{6}$", conf!.Reference);
        Assert.Equal("Däckbyte", conf.ServiceName);

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var list = await admin.GetFromJsonAsync<List<BookingDto>>("/api/workshop/bookings?from=2026-11-10&to=2026-11-10");
        var b = list!.Single(x => x.Reference == conf.Reference);
        Assert.Equal("ABC12D", b.RegNumber);
        Assert.Equal("08:00", b.Time);
    }

    [Fact]
    public async Task Third_booking_in_the_same_slot_is_rejected_because_two_bays_are_full()
    {
        var day = new DateOnly(2026, 11, 11);
        Assert.Equal(HttpStatusCode.Created, (await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("13:00", date: day))).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("13:00", date: day))).StatusCode);
        var third = await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("13:00", date: day));
        Assert.Equal(HttpStatusCode.Conflict, third.StatusCode);
        Assert.Contains("Tiden är inte längre ledig.", await third.Content.ReadAsStringAsync());

        var free = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=service-stor&date={day:yyyy-MM-dd}");
        Assert.DoesNotContain("13:00", free!.Slots);
    }

    [Fact]
    public async Task Booking_a_time_outside_opening_hours_is_rejected()
    {
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("16:30")); // 2 h job would end 18:30
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Invalid_booking_returns_swedish_errors()
    {
        var bad = Booking();
        bad.RegNumber = "12345";
        bad.Phone = "";
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings", bad);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var body = await res.Content.ReadAsStringAsync();
        Assert.Contains("Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.", body);
        Assert.Contains("Fyll i ditt telefonnummer", body);
    }

    [Fact]
    public async Task Unknown_service_is_404_and_bookings_list_is_private()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/api/workshop/availability?service=finns-inte&date=2026-11-10")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.GetAsync("/api/workshop/bookings")).StatusCode);
    }

    [Fact]
    public async Task Cancelled_booking_frees_the_slot()
    {
        var day = new DateOnly(2026, 11, 12);
        await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("09:00", date: day));
        var second = await (await _client.PostAsJsonAsync("/api/workshop/bookings", Booking("09:00", date: day))).Content.ReadFromJsonAsync<BookingConfirmationDto>();

        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var id = (await admin.GetFromJsonAsync<List<BookingDto>>("/api/workshop/bookings"))!.Single(b => b.Reference == second!.Reference).Id;
        var patch = await admin.PatchAsJsonAsync($"/api/workshop/bookings/{id}/status", new UpdateBookingStatusRequest(Domain.BookingStatus.Cancelled));
        Assert.Equal(HttpStatusCode.NoContent, patch.StatusCode);

        var free = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=service-stor&date={day:yyyy-MM-dd}");
        Assert.Contains("09:00", free!.Slots);
    }
}

public class DomainRulesTests
{
    [Theory]
    [InlineData("ABC123", true)]
    [InlineData("abc 12d", true)]
    [InlineData("AB1234", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void Registration_number_validation(string? input, bool expected) =>
        Assert.Equal(expected, Domain.RegistrationNumber.IsValid(input));

    [Fact]
    public void Reference_codes_are_unambiguous()
    {
        var generator = new Services.RandomReferenceGenerator();
        var codes = Enumerable.Range(0, 200).Select(_ => generator.Next()).ToList();
        Assert.All(codes, c => Assert.Matches("^CD-[A-HJ-NP-Z2-9]{6}$", c));
        Assert.True(codes.Distinct().Count() > 190);
    }

    [Fact]
    public void Shared_business_file_is_read_by_the_api()
    {
        var business = Configuration.BusinessInfo.Load(Path.Combine(AppContext.BaseDirectory, "Data", "business.json"));
        Assert.True(business.Policies.ResponseHours > 0);
        Assert.False(string.IsNullOrWhiteSpace(business.LegalName));
    }
}
