using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;
using AZChat.Services.Data.CosmosDb;
using AZChat.Services.Data.Sql;
using AZChat.Services.Hubs.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Internal;

namespace AZChat.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChatController : BaseController
{
    private readonly AppDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly IChatHubService _chatHubService;
    private readonly IMessageStorage _messageStorage;
    private readonly ISystemClock _systemClock;

    public ChatController(AppDbContext dbContext, IMapper mapper, IChatHubService chatHubService, IMessageStorage messageStorage, ISystemClock systemClock)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _chatHubService = chatHubService;
        _messageStorage = messageStorage;
        _systemClock = systemClock;
    }

    [HttpGet("ping")]
    public async Task<ActionResult> Ping()
    {
        return Ok();
    }

    [HttpGet("friends")]
    public async Task<ActionResult<IEnumerable<FriendDto>>> GetFriends()
    {
        List<User> users = await _dbContext.Users.ToListAsync();
        IEnumerable<FriendDto> friends = _mapper.Map<List<User>, IEnumerable<FriendDto>>(users);
        return Ok(friends);
    }

    [HttpPost("send")]
    public async Task<ActionResult<MessageDto>> SendMessage(SendMessageRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }
        
        Message message = new Message()
        {
            Timestamp = _systemClock.UtcNow,
            FromUserId = UserId,
            ToUserId = request.RecipientUserId,
            Body = request.Body
        };

        await _messageStorage.AddAsync(message);

        if (!request.RecipientUserId.Equals(UserId)) // recipient is the same as sender (send message to self - don't notify)
        {
            await _chatHubService.SendMessageAsync(message);
        }

        MessageDto messageDto = _mapper.Map<Message, MessageDto>(message);
        messageDto.Status = MessageStatus.Sent;
        return Ok(messageDto);
    }

    [HttpGet("messages")]
    public async Task<ActionResult<GetMessagesResponse>> GetMessages(string otherUserId, string? continuationToken = null)
    {
        GetMessagesResult result = await _messageStorage.GetAsync(UserId, otherUserId, continuationToken);

        GetMessagesResponse response = new GetMessagesResponse()
        {
            Messages = _mapper.Map<List<Message>, List<MessageDto>>(result.Messages),
            ContinuationToken = result.ContinuationToken,
            HasMoreMessages = result.HasMoreMessages
        };
        
        return Ok(response);
    }
}