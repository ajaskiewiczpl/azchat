using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;
using AZChat.Services.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AZChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IdentityController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IAuthTokenService _authTokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<IdentityController> _logger;

    public IdentityController(UserManager<User> userManager, IAuthTokenService authTokenService, IMapper mapper, ILogger<IdentityController> logger)
    {
        _userManager = userManager;
        _authTokenService = authTokenService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpPost("signup")]
    public async Task<ActionResult<RegisterUserResponseDto>> SignUp(UserBaseRequestDto baseRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }

        RegisterUserResponseDto response = new();

        User user = _mapper.Map<User>(baseRequest);
        IdentityResult identityResult = await _userManager.CreateAsync(user, baseRequest.Password);
        List<IdentityError> errors = identityResult.Errors.ToList();

        if (errors.Any())
        {
            response.Errors = errors;
            _logger.LogInformation("There were errors while creating a user: {@errors}", errors);
            return BadRequest(response);
        }
        else
        {
            return Ok(response);
        }
    }

    [HttpPost("signin")]
    public async Task<ActionResult> SignIn(UserBaseRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }

        User? user = await _userManager.Users.SingleOrDefaultAsync(x => string.Equals(x.UserName, request.UserName));

        if (user == null)
        {
            return Unauthorized();
        }

        bool isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
        {
            return Unauthorized();
        }
        
        string authToken = await _authTokenService.GetAuthTokenAsync(user);
        return Ok(authToken);
    }
}