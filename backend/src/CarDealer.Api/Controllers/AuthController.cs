using System.Security.Claims;
using CarDealer.Api.Auth;
using CarDealer.Api.Common;
using CarDealer.Api.Configuration;
using CarDealer.Api.Contracts;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CarDealer.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request) =>
        this.ToActionResult(await auth.LoginAsync(request));

    [HttpGet("me")]
    [Authorize]
    public ActionResult<object> Me() => new
    {
        email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value,
        roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value),
    };
}

/// <summary>Key numbers for the staff dashboard.</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = Roles.Staff)]
public class DashboardController(IDashboardService dashboard) : ControllerBase
{
    [HttpGet]
    public async Task<DashboardDto> Get(CancellationToken ct) => await dashboard.GetAsync(ct);
}
