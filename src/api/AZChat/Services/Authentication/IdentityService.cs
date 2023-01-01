using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Services.Data.Sql;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AZChat.Services.Authentication;

public class IdentityService : IIdentityService
{
    private readonly IOptions<JwtConfiguration> _jwtConfig;
    private readonly AppDbContext _appDbContext;
    private readonly UserManager<User> _userManager;
    private readonly IAuthTokenService _authTokenService;
    private readonly IMapper _mapper;
    private readonly TokenValidationParameters _tokenValidationParameters;
    private readonly IDateTime _dateTime;
    private readonly ILogger<IdentityService> _logger;

    public IdentityService(IOptions<JwtConfiguration> jwtConfig, AppDbContext appDbContext, UserManager<User> userManager, IAuthTokenService authTokenService, IMapper mapper, TokenValidationParameters tokenValidationParameters, IDateTime dateTime, ILogger<IdentityService> logger)
    {
        _jwtConfig = jwtConfig;
        _appDbContext = appDbContext;
        _userManager = userManager;
        _authTokenService = authTokenService;
        _mapper = mapper;
        _tokenValidationParameters = tokenValidationParameters;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<IdentityResult> RegisterAsync(string userName, string password)
    {
        User user = new ()
        {
            UserName = userName
        };

        Microsoft.AspNetCore.Identity.IdentityResult identityResult = await _userManager.CreateAsync(user, password);

        if (identityResult.Succeeded)
        {
            return new IdentityResult();
        }
        else
        {
            return new IdentityResult()
            {
                Errors = identityResult.Errors.ToList()
            };
        }
    }

    public async Task<IdentityResult> AuthenticateAsync(string userName, string password)
    {
        User? user = await _userManager.FindByNameAsync(userName);

        if (user == null)
        {
            return new IdentityResult()
            {
                Errors = new()
                {
                    new IdentityError()
                    {
                        Description = "User doesn't exist"
                    }
                }
            };
        }

        bool isPasswordValid = await _userManager.CheckPasswordAsync(user, password);

        if (!isPasswordValid)
        {
            return new IdentityResult()
            {
                Errors = new()
                {
                    new IdentityError()
                    {
                        Description = "Invalid password"
                    }
                }
            };
        }

        return await GenerateAuthTokenAsync(user);
    }

    public async Task<IdentityResult> ChangePasswordAsync(string userName, string currentPassword, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(userName))
        {
            throw new ArgumentNullException(nameof(userName));
        }

        User? user = await _userManager.FindByNameAsync(userName);

        if (user == null)
        {
            return new IdentityResult()
            {
                Errors = new List<IdentityError>()
                {
                    new IdentityError()
                    {
                        Description = "User doesn't exist"
                    }
                }
            };
        }

        Microsoft.AspNetCore.Identity.IdentityResult result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        
        return new IdentityResult()
        {
            Errors = result.Errors.ToList()
        };
    }

    public async Task<IdentityResult> RefreshTokenAsync(string token, string refreshToken)
    {
        IdentityResult errorResult = new IdentityResult()
        {
            Errors = new List<IdentityError>()
            {
                new ()
                {
                    Description = "Could not refresh the token"
                }
            }
        };

        ClaimsPrincipal? validatedToken = GetPrincipalFromToken(token);

        if (validatedToken == null)
        {
            _logger.LogDebug("Invalid token");
            return errorResult;
        }

        long expiryDateUnix = long.Parse(validatedToken.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Exp).Value);
        DateTime expiryDateUtc = DateTime.UnixEpoch.AddSeconds(expiryDateUnix);

        if (expiryDateUtc > _dateTime.UtcNow)
        {
            _logger.LogDebug("Token hasn't expired yet");
            return new IdentityResult()
            {
                Token = token,
                RefreshToken = refreshToken
            };
        }
        
        RefreshToken? storedRefreshToken = await _appDbContext.RefreshTokens.SingleOrDefaultAsync(x => x.Token == refreshToken);

        _logger.LogDebug("Stored refresh token: {@stored}", storedRefreshToken);

        if (storedRefreshToken == null)
        {
            _logger.LogDebug("Refresh token doesn't exist");
            return errorResult;
        }

        string jti = validatedToken.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Jti).Value;

        _logger.LogDebug("JTI of the old token: {jti}", jti);

        if (storedRefreshToken.JwtId != jti)
        {
            _logger.LogDebug("Refresh token doesn't match JWT. Refresh token: {refreshToken} Token JTI: {tokenJti}", storedRefreshToken.JwtId, jti);
            return errorResult;
        }

        if (_dateTime.UtcNow > storedRefreshToken.ExpiresOn)
        {
            _logger.LogDebug("Refresh token has expired");
            return errorResult;
        }
        
        if (storedRefreshToken.Used)
        {
            _logger.LogDebug("Refresh token has been used");
            return errorResult;
        }

        storedRefreshToken.Used = true;
        _appDbContext.RefreshTokens.Update(storedRefreshToken);
        await _appDbContext.SaveChangesAsync();

        User? user = await _userManager.FindByIdAsync(validatedToken.Claims.Single(x => x.Type == CustomClaims.UserId).Value);

        if (user == null)
        {
            _logger.LogDebug("User doesn't exist");
            return errorResult;
        }

        return await GenerateAuthTokenAsync(user);
    }

    public async Task SignOutAsync(string refreshToken)
    {
        RefreshToken? storedRefreshToken = await _appDbContext.RefreshTokens.SingleOrDefaultAsync(x => x.Token == refreshToken);

        if (storedRefreshToken != null)
        {
            _appDbContext.RefreshTokens.Remove(storedRefreshToken);
            await _appDbContext.SaveChangesAsync();
        }
    }

    private async Task<IdentityResult> GenerateAuthTokenAsync(User user)
    {
        SecurityToken token = await _authTokenService.GetAuthTokenAsync(user);

        RefreshToken refreshToken = new RefreshToken()
        {
            JwtId = token.Id,
            UserId = user.Id,
            CreatedOn = _dateTime.UtcNow,
            ExpiresOn = _dateTime.UtcNow.Add(_jwtConfig.Value.RefreshTokenLifetime)
        };

        await _appDbContext.RefreshTokens.AddAsync(refreshToken);
        await _appDbContext.SaveChangesAsync();

        string authToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new IdentityResult()
        {
            Token = authToken,
            RefreshToken = refreshToken.Token
        };
    }

    private ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            TokenValidationParameters tokenValidationParametersForExpiredToken = _tokenValidationParameters.Clone();
            tokenValidationParametersForExpiredToken.ValidateLifetime = false;

            ClaimsPrincipal? principal = tokenHandler.ValidateToken(token, tokenValidationParametersForExpiredToken, out SecurityToken? validatedToken);
            if (!HasValidSecurityAlgorithm(validatedToken))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private bool HasValidSecurityAlgorithm(SecurityToken token)
    {
        return (token is JwtSecurityToken jwtSecurityToken) &&
               jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                   StringComparison.InvariantCultureIgnoreCase);
    }
}