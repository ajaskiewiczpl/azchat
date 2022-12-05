using AZChat.Data.DTOs;
using Microsoft.AspNetCore.Identity;

namespace AZChat.Services.Authentication;

public interface IIdentityService
{
    Task<AuthenticationResult> RegisterAsync(string userName, string password);
    Task<AuthenticationResult> AuthenticateAsync(string userName, string password);
    Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
}

public class AuthenticationResult
{
    public string? Token { get; set; }

    public string? RefreshToken { get; set; }

    public List<IdentityError> Errors { get; set; } = new();

    public bool Success => !Errors.Any();
}