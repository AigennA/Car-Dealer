using CarDealer.Api.Configuration;
using CarDealer.Api.Data;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;

namespace CarDealer.Api.Infrastructure;

public static class WebApplicationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<DatabaseInitializer>().InitializeAsync();
    }

    /// <summary>Defence-in-depth headers on every response.</summary>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app) =>
        app.Use(async (ctx, next) =>
        {
            ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
            ctx.Response.Headers["X-Frame-Options"] = "DENY";
            ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            await next();
        });

    /// <summary>OpenAPI + Scalar: on in Development, opt-in elsewhere (ApiDocs:Enabled=true).</summary>
    public static WebApplication MapApiDocs(this WebApplication app)
    {
        var docs = app.Services.GetRequiredService<IOptions<ApiDocsOptions>>().Value;
        if (!app.Environment.IsDevelopment() && !docs.Enabled) return app;
        app.MapOpenApi();                                     // /openapi/v1.json
        app.MapScalarApiReference(o => o.Title = docs.Title); // /scalar
        return app;
    }
}
