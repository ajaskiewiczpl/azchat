namespace AZChat.Data.DTOs;

public class FriendDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public int UnreadMessagesCount { get; set; }
}