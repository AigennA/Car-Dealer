using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CarDealer.Api.Auth;

public class JwtOptions
{
    public const string Section = "Jwt";
    public const int MinKeyBytes = 32;
    public string Issuer { get; set; } = "car-dealer-api";
    public string Audience { get; set; } = "car-dealer-web";
    /// <summary>HMAC-SHA256 signing key, at least 32 characters. Set via environment/user-secrets.</summary>
    public string Key { get; set; } = "";
    public int LifetimeMinutes { get; set; } = 120;
    public int ClockSkewSeconds { get; set; } = 60;
}

/// <summary>Issues short-lived JWT access tokens for staff after a successful login.</summary>
public class TokenService(IOptions<JwtOptions> options, TimeProvider clock)
{
    private readonly JwtOptions _o = options.Value;

    public (string Token, DateTime ExpiresAt) Create(IdentityUser user, IList<string> roles)
    {
        var expires = clock.GetUtcNow().UtcDateTime.AddMinutes(_o.LifetimeMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_o.Key)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(_o.Issuer, _o.Audience, claims, expires: expires, signingCredentials: credentials);
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
