using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using CarDealer.Api.Auth;
using CarDealer.Api.Data;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// ── Database ────────────────────────────────────────────────────────────────
// "SqlServer" in production (Azure SQL / SQL Server), "Sqlite" for local
// development and tests — no database server needed to try the platform.
var provider = config["Database:Provider"] ?? "Sqlite";
var connection = config.GetConnectionString("Default") ?? "Data Source=cardealer.db";
builder.Services.AddDbContext<AppDbContext>(o =>
{
    if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        o.UseSqlServer(connection, sql => sql.EnableRetryOnFailure());
    else
        o.UseSqlite(connection);
});

// ── Staff accounts (ASP.NET Core Identity) ──────────────────────────────────
builder.Services
    .AddIdentityCore<IdentityUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 12;
        o.Password.RequireNonAlphanumeric = false;
        o.Lockout.MaxFailedAccessAttempts = 5;
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// ── JWT authentication ──────────────────────────────────────────────────────
builder.Services.AddOptions<JwtOptions>().Bind(config.GetSection(JwtOptions.Section))
    .Validate(o => Encoding.UTF8.GetByteCount(o.Key) >= 32,
        "Jwt:Key must be at least 32 bytes. Set it with user-secrets or the Jwt__Key environment variable.")
    .ValidateOnStart();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<TokenService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
// Configured lazily from JwtOptions so environment variables / test settings always apply.
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<Microsoft.Extensions.Options.IOptions<JwtOptions>>((o, jwtOptions) =>
    {
        var jwt = jwtOptions.Value;
        o.MapInboundClaims = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

// ── Abuse protection for the public forms and the login ─────────────────────
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    static string Ip(HttpContext c) => c.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    o.AddPolicy("forms", c => RateLimitPartition.GetFixedWindowLimiter(Ip(c),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = config.GetValue("RateLimits:FormsPerMinute", 5), Window = TimeSpan.FromMinutes(1) }));
    o.AddPolicy("login", c => RateLimitPartition.GetFixedWindowLimiter(Ip(c),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = config.GetValue("RateLimits:LoginPerMinute", 10), Window = TimeSpan.FromMinutes(1) }));
});

// ── CORS: only the dealer's own website may call the API from a browser ─────
var origins = config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(origins).AllowAnyHeader().WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")));

builder.Services.AddScoped<INotificationService, LogNotificationService>();
builder.Services.AddSingleton(_ => CarDealer.Api.Workshop.WorkshopCatalog.Load(
    Path.Combine(AppContext.BaseDirectory, "Data", "workshop.json")));
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

var app = builder.Build();

// ── Create / migrate the database and seed it ───────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsSqlServer()) await db.Database.MigrateAsync();
    else await db.Database.EnsureCreatedAsync();
    await SeedData.SeedAsync(scope.ServiceProvider, config, app.Logger);
}

app.UseExceptionHandler();
app.UseStatusCodePages();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();

app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["X-Frame-Options"] = "DENY";
    ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// API docs: on in Development, opt-in elsewhere (ApiDocs:Enabled=true).
if (app.Environment.IsDevelopment() || config.GetValue("ApiDocs:Enabled", false))
{
    app.MapOpenApi();                                           // /openapi/v1.json
    app.MapScalarApiReference(o => o.Title = "Car Dealer API"); // /scalar — interactive docs
}
app.MapHealthChecks("/health");
app.MapControllers();

app.Run();

/// <summary>Exposed for WebApplicationFactory in the integration tests.</summary>
public partial class Program;
