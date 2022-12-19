using System.Collections.Concurrent;
using AZChat.Data.DTOs;
using AZChat.Hubs;
using Microsoft.AspNetCore.Authorization;
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
        IClientProxy client = _chatContext.Clients.User(message.ToId);
        await client.SendAsync("onMessage", message);
    }
}