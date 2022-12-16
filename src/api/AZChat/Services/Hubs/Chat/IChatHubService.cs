using AZChat.Data.DTOs;

namespace AZChat.Services.Hubs.Chat;

public interface IChatHubService
{
    Task SendMessageAsync(MessageDto message);
}