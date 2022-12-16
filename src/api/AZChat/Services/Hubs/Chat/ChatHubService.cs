using AZChat.Data.DTOs;
using AZChat.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AZChat.Services.Hubs.Chat;

public class ChatHubService : IChatHubService
{
    private readonly IHubContext<ChatHub> _chatContext;

    public ChatHubService(IHubContext<ChatHub> chatContext)
    {
        _chatContext = chatContext;
    }

    public async Task SendMessageAsync(MessageDto message)
    {
        await _chatContext.Clients.Groups(message.FromId).SendAsync("onMessage", message);
    }
}