using CarDealer.Api.Auth;
using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Data;
using CarDealer.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CarDealer.Api.Services;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request);
}

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(CancellationToken ct);
}

/// <summary>Staff login with lockout; identical error for unknown user and wrong password.</summary>
public sealed class AuthService(UserManager<IdentityUser> users, TokenService tokens) : IAuthService
{
    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest req)
    {
        var user = await users.FindByEmailAsync(req.Email);
        if (user is null || await users.IsLockedOutAsync(user)) return Error.Unauthorized(Messages.LoginFailed);

        if (!await users.CheckPasswordAsync(user, req.Password))
        {
            await users.AccessFailedAsync(user);
            return Error.Unauthorized(Messages.LoginFailed);
        }
        await users.ResetAccessFailedCountAsync(user);

        var roles = await users.GetRolesAsync(user);
        var (token, expires) = tokens.Create(user, roles);
        return new LoginResponse(token, expires, user.Email!, roles.ToArray());
    }
}

public sealed class DashboardService(AppDbContext db) : IDashboardService
{
    public async Task<DashboardDto> GetAsync(CancellationToken ct) => new(
        await db.Cars.CountAsync(c => c.Status == CarStatus.Available, ct),
        await db.Cars.CountAsync(c => c.Status == CarStatus.Reserved, ct),
        await db.Cars.CountAsync(c => c.Status == CarStatus.Sold, ct),
        await db.Leads.CountAsync(l => l.Status == RequestStatus.New, ct),
        await db.TradeIns.CountAsync(t => t.Status == RequestStatus.New, ct),
        await db.Cars.Where(c => c.Status == CarStatus.Available).SumAsync(c => c.Price, ct));
}
