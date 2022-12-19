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
    
    public async Task SendMessageAsync(string senderUserId, string recipientUserId, string body)
    {
        IClientProxy client = _chatContext.Clients.User(recipientUserId);
        await client.SendAsync("onMessage", new MessageDto()
        {
            FromUserId = senderUserId,
            Body = body
        });
    }
}