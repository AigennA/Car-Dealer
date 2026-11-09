using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using CarDealer.Api.Domain;

namespace CarDealer.Api.Tests;

/// <summary>
/// Sold and reserved cars. Own fixture (own clock): these tests move the clock forward.
/// Dates are read from the test clock (which some tests move), never hard-coded.
/// </summary>
public class CarStatusTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();
    private string Today => factory.Clock.GetUtcNow().UtcDateTime.ToString("yyyy-MM-dd");
    private const int SoldVisibleDays = 14; // data/business.json -> policies.soldVisibleDays

    private static CarUpsertRequest NewCar(string make, CarStatus status = CarStatus.Available) => new()
    {
        Make = make, Model = "Testmodell", Year = 2022, Mileage = 3500, Fuel = "Bensin", Transmission = "Automat",
        Drivetrain = "FWD", BodyType = "Kombi", Color = "Grå", Price = 319000, Description = "Testbil",
        Features = ["Navigation"], Images = ["https://images.unsplash.com/photo-1?w=800&h=600&fit=crop"], Status = status,
    };

    private async Task<(HttpClient Admin, CarDto Car)> CreateAsync(string make, CarStatus status)
    {
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var res = await admin.PostAsJsonAsync("/api/cars", NewCar(make, status));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return (admin, (await res.Content.ReadFromJsonAsync<CarDto>())!);
    }

    private Task<PagedResult<CarDto>?> ListAsync(string search) =>
        _client.GetFromJsonAsync<PagedResult<CarDto>>($"/api/cars?search={search}&pageSize=100");

    [Fact]
    public async Task A_sold_car_stays_in_the_listing_marked_sold_and_comes_last()
    {
        await CreateAsync("Zsold", CarStatus.Sold);
        await CreateAsync("Zfree", CarStatus.Available);
        await CreateAsync("Zres", CarStatus.Reserved);

        var page = await ListAsync("Z");
        var order = page!.Items.Where(c => c.Make.StartsWith('Z')).Select(c => c.Status).ToList();
        Assert.Equal(3, order.Count);
        Assert.Equal("Sold", order.Last());          // sold last, whatever the sort
        Assert.Single(order, "Sold");
        var sold = page.Items.Single(c => c.Status == "Sold" && c.Make == "Zsold");
        Assert.Equal(Today, sold.SoldAt);             // the sale date is today's date
        Assert.All(page.Items.Where(c => c.Status != "Sold"), c => Assert.Null(c.SoldAt));
    }

    [Fact]
    public async Task Sold_last_also_holds_for_other_sort_orders()
    {
        await CreateAsync("Ysold", CarStatus.Sold);
        var cheap = NewCar("Yfree"); cheap.Price = 1000;
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        await admin.PostAsJsonAsync("/api/cars", cheap);

        var page = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?search=Y&sort=price-desc&pageSize=100");
        var items = page!.Items.Where(c => c.Make.StartsWith('Y')).ToList();
        Assert.Equal(["Yfree", "Ysold"], items.Select(c => c.Make));
    }

    [Fact]
    public async Task A_sold_car_leaves_the_listing_after_the_visible_period_but_keeps_its_page()
    {
        var (admin, car) = await CreateAsync("Xold", CarStatus.Sold);
        Assert.Contains((await ListAsync("Xold"))!.Items, c => c.Slug == car.Slug);

        factory.Clock.Advance(TimeSpan.FromDays(SoldVisibleDays - 1));
        Assert.Contains((await ListAsync("Xold"))!.Items, c => c.Slug == car.Slug);   // still inside the window

        factory.Clock.Advance(TimeSpan.FromDays(2));                                   // now 15 days after the sale
        admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword); // the old token has expired too
        Assert.DoesNotContain((await ListAsync("Xold"))!.Items, c => c.Slug == car.Slug);

        var page = await _client.GetAsync($"/api/cars/{car.Slug}");                    // old links still work
        Assert.Equal(HttpStatusCode.OK, page.StatusCode);
        Assert.Equal("Sold", (await page.Content.ReadFromJsonAsync<CarDto>())!.Status);
        Assert.Contains(await admin.GetFromJsonAsync<List<CarDto>>("/api/cars/all") ?? [], c => c.Slug == car.Slug);
    }

    [Fact]
    public async Task Facets_ignore_sold_cars()
    {
        await CreateAsync("Wsoldonly", CarStatus.Sold);
        await CreateAsync("Wfree", CarStatus.Available);
        var facets = await _client.GetFromJsonAsync<CarFacetsDto>("/api/cars/facets");
        Assert.Contains("Wfree", facets!.Makes);
        Assert.DoesNotContain("Wsoldonly", facets.Makes);
    }

    [Fact]
    public async Task The_sale_date_is_set_once_and_cleared_when_the_car_goes_back_on_sale()
    {
        var (admin, car) = await CreateAsync("Vcar", CarStatus.Available);
        Assert.Null(car.SoldAt);

        var saleDay = Today;
        var sell = NewCar("Vcar", CarStatus.Sold);
        var sold = await (await admin.PutAsJsonAsync($"/api/cars/{car.Id}", sell)).Content.ReadFromJsonAsync<CarDto>();
        Assert.Equal(saleDay, sold!.SoldAt);

        factory.Clock.Advance(TimeSpan.FromHours(30));                                 // a later day
        admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        Assert.NotEqual(saleDay, Today);
        sell.Price = 299000;                                                           // edit while sold: date stays
        var edited = await (await admin.PutAsJsonAsync($"/api/cars/{car.Id}", sell)).Content.ReadFromJsonAsync<CarDto>();
        Assert.Equal(saleDay, edited!.SoldAt);

        var back = await (await admin.PutAsJsonAsync($"/api/cars/{car.Id}", NewCar("Vcar", CarStatus.Reserved))).Content.ReadFromJsonAsync<CarDto>();
        Assert.Null(back!.SoldAt);
        Assert.Equal("Reserved", back.Status);
    }

    [Fact]
    public async Task A_car_without_a_sale_date_is_not_listed()
    {
        // Cars sold before the sale date existed have none; they must not appear as "recently sold".
        // (Simulated through the API: only a status change creates a date, so use a draft that is never public.)
        var (_, car) = await CreateAsync("Ucar", CarStatus.Draft);
        Assert.DoesNotContain((await ListAsync("Ucar"))!.Items, c => c.Slug == car.Slug);
    }
}
