using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

public interface ICarService
{
    Task<PagedResult<CarDto>> SearchAsync(CarQuery query, CancellationToken ct);
    Task<CarFacetsDto> FacetsAsync(CancellationToken ct);
    Task<Result<CarDto>> GetBySlugAsync(string slug, bool includeHidden, CancellationToken ct);
    Task<IReadOnlyList<CarDto>> ListAllAsync(CancellationToken ct);
    Task<CarDto> CreateAsync(CarUpsertRequest request, CancellationToken ct);
    Task<Result<CarDto>> UpdateAsync(int id, CarUpsertRequest request, CancellationToken ct);
    Task<Result> DeleteAsync(int id, CancellationToken ct);
}

/// <summary>Inventory use cases: public search and staff management.</summary>
public sealed class CarService(AppDbContext db, TimeProvider clock, BusinessInfo business) : ICarService
{
    private static readonly CarStatus[] ForSaleStatuses = [CarStatus.Available, CarStatus.Reserved];

    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;

    /// <summary>Cars the dealer still has: available or reserved.</summary>
    private IQueryable<Car> ForSaleCars => db.Cars.AsNoTracking().Where(c => ForSaleStatuses.Contains(c.Status));

    /// <summary>The public listing: cars for sale, plus cars sold within the last SoldVisibleDays days.</summary>
    private IQueryable<Car> PublicCars
    {
        get
        {
            var cutoff = UtcNow.AddDays(-business.Policies.SoldVisibleDays);
            return db.Cars.AsNoTracking().Where(c =>
                ForSaleStatuses.Contains(c.Status) || (c.Status == CarStatus.Sold && c.SoldAt >= cutoff));
        }
    }

    public async Task<PagedResult<CarDto>> SearchAsync(CarQuery q, CancellationToken ct)
    {
        var cars = CarSorting.Apply(CarFilters.Apply(PublicCars, q), q.Sort);
        var total = await cars.CountAsync(ct);
        var page = await cars.Include(c => c.Images).Include(c => c.Features)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .AsSplitQuery().ToListAsync(ct);
        return new PagedResult<CarDto>(page.Select(CarDto.From).ToList(), total, q.Page, q.PageSize);
    }

    public async Task<CarFacetsDto> FacetsAsync(CancellationToken ct) => new(
        await Distinct(c => c.Make, ct),
        await Distinct(c => c.Fuel, ct),
        await Distinct(c => c.Transmission, ct),
        await Distinct(c => c.BodyType, ct));

    private Task<List<string>> Distinct(System.Linq.Expressions.Expression<Func<Car, string>> field, CancellationToken ct) =>
        ForSaleCars.Select(field).Distinct().OrderBy(x => x).ToListAsync(ct);

    public async Task<Result<CarDto>> GetBySlugAsync(string slug, bool includeHidden, CancellationToken ct)
    {
        // A car's own page stays reachable once it is sold (old links and search results), only drafts are hidden.
        var source = includeHidden ? db.Cars.AsNoTracking() : db.Cars.AsNoTracking().Where(c => c.Status != CarStatus.Draft);
        var car = await source.Include(c => c.Images).Include(c => c.Features).FirstOrDefaultAsync(c => c.Slug == slug, ct);
        return car is null ? Error.NotFound(Messages.CarNotFound, Messages.CarMaybeSold) : CarDto.From(car);
    }

    public async Task<IReadOnlyList<CarDto>> ListAllAsync(CancellationToken ct) =>
        (await db.Cars.AsNoTracking().Include(c => c.Images).Include(c => c.Features)
            .OrderByDescending(c => c.CreatedAt).AsSplitQuery().ToListAsync(ct))
        .Select(CarDto.From).ToList();

    public async Task<CarDto> CreateAsync(CarUpsertRequest r, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var car = new Car
        {
            Slug = await UniqueSlugAsync(Slug.Create($"{r.Make} {r.Model} {r.Year}"), ct),
            Make = r.Make, Model = r.Model, Fuel = r.Fuel, Transmission = r.Transmission,
            Drivetrain = r.Drivetrain, BodyType = r.BodyType, Color = r.Color, CreatedAt = now, UpdatedAt = now,
        };
        Apply(car, r, now);
        db.Cars.Add(car);
        await db.SaveChangesAsync(ct);
        return CarDto.From(car);
    }

    public async Task<Result<CarDto>> UpdateAsync(int id, CarUpsertRequest r, CancellationToken ct)
    {
        var car = await db.Cars.Include(c => c.Images).Include(c => c.Features).FirstOrDefaultAsync(c => c.Id == id, ct);
        if (car is null) return Error.NotFound(Messages.CarNotFound);
        db.CarImages.RemoveRange(car.Images);
        db.CarFeatures.RemoveRange(car.Features);
        var now = UtcNow;
        Apply(car, r, now);
        car.UpdatedAt = now;
        await db.SaveChangesAsync(ct);
        return CarDto.From(car);
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken ct)
    {
        var car = await db.Cars.FindAsync([id], ct);
        if (car is null) return Error.NotFound(Messages.CarNotFound);
        db.Cars.Remove(car);
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static void Apply(Car car, CarUpsertRequest r, DateTime now)
    {
        var wasSold = car.Status == CarStatus.Sold;
        car.Make = r.Make.Trim(); car.Model = r.Model.Trim(); car.Year = r.Year; car.Mileage = r.Mileage;
        car.Fuel = r.Fuel; car.Transmission = r.Transmission; car.Drivetrain = r.Drivetrain;
        car.BodyType = r.BodyType; car.Color = r.Color.Trim(); car.Price = r.Price; car.Featured = r.Featured;
        car.Description = r.Description.Trim(); car.Status = r.Status;
        // The sale date is set once, when the car becomes sold, and cleared if it is put back on sale.
        car.SoldAt = r.Status == CarStatus.Sold ? (wasSold ? car.SoldAt ?? now : now) : null;
        car.Images = r.Images.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select((u, i) => new CarImage { Url = u.Trim(), SortOrder = i }).ToList();
        car.Features = r.Features.Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => new CarFeature { Name = x.Trim() }).ToList();
    }

    private async Task<string> UniqueSlugAsync(string baseSlug, CancellationToken ct)
    {
        var slug = baseSlug;
        for (var n = 2; await db.Cars.AnyAsync(c => c.Slug == slug, ct); n++) slug = $"{baseSlug}-{n}";
        return slug;
    }
}

/// <summary>Search filters — one responsibility, easy to extend with a new filter.</summary>
internal static class CarFilters
{
    public static IQueryable<Car> Apply(IQueryable<Car> cars, CarQuery q)
    {
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
        return cars;
    }
}

/// <summary>Sort keys shared with the website (src/lib/filters.ts SORT_OPTIONS).</summary>
internal static class CarSorting
{
    /// <summary>Sold cars always come last, then the requested order.</summary>
    public static IQueryable<Car> Apply(IQueryable<Car> cars, string sort)
    {
        var soldLast = cars.OrderBy(c => c.Status == CarStatus.Sold ? 1 : 0);
        return sort switch
        {
            "price-asc" => soldLast.ThenBy(c => c.Price),
            "price-desc" => soldLast.ThenByDescending(c => c.Price),
            "year-desc" => soldLast.ThenByDescending(c => c.Year),
            "year-asc" => soldLast.ThenBy(c => c.Year),
            "mileage-asc" => soldLast.ThenBy(c => c.Mileage),
            "mileage-desc" => soldLast.ThenByDescending(c => c.Mileage),
            "name-asc" => soldLast.ThenBy(c => c.Make).ThenBy(c => c.Model),
            "name-desc" => soldLast.ThenByDescending(c => c.Make).ThenByDescending(c => c.Model),
            "newest" => soldLast.ThenByDescending(c => c.CreatedAt),
            _ => soldLast.ThenByDescending(c => c.Featured).ThenBy(c => c.Id),
        };
    }
}
