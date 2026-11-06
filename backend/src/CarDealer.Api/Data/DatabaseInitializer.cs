using System.Text.Json;
using CarDealer.Api.Auth;
using CarDealer.Api.Configuration;
using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CarDealer.Api.Data;

/// <summary>
/// Creates or migrates the database, seeds the inventory from the website's
/// data and creates the first admin from configuration. Idempotent.
/// </summary>
public sealed class DatabaseInitializer(
    AppDbContext db,
    IOptions<DatabaseOptions> database,
    IOptions<DataFilesOptions> files,
    IOptions<AdminSeedOptions> admin,
    RoleManager<IdentityRole> roles,
    UserManager<IdentityUser> users,
    TimeProvider clock,
    ILogger<DatabaseInitializer> logger)
{
    private record SeedCar(
        string Slug, string Make, string Model, int Year, int Mileage, string Fuel,
        string Transmission, string Drivetrain, string BodyType, string Color, int Price,
        bool Featured, string Description, string[] Images, string[] Features);

    public async Task InitializeAsync()
    {
        if (database.Value.IsSqlServer) await db.Database.MigrateAsync();
        else await db.Database.EnsureCreatedAsync();
        await SeedCarsAsync();
        await SeedRolesAndAdminAsync();
    }

    private async Task SeedCarsAsync()
    {
        if (await db.Cars.AnyAsync()) return;
        var json = await File.ReadAllTextAsync(DataFilesOptions.Resolve(files.Value.SeedCars));
        var cars = JsonSerializer.Deserialize<List<SeedCar>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
        // Spread creation dates so "Nyast inlagda" has a stable order.
        var first = clock.GetUtcNow().UtcDateTime.AddDays(-cars.Count);
        foreach (var (s, i) in cars.Select((s, i) => (s, i)))
        {
            db.Cars.Add(new Car
            {
                Slug = s.Slug, Make = s.Make, Model = s.Model, Year = s.Year, Mileage = s.Mileage,
                Fuel = s.Fuel, Transmission = s.Transmission, Drivetrain = s.Drivetrain,
                BodyType = s.BodyType, Color = s.Color, Price = s.Price, Featured = s.Featured,
                Description = s.Description, CreatedAt = first.AddDays(i), UpdatedAt = first.AddDays(i),
                Images = s.Images.Select((u, n) => new CarImage { Url = u, SortOrder = n }).ToList(),
                Features = s.Features.Select(f => new CarFeature { Name = f }).ToList(),
            });
        }
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} cars", cars.Count);
    }

    private async Task SeedRolesAndAdminAsync()
    {
        foreach (var role in Roles.All)
            if (!await roles.RoleExistsAsync(role)) await roles.CreateAsync(new IdentityRole(role));

        // First admin comes from configuration — never a password in the source.
        var (email, password) = (admin.Value.Email, admin.Value.Password);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;
        if (await users.FindByEmailAsync(email) is not null) return;

        var user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await users.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            logger.LogError("Could not create admin: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }
        await users.AddToRoleAsync(user, Roles.Admin);
        logger.LogInformation("Created admin account {Email}", email);
    }
}
