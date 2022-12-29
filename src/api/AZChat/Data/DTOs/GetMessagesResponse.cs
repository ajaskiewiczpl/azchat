using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class GetMessagesResponse
{
    [Required]
    public List<MessageDto> Messages { get; set; } = new();

    [Required]
    public string ContinuationToken { get; set; } = null!;

    [Required]
    public bool HasMoreMessages { get; set; }
}