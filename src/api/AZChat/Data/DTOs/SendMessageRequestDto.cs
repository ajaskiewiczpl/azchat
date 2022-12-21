using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class SendMessageRequestDto
{
    [Required]
    public string RecipientUserId { get; set; } = null!;

    [Required]
    public string Body { get; set; } = null!;
}