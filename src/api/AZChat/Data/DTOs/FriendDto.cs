using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class FriendDto
{
    [Required]
    public string Id { get; set; } = null!;

    [Required]
    public string UserName { get; set; } = null!;

    [Required]
    public int UnreadMessagesCount { get; set; }
}