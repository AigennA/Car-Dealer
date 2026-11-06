using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using CarDealer.Api.Auth;
using CarDealer.Api.Configuration;
using CarDealer.Api.Data;
using CarDealer.Api.Services;
using CarDealer.Api.Workshop;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CarDealer.Api.Infrastructure;

/// <summary>
/// Composition root, split by concern. Every tunable value is bound from
/// configuration (Options pattern) — nothing is hard-coded here.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration config)
    {
        services.AddOptions<DatabaseOptions>().Bind(config.GetSection(DatabaseOptions.Section));
        var database = config.GetSection(DatabaseOptions.Section).Get<DatabaseOptions>() ?? new DatabaseOptions();
        var connection = config.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");

        services.AddDbContext<AppDbContext>(o =>
        {
            if (database.IsSqlServer) o.UseSqlServer(connection, sql => sql.EnableRetryOnFailure());
            else o.UseSqlite(connection);
        });
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();
        return services;
    }

    public static IServiceCollection AddStaffAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var policy = config.GetSection(IdentityPolicyOptions.Section).Get<IdentityPolicyOptions>() ?? new IdentityPolicyOptions();
        services
            .AddIdentityCore<IdentityUser>(o =>
            {
                o.User.RequireUniqueEmail = true;
                o.Password.RequiredLength = policy.RequiredPasswordLength;
                o.Password.RequireNonAlphanumeric = false;
                o.Lockout.MaxFailedAccessAttempts = policy.MaxFailedAccessAttempts;
                o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(policy.LockoutMinutes);
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.AddOptions<JwtOptions>().Bind(config.GetSection(JwtOptions.Section))
            .Validate(o => Encoding.UTF8.GetByteCount(o.Key) >= JwtOptions.MinKeyBytes,
                $"Jwt:Key must be at least {JwtOptions.MinKeyBytes} bytes. Set it with user-secrets or the Jwt__Key environment variable.")
            .ValidateOnStart();
        services.AddSingleton<TokenService>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        // Configured lazily from JwtOptions so environment variables / test settings always apply.
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((o, jwtOptions) =>
            {
                var jwt = jwtOptions.Value;
                o.MapInboundClaims = false;
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    RoleClaimType = ClaimTypes.Role,
                    ClockSkew = TimeSpan.FromSeconds(jwt.ClockSkewSeconds),
                };
            });
        services.AddAuthorization();
        return services;
    }

    public static IServiceCollection AddAbuseProtection(this IServiceCollection services, IConfiguration config)
    {
        services.AddOptions<RateLimitOptions>().Bind(config.GetSection(RateLimitOptions.Section));
        services.AddRateLimiter(o =>
        {
            o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            AddPerIpPolicy(o, RateLimitPolicies.Forms, l => l.FormsPerMinute);
            AddPerIpPolicy(o, RateLimitPolicies.Login, l => l.LoginPerMinute);
        });

        var cors = config.GetSection(CorsOptions.Section).Get<CorsOptions>() ?? new CorsOptions();
        services.AddCors(o => o.AddDefaultPolicy(p =>
            p.WithOrigins(cors.AllowedOrigins).AllowAnyHeader().WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")));
        return services;
    }

    private static void AddPerIpPolicy(Microsoft.AspNetCore.RateLimiting.RateLimiterOptions o, string name, Func<RateLimitOptions, int> limit) =>
        o.AddPolicy(name, ctx =>
        {
            var options = ctx.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value;
            var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(ip,
                _ => new FixedWindowRateLimiterOptions { PermitLimit = limit(options), Window = TimeSpan.FromMinutes(1) });
        });

    /// <summary>Business facts and the workshop catalogue — the same JSON files the website reads.</summary>
    public static IServiceCollection AddSharedData(this IServiceCollection services, IConfiguration config)
    {
        services.AddOptions<DataFilesOptions>().Bind(config.GetSection(DataFilesOptions.Section));
        services.AddSingleton(sp => WorkshopCatalog.Load(
            DataFilesOptions.Resolve(sp.GetRequiredService<IOptions<DataFilesOptions>>().Value.Workshop)));
        services.AddSingleton(sp => BusinessInfo.Load(
            DataFilesOptions.Resolve(sp.GetRequiredService<IOptions<DataFilesOptions>>().Value.Business)));
        return services;
    }

    /// <summary>Use cases behind interfaces (controllers depend on abstractions).</summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddOptions<AdminSeedOptions>().Bind(config.GetSection(AdminSeedOptions.Section));
        services.AddOptions<ApiDocsOptions>().Bind(config.GetSection(ApiDocsOptions.Section));

        services.AddScoped<ICarService, CarService>();
        services.AddScoped<ILeadService, LeadService>();
        services.AddScoped<ITradeInService, TradeInService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBookingManagementService, BookingManagementService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<INotificationService, LogNotificationService>();
        services.AddSingleton<IReferenceGenerator, RandomReferenceGenerator>();
        services.AddScoped<DatabaseInitializer>();
        return services;
    }
}
