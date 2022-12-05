using AZChat.Data.Models;
using Microsoft.IdentityModel.Tokens;

namespace AZChat.Services.Authentication;

public interface IAuthTokenService
{
    Task<SecurityToken> GetAuthTokenAsync(User user);
}