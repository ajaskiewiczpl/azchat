using Microsoft.AspNetCore.Identity;

namespace AZChat.Data.DTOs;

public class ChangePasswordResponseDto
{
    public List<IdentityError> Errors { get; set; } = new();

    public bool Success => !Errors.Any();
}