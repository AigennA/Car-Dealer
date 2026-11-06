using System.Text.Json;
using CarDealer.Api.Auth;
using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Data;

/// <summary>
/// Seeds the inventory from Data/seed-cars.json (exported from the website's
/// src/lib/cars.ts) and creates the first admin account from configuration.
/// Idempotent: does nothing for data that already exists.
/// </summary>
public static class SeedData
{
    private record SeedCar(
        string Slug, string Make, string Model, int Year, int Mileage, string Fuel,
        string Transmission, string Drivetrain, string BodyType, string Color, int Price,
        bool Featured, string Description, string[] Images, string[] Features);

    public static async Task SeedAsync(IServiceProvider services, IConfiguration config, ILogger logger)
    {
        var db = services.GetRequiredService<AppDbContext>();

        if (!await db.Cars.AnyAsync())
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Data", "seed-cars.json");
            var json = await File.ReadAllTextAsync(path);
            var cars = JsonSerializer.Deserialize<List<SeedCar>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
            var created = DateTime.UtcNow.AddDays(-cars.Count);
            foreach (var (s, i) in cars.Select((s, i) => (s, i)))
            {
                db.Cars.Add(new Car
                {
                    Slug = s.Slug, Make = s.Make, Model = s.Model, Year = s.Year, Mileage = s.Mileage,
                    Fuel = s.Fuel, Transmission = s.Transmission, Drivetrain = s.Drivetrain,
                    BodyType = s.BodyType, Color = s.Color, Price = s.Price, Featured = s.Featured,
                    Description = s.Description,
                    CreatedAt = created.AddDays(i), UpdatedAt = created.AddDays(i),
                    Images = s.Images.Select((u, n) => new CarImage { Url = u, SortOrder = n }).ToList(),
                    Features = s.Features.Select(f => new CarFeature { Name = f }).ToList(),
                });
            }
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} cars", cars.Count);
        }

        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles.All)
            if (!await roles.RoleExistsAsync(role)) await roles.CreateAsync(new IdentityRole(role));

        // First admin comes from configuration (user-secrets / environment
        // variables) — never a password hard-coded in the source.
        var email = config["Admin:Email"];
        var password = config["Admin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;

        var users = services.GetRequiredService<UserManager<IdentityUser>>();
        if (await users.FindByEmailAsync(email) is null)
        {
            var admin = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await users.CreateAsync(admin, password);
            if (!result.Succeeded)
            {
                logger.LogError("Could not create admin: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
                return;
            }
            await users.AddToRoleAsync(admin, Roles.Admin);
            logger.LogInformation("Created admin account {Email}", email);
        }
    }
}
