﻿using System.ComponentModel.DataAnnotations;
using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;
using AZChat.Services.Data;
using AZChat.Services.Hubs.Chat;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AZChat.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly IChatHubService _chatHubService;

    public ChatController(AppDbContext dbContext, IMapper mapper, IChatHubService chatHubService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _chatHubService = chatHubService;
    }

    [HttpGet("test")]
    public async Task<ActionResult> Test()
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

    [HttpPost("messages/send")]
    public async Task<ActionResult> SendMessage(SendMessageRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }

        string currentUserId = User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;

        if (request.RecipientUserId.Equals(currentUserId))
        {
            return Ok();
        }
        
        await _chatHubService.SendMessageAsync(currentUserId, request.RecipientUserId, request.Body);

        return Ok();
    }
    
    [HttpGet("messages/latest")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetLatestMessages()
    {
        return Ok(Array.Empty<MessageDto>());
    }
}

public class SendMessageRequestDto
{
    [Required]
    public string RecipientUserId { get; set; } = null!;

    [Required]
    public string Body { get; set; } = null!;
}

public class FriendDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
}