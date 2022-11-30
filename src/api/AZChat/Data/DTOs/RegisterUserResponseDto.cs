using Microsoft.AspNetCore.Identity;

namespace AZChat.Data.DTOs;

public class RegisterUserResponseDto
{
    public List<IdentityError> Errors { get; set; } = new();
}