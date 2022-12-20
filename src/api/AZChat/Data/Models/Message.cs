namespace AZChat.Data.Models;

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTimeOffset Timestamp { get; set; }

    public string FromUserId { get; set; } = null!;

    public string ToUserId { get; set; } = null!;

    public string Body { get; set; } = null!;
}