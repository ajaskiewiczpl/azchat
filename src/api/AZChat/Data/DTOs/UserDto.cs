using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class UserDto
{
    [Required]
    public string Id { get; set; } = null!;

    [Required]
    public string UserName { get; set; } = null!;
}