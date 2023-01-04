using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs.Admin;

public class ChangeUserPasswordRequest
{
    [Required]
    public string UserID { get; set; } = null!;

    [Required]
    public string NewPassword { get; set; } = null!;
}