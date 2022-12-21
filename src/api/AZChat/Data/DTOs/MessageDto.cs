using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public enum MessageStatus
{
    New,
    Sending,
    Sent,
    Received
}

public class MessageDto
{
    [Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public MessageStatus Status { get; set; }

    [Required]
    public DateTimeOffset Timestamp { get; set; }

    [Required] 
    public string FromUserId { get; set; } = null!;

    [Required]
    public string ToUserId { get; set; } = null!;

    [Required]
    public string Body { get; set; } = null!;
}