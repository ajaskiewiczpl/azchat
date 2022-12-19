using AZChat.Data.DTOs;

namespace AZChat.Services.Hubs.Chat;

public interface IChatHubService
{
    Task SendMessageAsync(string senderUserId, string recipientUserId, string body);
}