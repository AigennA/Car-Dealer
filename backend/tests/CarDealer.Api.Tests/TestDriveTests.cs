using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using CarDealer.Api.Domain;

namespace CarDealer.Api.Tests;

/// <summary>
/// "Boka provkörning": one car at a time, in the showroom's opening hours (Mon–Fri 09–18, Sat 10–15).
/// The test clock is Monday 9 November 2026, 07:00 in Stockholm; the lead time is 2 hours.
/// </summary>
public class TestDriveTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();
    private static readonly DateOnly Monday = new(2026, 11, 9);
    private static readonly DateOnly Tuesday = new(2026, 11, 10);
    private static readonly DateOnly Wednesday = new(2026, 11, 11);
    private static readonly DateOnly Saturday = new(2026, 11, 14);
    private static readonly DateOnly Sunday = new(2026, 11, 15);
    private static int _cars;

    private async Task<HttpClient> AdminAsync() => await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);

    private async Task<CarDto> NewCarAsync(CarStatus status = CarStatus.Available)
    {
        var admin = await AdminAsync();
        var res = await admin.PostAsJsonAsync("/api/cars", new CarUpsertRequest
        {
            Make = $"Provbil{Interlocked.Increment(ref _cars)}", Model = "X", Year = 2022, Mileage = 1000, Fuel = "Bensin",
            Transmission = "Automat", Drivetrain = "FWD", BodyType = "Kombi", Color = "Grå", Price = 300000, Status = status,
            Images = ["https://images.unsplash.com/photo-1?w=800&h=600&fit=crop"],
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return (await res.Content.ReadFromJsonAsync<CarDto>())!;
    }

    private static CreateTestDriveRequest Request(string car, DateOnly date, string time) => new()
    {
        CarSlug = car, Date = date, Time = time, Name = "Anna Svensson", Email = "Anna@Example.se", Phone = "070-123 45 67",
    };

    private Task<HttpResponseMessage> BookAsync(string car, DateOnly date, string time) =>
        _client.PostAsJsonAsync("/api/testdrive/bookings", Request(car, date, time));

    private async Task<BookingConfirmationDto> BookOkAsync(string car, DateOnly date, string time)
    {
        var res = await BookAsync(car, date, time);
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return (await res.Content.ReadFromJsonAsync<BookingConfirmationDto>())!;
    }

    private async Task<string[]> SlotsAsync(string car, DateOnly date) =>
        (await _client.GetFromJsonAsync<AvailabilityDto>($"/api/testdrive/availability?car={car}&date={date:yyyy-MM-dd}"))!.Slots;

    [Fact]
    public async Task Slots_follow_the_showroom_hours_and_the_lead_time()
    {
        var car = await NewCarAsync();
        var monday = await SlotsAsync(car.Slug, Monday);       // clock 07:00 + 2 h lead -> first 09:00, 30-min visits until 18:00
        Assert.Equal("09:00", monday.First());
        Assert.Equal("17:30", monday.Last());
        Assert.Equal(18, monday.Length);

        var saturday = await SlotsAsync(car.Slug, Saturday);  // Sat 10-15
        Assert.Equal(["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"], saturday);
        Assert.Empty(await SlotsAsync(car.Slug, Sunday));     // closed
    }

    [Fact]
    public async Task Days_list_the_open_days_including_saturday_but_not_sunday()
    {
        var car = await NewCarAsync();
        var days = await _client.GetFromJsonAsync<List<BookableDayDto>>($"/api/testdrive/days?car={car.Slug}");
        Assert.Equal(Monday, days![0].Date);
        Assert.Contains(days, d => d.Date == Saturday && d.FreeSlots == 10);
        Assert.DoesNotContain(days, d => d.Date == Sunday);
        Assert.True(days.Last().Date <= Monday.AddDays(14));   // horizon: 14 days
    }

    [Fact]
    public async Task Booking_returns_a_reference_and_shows_the_car_to_staff()
    {
        var car = await NewCarAsync();
        var conf = await BookOkAsync(car.Slug, Tuesday, "10:00");
        Assert.Matches("^CD-[A-Z2-9]{6}$", conf.Reference);
        Assert.Equal($"Provkörning – {car.Title}", conf.ServiceName);
        Assert.Equal(30, conf.DurationMinutes);
        Assert.True(conf.ManageToken.Length >= 32);
        Assert.Contains("provkörning är bokad", conf.Message);

        var admin = await AdminAsync();
        var list = await admin.GetFromJsonAsync<List<BookingDto>>($"/api/workshop/bookings?from={Tuesday:yyyy-MM-dd}&to={Tuesday:yyyy-MM-dd}");
        var b = list!.Single(x => x.Reference == conf.Reference);
        Assert.Equal((car.Slug, car.Title, ""), (b.CarSlug, b.CarTitle, b.RegNumber));
    }

    [Fact]
    public async Task One_car_cannot_be_booked_twice_at_the_same_time_but_another_car_can()
    {
        var a = await NewCarAsync();
        var b = await NewCarAsync();
        await BookOkAsync(a.Slug, Tuesday, "11:00");

        var again = await BookAsync(a.Slug, Tuesday, "11:00");
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Contains("Tiden är inte längre ledig.", await again.Content.ReadAsStringAsync());
        Assert.DoesNotContain("11:00", await SlotsAsync(a.Slug, Tuesday));

        Assert.Equal(HttpStatusCode.Created, (await BookAsync(b.Slug, Tuesday, "11:00")).StatusCode);
        Assert.Contains("11:30", await SlotsAsync(a.Slug, Tuesday));   // the next half hour is free
    }

    [Fact]
    public async Task Test_drives_and_the_workshop_never_block_each_other()
    {
        // Both workshop bays full at 12:00 ...
        for (var i = 0; i < 2; i++)
        {
            var res = await _client.PostAsJsonAsync("/api/workshop/bookings", new CreateBookingRequest
            {
                ServiceCode = "dackbyte", Date = Wednesday, Time = "12:00", Name = "Verkstad", Email = "v@example.se",
                Phone = "070-123 45 67", RegNumber = "ABC 12D",
            });
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        }
        // ... a test drive at 12:00 is still possible
        var car = await NewCarAsync();
        await BookOkAsync(car.Slug, Wednesday, "12:00");

        // ... and a test drive does not take a workshop bay
        var free = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=dackbyte&date={Wednesday:yyyy-MM-dd}");
        Assert.DoesNotContain("12:00", free!.Slots);        // full because of the two workshop bookings only
        var other = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=dackbyte&date={Tuesday:yyyy-MM-dd}");
        await BookOkAsync((await NewCarAsync()).Slug, Tuesday, "15:00");
        var after = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=dackbyte&date={Tuesday:yyyy-MM-dd}");
        Assert.Equal(other!.Slots, after!.Slots);           // unchanged by the test drive
    }

    [Fact]
    public async Task Only_cars_that_are_for_sale_and_not_reserved_can_be_test_driven()
    {
        var sold = await NewCarAsync(CarStatus.Sold);
        var reserved = await NewCarAsync(CarStatus.Reserved);
        var draft = await NewCarAsync(CarStatus.Draft);

        foreach (var car in new[] { sold, reserved })
        {
            var res = await BookAsync(car.Slug, Tuesday, "10:00");
            Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
            Assert.Contains("Bilen går inte att provköra just nu.", await res.Content.ReadAsStringAsync());
            Assert.Equal(HttpStatusCode.Conflict, (await _client.GetAsync($"/api/testdrive/days?car={car.Slug}")).StatusCode);
        }
        Assert.Equal(HttpStatusCode.NotFound, (await BookAsync(draft.Slug, Tuesday, "10:00")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await BookAsync("finns-inte", Tuesday, "10:00")).StatusCode);
    }

    [Fact]
    public async Task Invalid_requests_get_swedish_errors_and_the_honeypot_is_ignored()
    {
        var car = await NewCarAsync();
        var bad = Request(car.Slug, Tuesday, "10:00");
        bad.Phone = "";
        bad.Email = "inte-en-epost";
        var res = await _client.PostAsJsonAsync("/api/testdrive/bookings", bad);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var body = await res.Content.ReadAsStringAsync();
        Assert.Contains("Fyll i ditt telefonnummer", body);
        Assert.Contains("E-postadressen verkar inte stämma.", body);

        var bot = Request(car.Slug, Tuesday, "13:00");
        bot.Website = "http://spam.example";
        Assert.Equal(HttpStatusCode.Accepted, (await _client.PostAsJsonAsync("/api/testdrive/bookings", bot)).StatusCode);
        Assert.Contains("13:00", await SlotsAsync(car.Slug, Tuesday));   // nothing was stored
    }

    [Fact]
    public async Task The_customer_finds_cancels_and_moves_the_test_drive_in_Min_bokning()
    {
        var car = await NewCarAsync();
        var conf = await BookOkAsync(car.Slug, Wednesday, "10:00");
        object Access(string? contact = null, bool token = false) => new { reference = conf.Reference, token = token ? conf.ManageToken : null, contact };

        // Found with the link secret or the e-mail address; there is no registration number to use
        var byEmail = await _client.PostAsJsonAsync("/api/workshop/bookings/manage", Access("anna@example.se"));
        var found = (await byEmail.Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.Equal(("provkorning", "Provkörning", car.Slug, car.Title, true), (found.Category, found.ServiceName, found.CarSlug, found.CarTitle, found.CanChange));
        Assert.Equal(HttpStatusCode.NotFound, (await _client.PostAsJsonAsync("/api/workshop/bookings/manage", Access("ABC12D"))).StatusCode);

        // Moving it: its own slot does not block 10:30; a slot taken by someone else does
        await BookOkAsync(car.Slug, Wednesday, "15:00");
        var move = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new { reference = conf.Reference, token = conf.ManageToken, date = Wednesday, time = "10:30" });
        Assert.Equal("10:30", (await move.Content.ReadFromJsonAsync<ManagedBookingDto>())!.Time);
        var clash = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new { reference = conf.Reference, token = conf.ManageToken, date = Wednesday, time = "15:00" });
        Assert.Equal(HttpStatusCode.Conflict, clash.StatusCode);

        // Cancelling frees the time for the car
        var cancel = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/cancel", Access(token: true));
        Assert.Equal("Cancelled", (await cancel.Content.ReadFromJsonAsync<ManagedBookingDto>())!.Status);
        Assert.Contains("10:30", await SlotsAsync(car.Slug, Wednesday));
    }

    [Fact]
    public async Task A_test_drive_cannot_be_moved_once_the_car_is_reserved_but_can_be_cancelled()
    {
        var car = await NewCarAsync();
        var conf = await BookOkAsync(car.Slug, Wednesday, "16:00");

        var admin = await AdminAsync();
        var update = new CarUpsertRequest
        {
            Make = car.Make, Model = car.Model, Year = car.Year, Mileage = car.Mileage, Fuel = car.Fuel, Transmission = car.Transmission,
            Drivetrain = car.Drivetrain, BodyType = car.BodyType, Color = car.Color, Price = car.Price, Status = CarStatus.Reserved,
            Images = car.Images.ToList(),
        };
        Assert.Equal(HttpStatusCode.OK, (await admin.PutAsJsonAsync($"/api/cars/{car.Id}", update)).StatusCode);

        var move = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/reschedule",
            new { reference = conf.Reference, token = conf.ManageToken, date = Wednesday, time = "16:30" });
        Assert.Equal(HttpStatusCode.Conflict, move.StatusCode);
        Assert.Contains("Bilen går inte att provköra just nu.", await move.Content.ReadAsStringAsync());
        var cancel = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/cancel", new { reference = conf.Reference, token = conf.ManageToken });
        Assert.Equal(HttpStatusCode.OK, cancel.StatusCode);
    }

    [Fact]
    public async Task A_booking_for_today_inside_the_change_window_is_locked()
    {
        var car = await NewCarAsync();
        var conf = await BookOkAsync(car.Slug, Monday, "14:00");   // today, within 24 h
        var res = await _client.PostAsJsonAsync("/api/workshop/bookings/manage", new { reference = conf.Reference, token = conf.ManageToken });
        Assert.False((await res.Content.ReadFromJsonAsync<ManagedBookingDto>())!.CanChange);
        var cancel = await _client.PostAsJsonAsync("/api/workshop/bookings/manage/cancel", new { reference = conf.Reference, token = conf.ManageToken });
        Assert.Equal(HttpStatusCode.Conflict, cancel.StatusCode);
    }

    [Fact]
    public async Task Staff_check_in_works_and_deleting_the_car_keeps_the_booking_without_blocking_the_workshop()
    {
        var a = await NewCarAsync();
        var b = await NewCarAsync();
        var ca = await BookOkAsync(a.Slug, Wednesday, "13:00");
        await BookOkAsync(b.Slug, Wednesday, "13:00");

        var admin = await AdminAsync();
        var checkIn = await admin.PostAsJsonAsync("/api/workshop/bookings/check-in", new CheckInRequest(ca.Reference));
        var arrived = (await checkIn.Content.ReadFromJsonAsync<ManagedBookingDto>())!;
        Assert.Equal(("Arrived", a.Slug), (arrived.Status, arrived.CarSlug));

        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/cars/{a.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/cars/{b.Id}")).StatusCode);
        var kept = await admin.GetFromJsonAsync<List<BookingDto>>($"/api/workshop/bookings?from={Wednesday:yyyy-MM-dd}&to={Wednesday:yyyy-MM-dd}");
        Assert.Contains(kept!, x => x.Reference == ca.Reference && x.ServiceCode == "provkorning");

        // Two orphaned test drives must not look like two workshop jobs: a 1-hour service at 13:00 is still free
        var free = await _client.GetFromJsonAsync<AvailabilityDto>($"/api/workshop/availability?service=service-liten&date={Wednesday:yyyy-MM-dd}");
        Assert.Contains("13:00", free!.Slots);
    }
}
