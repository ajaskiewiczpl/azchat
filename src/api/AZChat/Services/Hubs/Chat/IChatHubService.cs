using AZChat.Data.DTOs;
using AZChat.Data.Models;

namespace AZChat.Services.Hubs.Chat;

public interface IChatHubService
{
    Task SendMessageAsync(Message message);
}