using AZChat.Data.Models;

namespace AZChat.Services.Authentication;

public interface IAuthTokenService
{
    Task<string> GetAuthTokenAsync(User user);
}