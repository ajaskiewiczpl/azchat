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
    private readonly IOptions<JwtConfiguration> _authConfig;
    private readonly IDateTime _dateTime;

    public JwtAuthTokenService(IOptions<JwtConfiguration> authConfig, IDateTime dateTime)
    {
        _authConfig = authConfig;
        _dateTime = dateTime;
    }

    public Task<SecurityToken> GetAuthTokenAsync(User user)
    {
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_authConfig.Value.Secret));
        SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        DateTime expires = _dateTime.UtcNow.Add(_authConfig.Value.JwtLifetime);

        List<Claim> claims = new List<Claim>()
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new (CustomClaims.UserId, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Name, user.UserName),
            new (ClaimTypes.Name, user.UserName),
            new (ClaimTypes.NameIdentifier, user.UserName),
        };

        SecurityTokenDescriptor tokenDescriptor = new()
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            SigningCredentials = credentials,
            Issuer = _authConfig.Value.Issuer,
            Audience = _authConfig.Value.Audience
        };

        SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);
        return Task.FromResult(token);
    }
}