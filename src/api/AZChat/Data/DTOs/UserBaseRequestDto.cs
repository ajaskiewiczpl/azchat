using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class UserBaseRequestDto
{
    [Required] 
    public string UserName { get; set; } = null!;

    [Required] 
    public string Password { get; set; } = null!;
}