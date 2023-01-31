using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class AvatarResponse
{
    [Required]
    public string AvatarData { get; set; }
}