using AZChat.Data.DTOs;
using AZChat.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace AZChat.Services.Authentication;

public interface IIdentityService
{
    Task<IdentityResult> RegisterAsync(string userName, string password);
    Task<IdentityResult> AuthenticateAsync(string userName, string password);
    Task<IdentityResult> RefreshTokenAsync(string token, string refreshToken);
    Task<IdentityResult> ChangePasswordAsync(string userName, string currentPassword, string newPassword);
    Task SignOutAsync(string refreshToken);
    Task CreateAdminAccountIfNotExistsAsync(string userName, string password);
}

public class IdentityResult
{
    public string? Token { get; set; }

    public string? RefreshToken { get; set; }

    public List<IdentityError> Errors { get; set; } = new();

    public bool Success => !Errors.Any();
}