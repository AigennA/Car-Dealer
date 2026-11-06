using System.Text.RegularExpressions;
using CarDealer.Api.Auth;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Controllers;

[ApiController]
[Route("api/cars")]
[Produces("application/json")]
public partial class CarsController(AppDbContext db) : ControllerBase
{
    private static readonly CarStatus[] PublicStatuses = [CarStatus.Available, CarStatus.Reserved];

    /// <summary>Public inventory with the same filters and sort options as the website.</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<CarDto>>> List([FromQuery] CarQuery q, CancellationToken ct)
    {
        var cars = db.Cars.AsNoTracking().Where(c => PublicStatuses.Contains(c.Status));

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim().ToLower();
            cars = cars.Where(c => (c.Make + " " + c.Model).ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(q.Make)) cars = cars.Where(c => c.Make == q.Make);
        if (!string.IsNullOrWhiteSpace(q.Fuel)) cars = cars.Where(c => c.Fuel == q.Fuel);
        if (!string.IsNullOrWhiteSpace(q.Transmission)) cars = cars.Where(c => c.Transmission == q.Transmission);
        if (!string.IsNullOrWhiteSpace(q.BodyType)) cars = cars.Where(c => c.BodyType == q.BodyType);
        if (q.PriceMin is { } pmin) cars = cars.Where(c => c.Price >= pmin);
        if (q.PriceMax is { } pmax) cars = cars.Where(c => c.Price <= pmax);
        if (q.YearMin is { } ymin) cars = cars.Where(c => c.Year >= ymin);
        if (q.YearMax is { } ymax) cars = cars.Where(c => c.Year <= ymax);
        if (q.MileageMax is { } mmax) cars = cars.Where(c => c.Mileage <= mmax);
        if (q.Featured is { } f) cars = cars.Where(c => c.Featured == f);

        cars = q.Sort switch
        {
            "price-asc" => cars.OrderBy(c => c.Price),
            "price-desc" => cars.OrderByDescending(c => c.Price),
            "year-desc" => cars.OrderByDescending(c => c.Year),
            "year-asc" => cars.OrderBy(c => c.Year),
            "mileage-asc" => cars.OrderBy(c => c.Mileage),
            "mileage-desc" => cars.OrderByDescending(c => c.Mileage),
            "name-asc" => cars.OrderBy(c => c.Make).ThenBy(c => c.Model),
            "name-desc" => cars.OrderByDescending(c => c.Make).ThenByDescending(c => c.Model),
            "newest" => cars.OrderByDescending(c => c.CreatedAt),
            _ => cars.OrderByDescending(c => c.Featured).ThenBy(c => c.Id),
        };

        var total = await cars.CountAsync(ct);
        var page = await cars
            .Include(c => c.Images).Include(c => c.Features)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .AsSplitQuery()
            .ToListAsync(ct);

        return new PagedResult<CarDto>(page.Select(CarDto.From).ToList(), total, q.Page, q.PageSize);
    }

    /// <summary>Distinct values for the filter dropdowns.</summary>
    [HttpGet("facets")]
    public async Task<ActionResult<object>> Facets(CancellationToken ct)
    {
        var cars = db.Cars.AsNoTracking().Where(c => PublicStatuses.Contains(c.Status));
        return new
        {
            makes = await cars.Select(c => c.Make).Distinct().OrderBy(x => x).ToListAsync(ct),
            fuels = await cars.Select(c => c.Fuel).Distinct().OrderBy(x => x).ToListAsync(ct),
            transmissions = await cars.Select(c => c.Transmission).Distinct().OrderBy(x => x).ToListAsync(ct),
            bodyTypes = await cars.Select(c => c.BodyType).Distinct().OrderBy(x => x).ToListAsync(ct),
        };
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CarDto>> Get(string slug, CancellationToken ct)
    {
        var isStaff = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Sales);
        var car = await db.Cars.AsNoTracking().Include(c => c.Images).Include(c => c.Features)
            .FirstOrDefaultAsync(c => c.Slug == slug && (isStaff || PublicStatuses.Contains(c.Status)), ct);
        return car is null
            ? Problem(statusCode: 404, title: "Bilen hittades inte", detail: "Bilen kan redan vara såld.")
            : CarDto.From(car);
    }

    /// <summary>Staff: every car including sold and drafts.</summary>
    [HttpGet("all")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<List<CarDto>>> All(CancellationToken ct) =>
        (await db.Cars.AsNoTracking().Include(c => c.Images).Include(c => c.Features)
            .OrderByDescending(c => c.CreatedAt).AsSplitQuery().ToListAsync(ct))
        .Select(CarDto.From).ToList();

    [HttpPost]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<CarDto>> Create(CarUpsertRequest req, CancellationToken ct)
    {
        var car = new Car
        {
            Slug = await UniqueSlugAsync(Slugify($"{req.Make} {req.Model} {req.Year}"), null, ct),
            Make = req.Make, Model = req.Model, Fuel = req.Fuel, Transmission = req.Transmission,
            Drivetrain = req.Drivetrain, BodyType = req.BodyType, Color = req.Color,
        };
        Apply(car, req);
        db.Cars.Add(car);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { slug = car.Slug }, CarDto.From(car));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<CarDto>> Update(int id, CarUpsertRequest req, CancellationToken ct)
    {
        var car = await db.Cars.Include(c => c.Images).Include(c => c.Features).FirstOrDefaultAsync(c => c.Id == id, ct);
        if (car is null) return Problem(statusCode: 404, title: "Bilen hittades inte");
        db.CarImages.RemoveRange(car.Images);
        db.CarFeatures.RemoveRange(car.Features);
        Apply(car, req);
        car.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return CarDto.From(car);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var car = await db.Cars.FindAsync([id], ct);
        if (car is null) return Problem(statusCode: 404, title: "Bilen hittades inte");
        db.Cars.Remove(car);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void Apply(Car car, CarUpsertRequest r)
    {
        car.Make = r.Make.Trim(); car.Model = r.Model.Trim(); car.Year = r.Year; car.Mileage = r.Mileage;
        car.Fuel = r.Fuel; car.Transmission = r.Transmission; car.Drivetrain = r.Drivetrain;
        car.BodyType = r.BodyType; car.Color = r.Color.Trim(); car.Price = r.Price; car.Featured = r.Featured;
        car.Description = r.Description.Trim(); car.Status = r.Status;
        car.Images = r.Images.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select((u, i) => new CarImage { Url = u.Trim(), SortOrder = i }).ToList();
        car.Features = r.Features.Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => new CarFeature { Name = x.Trim() }).ToList();
    }

    /// <summary>"Volvo XC60 T8 2021" → "volvo-xc60-t8-2021" (å/ä/ö → a/a/o).</summary>
    public static string Slugify(string text)
    {
        var s = text.ToLowerInvariant().Replace('å', 'a').Replace('ä', 'a').Replace('ö', 'o').Replace('é', 'e');
        s = NonSlugChars().Replace(s, "-").Trim('-');
        return s.Length == 0 ? "bil" : s;
    }

    private async Task<string> UniqueSlugAsync(string baseSlug, int? exceptId, CancellationToken ct)
    {
        var slug = baseSlug;
        for (var n = 2; await db.Cars.AnyAsync(c => c.Slug == slug && c.Id != exceptId, ct); n++) slug = $"{baseSlug}-{n}";
        return slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonSlugChars();
}
