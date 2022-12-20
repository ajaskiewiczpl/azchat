using System.Collections.Concurrent;
using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;
using AZChat.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Internal;

namespace AZChat.Services.Hubs.Chat;

public class ChatHubService : IChatHubService
{
    private readonly IHubContext<ChatHub> _chatContext;
    private readonly ISystemClock _systemClock;
    private readonly IMapper _mapper;
    
    public ChatHubService(IHubContext<ChatHub> chatContext, ISystemClock systemClock, IMapper mapper)
    {
        _chatContext = chatContext;
        _systemClock = systemClock;
        _mapper = mapper;
    }
    
    public async Task SendMessageAsync(Message message)
    {
        IClientProxy client = _chatContext.Clients.User(message.ToUserId);
        MessageDto messageDto = _mapper.Map<Message, MessageDto>(message);
        await client.SendAsync("onMessage", messageDto);
    }
}