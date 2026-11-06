using System.Net;
using System.Net.Http.Json;
using CarDealer.Api.Contracts;
using CarDealer.Api.Controllers;

namespace CarDealer.Api.Tests;

public class CarsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Inventory_is_seeded_from_the_website_data()
    {
        var page = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?pageSize=100");
        Assert.True(page!.Total >= 24);
        var volvo = page.Items.Single(c => c.Slug == "volvo-v90-d4-awd");
        Assert.Equal("Volvo V90 D4 AWD", volvo.Title);
        Assert.Equal(249900, volvo.Price);
        Assert.NotEmpty(volvo.Images);
        Assert.Contains("Panoramatak", volvo.Features);
    }

    [Fact]
    public async Task Filters_match_the_website_search()
    {
        var page = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?make=Volvo&fuel=Diesel");
        Assert.NotEmpty(page!.Items);
        Assert.All(page.Items, c => { Assert.Equal("Volvo", c.Make); Assert.Equal("Diesel", c.Fuel); });

        var cheap = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?priceMax=200000&yearMin=2018");
        Assert.All(cheap!.Items, c => { Assert.True(c.Price <= 200000); Assert.True(c.Year >= 2018); });

        var search = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?search=xc60");
        Assert.All(search!.Items, c => Assert.Contains("XC60", c.Model, StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("price-asc")]
    [InlineData("price-desc")]
    public async Task Sorting_by_price(string sort)
    {
        var page = await _client.GetFromJsonAsync<PagedResult<CarDto>>($"/api/cars?sort={sort}&pageSize=100");
        var prices = page!.Items.Select(c => c.Price).ToList();
        var expected = sort == "price-asc" ? prices.OrderBy(p => p) : prices.OrderByDescending(p => p);
        Assert.Equal(expected, prices);
    }

    [Fact]
    public async Task Paging_returns_the_requested_slice()
    {
        var p1 = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?page=1&pageSize=5&sort=price-asc");
        var p2 = await _client.GetFromJsonAsync<PagedResult<CarDto>>("/api/cars?page=2&pageSize=5&sort=price-asc");
        Assert.Equal(5, p1!.Items.Count);
        Assert.Empty(p1.Items.Select(c => c.Id).Intersect(p2!.Items.Select(c => c.Id)));
    }

    [Fact]
    public async Task Invalid_query_returns_400()
    {
        var res = await _client.GetAsync("/api/cars?pageSize=5000");
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Facets_list_filter_values()
    {
        var facets = await _client.GetFromJsonAsync<Dictionary<string, string[]>>("/api/cars/facets");
        Assert.Contains("Volvo", facets!["makes"]);
        Assert.Contains("Diesel", facets["fuels"]);
    }

    [Fact]
    public async Task Unknown_car_is_404_problem_in_swedish()
    {
        var res = await _client.GetAsync("/api/cars/finns-inte");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
        Assert.Contains("Bilen hittades inte", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Writing_requires_login()
    {
        var res = await _client.PostAsJsonAsync("/api/cars", NewCar());
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Sales_can_create_and_update_but_not_delete()
    {
        await factory.EnsureSalesUserAsync();
        var sales = await factory.ClientAsAsync(ApiFactory.SalesEmail, ApiFactory.SalesPassword);

        var created = await sales.PostAsJsonAsync("/api/cars", NewCar());
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var car = await created.Content.ReadFromJsonAsync<CarDto>();
        Assert.StartsWith("skoda-octavia-rs-2022", car!.Slug);

        var update = NewCar();
        update.Price = 299000;
        var updated = await sales.PutAsJsonAsync($"/api/cars/{car.Id}", update);
        Assert.Equal(299000, (await updated.Content.ReadFromJsonAsync<CarDto>())!.Price);

        var delete = await sales.DeleteAsync($"/api/cars/{car.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, delete.StatusCode);
    }

    [Fact]
    public async Task Admin_can_delete_and_slugs_stay_unique()
    {
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var a = await (await admin.PostAsJsonAsync("/api/cars", NewCar("Saab", "9-3 Aero"))).Content.ReadFromJsonAsync<CarDto>();
        var b = await (await admin.PostAsJsonAsync("/api/cars", NewCar("Saab", "9-3 Aero"))).Content.ReadFromJsonAsync<CarDto>();
        Assert.NotEqual(a!.Slug, b!.Slug);

        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/cars/{a.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/cars/{a.Slug}")).StatusCode);
    }

    [Fact]
    public async Task Sold_cars_are_hidden_from_the_public_but_visible_to_staff()
    {
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var req = NewCar("Lancia", "Delta Integrale");
        req.Status = Domain.CarStatus.Sold;
        var car = await (await admin.PostAsJsonAsync("/api/cars", req)).Content.ReadFromJsonAsync<CarDto>();

        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/cars/{car!.Slug}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync($"/api/cars/{car.Slug}")).StatusCode);
        var all = await admin.GetFromJsonAsync<List<CarDto>>("/api/cars/all");
        Assert.Contains(all!, c => c.Slug == car.Slug && c.Status == "Sold");
    }

    [Fact]
    public async Task Validation_errors_are_in_swedish()
    {
        var admin = await factory.ClientAsAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);
        var bad = NewCar();
        bad.Make = "";
        bad.Year = 1800;
        var res = await admin.PostAsJsonAsync("/api/cars", bad);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var body = await res.Content.ReadAsStringAsync();
        Assert.Contains("Ange märke.", body);
        Assert.Contains("Årsmodellen ska vara mellan 1950 och 2100.", body);
    }

    [Theory]
    [InlineData("Volvo XC60 T8 2021", "volvo-xc60-t8-2021")]
    [InlineData("Škoda Kodiaq 2.0 TDI", "koda-kodiaq-2-0-tdi")]
    [InlineData("Räv Öl Å", "rav-ol-a")]
    [InlineData("!!!", "bil")]
    public void Slugify(string input, string expected) => Assert.Equal(expected, CarsController.Slugify(input));

    private static CarUpsertRequest NewCar(string make = "Skoda", string model = "Octavia RS") => new()
    {
        Make = make, Model = model, Year = 2022, Mileage = 3500, Fuel = "Bensin", Transmission = "Automat",
        Drivetrain = "FWD", BodyType = "Kombi", Color = "Grå", Price = 319000, Description = "Testbil",
        Features = ["Navigation"], Images = ["https://images.unsplash.com/photo-1?w=800&h=600&fit=crop"],
    };
}
