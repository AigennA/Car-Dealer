using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CarDealer.Api.Data;

/// <summary>
/// Used only by `dotnet ef migrations add`: migrations target SQL Server, the
/// production database. (SQLite for local dev/tests uses EnsureCreated.)
/// No connection is opened when generating a migration.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost;Database=CarDealer;Trusted_Connection=True;TrustServerCertificate=True")
            .Options);
}
