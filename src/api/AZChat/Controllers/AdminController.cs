using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.DTOs.Admin;
using AZChat.Hubs;
using AZChat.Services.Data.Blob;
using AZChat.Services.Data.CosmosDb;
using AZChat.Services.Utils;
using AZChat.Services.Utils.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using User = AZChat.Data.Models.User;

namespace AZChat.Controllers;

[ApiController]
[Authorize(Roles = Roles.Admin)]
[Route("api/[controller]")]
public class AdminController : BaseController
{
    private readonly UserManager<User> _userManager;
    private readonly IBlobStorageService _blobStorage;
    private readonly IMessageStorage _messageStorage;
    private readonly IHubContext<AdminHub> _adminHub;
    private readonly IMapper _mapper;
    private readonly ILogger<AdminController> _logger;

    public AdminController(UserManager<User> userManager, IBlobStorageService blobStorage, IMessageStorage messageStorage, IHubContext<AdminHub> adminHub, IMapper mapper, ILogger<AdminController> logger)
    {
        _userManager = userManager;
        _blobStorage = blobStorage;
        _messageStorage = messageStorage;
        _adminHub = adminHub;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        List<User> users = await _userManager.Users.ToListAsync();
        return Ok(_mapper.Map<List<User>, List<UserDto>>(users));
    }

    [HttpPost("users/password")]
    public async Task<ActionResult> ChangeUserPassword(ChangeUserPasswordRequest request)
    {
        User? user = await _userManager.FindByIdAsync(request.UserID);

        if (user == null)
        {
            return NotFound();
        }

        string token = await _userManager.GeneratePasswordResetTokenAsync(user);
        IdentityResult result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

        if (result.Succeeded)
        {
            return NoContent();
        }
        else
        {
            return Problem();
        }
    }

    [HttpDelete("users")]
    public async Task<ActionResult> DeleteUsers(DeleteUsersRequestDto request)
    {
        int i = 0;
        foreach (string userID in request.UserIDs)
        {
            await _blobStorage.DeleteUserDataAsync(userID);
            await _messageStorage.DeleteAsync(userID);
            await _userManager.DeleteByIdAsync(userID);

            if (!string.IsNullOrWhiteSpace(request.SignalRConnectionID))
            {
                float progress = (++i / (float)request.UserIDs.Count) * 100.0f;
                await _adminHub
                    .Clients
                    .Client(request.SignalRConnectionID)
                    .SendAsync("onUsersDeleteProgress", progress);
            }
        }
        
        return Ok();
    }
}