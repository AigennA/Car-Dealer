using CarDealer.Api.Auth;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(UserManager<IdentityUser> users, TokenService tokens) : ControllerBase
{
    /// <summary>Staff login. Locks the account for 15 minutes after 5 wrong passwords.</summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest req)
    {
        var user = await users.FindByEmailAsync(req.Email);
        if (user is null || await users.IsLockedOutAsync(user))
            return Problem(statusCode: 401, title: "Fel e-post eller lösenord.");

        if (!await users.CheckPasswordAsync(user, req.Password))
        {
            await users.AccessFailedAsync(user);
            return Problem(statusCode: 401, title: "Fel e-post eller lösenord.");
        }
        await users.ResetAccessFailedCountAsync(user);

        var roles = await users.GetRolesAsync(user);
        var (token, expires) = tokens.Create(user, roles);
        return new LoginResponse(token, expires, user.Email!, roles.ToArray());
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<object> Me() => new
    {
        email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value,
        roles = User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value),
    };
}

/// <summary>Key numbers for the staff dashboard.</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = Roles.Staff)]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken ct) => new DashboardDto(
        await db.Cars.CountAsync(c => c.Status == CarStatus.Available, ct),
        await db.Cars.CountAsync(c => c.Status == CarStatus.Reserved, ct),
        await db.Cars.CountAsync(c => c.Status == CarStatus.Sold, ct),
        await db.Leads.CountAsync(l => l.Status == RequestStatus.New, ct),
        await db.TradeIns.CountAsync(t => t.Status == RequestStatus.New, ct),
        await db.Cars.Where(c => c.Status == CarStatus.Available).SumAsync(c => c.Price, ct));
}
