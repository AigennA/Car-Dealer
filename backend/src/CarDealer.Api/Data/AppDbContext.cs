using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Data;

/// <summary>
/// One database for the dealer platform: inventory, customer requests and
/// staff accounts (ASP.NET Core Identity tables).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarImage> CarImages => Set<CarImage>();
    public DbSet<CarFeature> CarFeatures => Set<CarFeature>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<TradeIn> TradeIns => Set<TradeIn>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Car>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.HasIndex(c => new { c.Status, c.Make });
            e.Property(c => c.Slug).HasMaxLength(120);
            e.Property(c => c.Make).HasMaxLength(60);
            e.Property(c => c.Model).HasMaxLength(80);
            e.Property(c => c.Fuel).HasMaxLength(30);
            e.Property(c => c.Transmission).HasMaxLength(30);
            e.Property(c => c.Drivetrain).HasMaxLength(10);
            e.Property(c => c.BodyType).HasMaxLength(30);
            e.Property(c => c.Color).HasMaxLength(30);
            e.Property(c => c.Description).HasMaxLength(4000);
            e.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
            e.Ignore(c => c.Title);
            e.HasMany(c => c.Images).WithOne().HasForeignKey(i => i.CarId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(c => c.Features).WithOne().HasForeignKey(f => f.CarId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CarImage>().Property(i => i.Url).HasMaxLength(500);
        b.Entity<CarFeature>().Property(f => f.Name).HasMaxLength(80);

        b.Entity<Lead>(e =>
        {
            e.Property(l => l.Name).HasMaxLength(100);
            e.Property(l => l.Email).HasMaxLength(254);
            e.Property(l => l.Phone).HasMaxLength(30);
            e.Property(l => l.Subject).HasMaxLength(40);
            e.Property(l => l.Message).HasMaxLength(4000);
            e.Property(l => l.Status).HasConversion<string>().HasMaxLength(20);
            // Keep the customer's message if the car is later deleted.
            e.HasOne(l => l.Car).WithMany().HasForeignKey(l => l.CarId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(l => new { l.Status, l.CreatedAt });
        });

        b.Entity<TradeIn>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(100);
            e.Property(t => t.Email).HasMaxLength(254);
            e.Property(t => t.Phone).HasMaxLength(30);
            e.Property(t => t.Brand).HasMaxLength(60);
            e.Property(t => t.Model).HasMaxLength(80);
            e.Property(t => t.Message).HasMaxLength(4000);
            e.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(t => new { t.Status, t.CreatedAt });
        });

        b.Entity<Booking>(e =>
        {
            e.HasIndex(x => x.Reference).IsUnique();
            e.HasIndex(x => new { x.Date, x.Status });
            e.Property(x => x.Reference).HasMaxLength(12);
            e.Property(x => x.ServiceCode).HasMaxLength(40);
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(254);
            e.Property(x => x.Phone).HasMaxLength(30);
            e.Property(x => x.RegNumber).HasMaxLength(7);
            e.Property(x => x.Message).HasMaxLength(2000);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.ManageTokenHash).HasMaxLength(64);
            // A deleted car keeps its test-drive bookings (the staff still need to see them).
            e.HasOne(x => x.Car).WithMany().HasForeignKey(x => x.CarId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => new { x.CarId, x.Date });
        });
    }
}
