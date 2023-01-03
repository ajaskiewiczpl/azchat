using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class FriendDto : UserDto
{
    [Required]
    public int UnreadMessagesCount { get; set; }
}