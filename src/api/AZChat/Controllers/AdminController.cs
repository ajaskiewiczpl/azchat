using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;
using AZChat.Hubs;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AZChat.Controllers;

[ApiController]
[Authorize(Roles = Roles.Admin)]
[Route("api/[controller]")]
public class AdminController : BaseController
{
    private readonly UserManager<User> _userManager;
    private readonly IHubContext<AdminHub> _adminHub;
    private readonly IMapper _mapper;
    private readonly ILogger<AdminController> _logger;

    public AdminController(UserManager<User> userManager, IHubContext<AdminHub> adminHub, IMapper mapper, ILogger<AdminController> logger)
    {
        _userManager = userManager;
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

    [HttpDelete("users")]
    public async Task<ActionResult> DeleteUsers(DeleteUsersRequestDto request)
    {
        for (int i = 0; i < 100; i++)
        {
            await Task.Delay(20);

            if (!string.IsNullOrWhiteSpace(request.SignalRConnectionID))
            {
                await _adminHub
                    .Clients
                    .Client(request.SignalRConnectionID)
                    .SendAsync("onUsersDeleteProgress", i + 1);
            }
        }
        
        return Ok();
    }
}