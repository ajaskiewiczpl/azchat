using System.Collections.Concurrent;
using AZChat.Data.DTOs;
using AZChat.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Internal;

namespace AZChat.Services.Hubs.Chat;

public class ChatHubService : IChatHubService
{
    private readonly IHubContext<ChatHub> _chatContext;
    private readonly ISystemClock _systemClock;
    
    public ChatHubService(IHubContext<ChatHub> chatContext, ISystemClock systemClock)
    {
        _chatContext = chatContext;
        _systemClock = systemClock;
    }
    
    public async Task SendMessageAsync(string senderUserId, string recipientUserId, string body)
    {
        IClientProxy client = _chatContext.Clients.User(recipientUserId);
        await client.SendAsync("onMessage", new MessageDto()
        {
            Timestamp = _systemClock.UtcNow,
            FromUserId = senderUserId,
            ToUserId = recipientUserId,
            Body = body
        });
    }
}