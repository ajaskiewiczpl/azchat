namespace AZChat.Data.DTOs;

public class MessageDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FromUserId { get; set; } = null!;
    public string Body { get; set; } = null!;
}