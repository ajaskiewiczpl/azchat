namespace AZChat.Data.DTOs;

public class MessageDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FromId { get; set; } = null!;
    public string ToId { get; set; } = null!;
    public string MessageText { get; set; } = null!;
}