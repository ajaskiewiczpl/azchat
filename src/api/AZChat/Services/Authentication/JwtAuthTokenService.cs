using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Services.Utils;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace AZChat.Services.Authentication;

public class JwtAuthTokenService : IAuthTokenService
{
    private readonly IOptions<AuthenticationConfiguration> _authConfig;
    private readonly IDateTime _dateTime;

    public JwtAuthTokenService(IOptions<AuthenticationConfiguration> authConfig, IDateTime dateTime)
    {
        _authConfig = authConfig;
        _dateTime = dateTime;
    }

    public Task<string> GetAuthTokenAsync(User user)
    {
        SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_authConfig.Value.Secret));
        SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        DateTime expires = _dateTime.Now.AddDays(_authConfig.Value.ExpireDays);

        List<Claim> claims = new List<Claim>()
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName)
        };

        JwtSecurityToken token = new JwtSecurityToken(
            issuer: _authConfig.Value.Issuer,
            audience: _authConfig.Value.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        string tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
        return Task.FromResult(tokenStr);
    }
}