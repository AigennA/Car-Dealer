using CarDealer.Api.Infrastructure;

// Composition root. Each concern is configured in its own extension method
// (Infrastructure/ServiceCollectionExtensions.cs); all values come from configuration.
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPersistence(builder.Configuration)
    .AddStaffAuthentication(builder.Configuration)
    .AddAbuseProtection(builder.Configuration)
    .AddSharedData(builder.Configuration)
    .AddApplicationServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();
await app.InitializeDatabaseAsync();

app.UseExceptionHandler();
app.UseStatusCodePages();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();
app.UseSecurityHeaders();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapApiDocs();
app.MapHealthChecks("/health");
app.MapControllers();

app.Run();

/// <summary>Exposed for WebApplicationFactory in the integration tests.</summary>
public partial class Program;
