using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace AZChat.Services.Authentication;

public class JwtAuthTokenService : IAuthTokenService
{
    private readonly IOptions<JwtConfiguration> _authConfig;
    private readonly UserManager<User> _userManager;
    private readonly IDateTime _dateTime;

    public JwtAuthTokenService(IOptions<JwtConfiguration> authConfig, UserManager<User> userManager, IDateTime dateTime)
    {
        _authConfig = authConfig;
        _userManager = userManager;
        _dateTime = dateTime;
    }

    public async Task<SecurityToken> GetAuthTokenAsync(User user)
    {
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_authConfig.Value.Secret));
        SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        DateTime expires = _dateTime.UtcNow.Add(_authConfig.Value.JwtLifetime);

        List<Claim> allClaims = new List<Claim>()
        {
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Name, user.UserName),
            new (ClaimTypes.Name, user.UserName),
            new (ClaimTypes.NameIdentifier, user.UserName),
            new (CustomClaims.UserId, user.Id),
        };

        IList<Claim> userClaims = await _userManager.GetClaimsAsync(user);
        IList<string> userRoles = await _userManager.GetRolesAsync(user);

        allClaims.AddRange(userClaims);
        allClaims.AddRange(userRoles.Select(roleName => new Claim(ClaimTypes.Role, roleName)));

        SecurityTokenDescriptor tokenDescriptor = new()
        {
            Subject = new ClaimsIdentity(allClaims),
            Expires = expires,
            SigningCredentials = credentials,
            Issuer = _authConfig.Value.Issuer,
            Audience = _authConfig.Value.Audience
        };

        SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);
        return token;
    }
}