using Microsoft.AspNetCore.Identity;

namespace AZChat.Data.DTOs;

public class AuthenticationResponseDto
{
    public string? Token { get; set; }

    public List<IdentityError> Errors { get; set; } = new();

    public bool Success => !Errors.Any();
}