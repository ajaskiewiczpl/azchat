using AZChat.Data.DTOs;
using AZChat.Services.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IdentityController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly ILogger<IdentityController> _logger;

    public IdentityController(IIdentityService identityService, ILogger<IdentityController> logger)
    {
        _identityService = identityService;
        _logger = logger;
        _identityService = identityService;
    }

    [HttpPost("signup")]
    public async Task<ActionResult<AuthenticationResponseDto>> SignUp(UserBaseRequestDto request)
    {
        AuthenticationResponseDto response = new();

        if (!ModelState.IsValid)
        {
            response.Errors = ModelState.Values.SelectMany(x => x.Errors.Select(y => new IdentityError()
            {
                Description = y.ErrorMessage
            })).ToList();
            return BadRequest();
        }
        
        AuthenticationResult authResult = await _identityService.RegisterAsync(request.UserName, request.Password);

        if (authResult.Success)
        {
            return Ok(response);
        }
        else
        {
            response.Errors = authResult.Errors;
            return BadRequest(response);
        }
    }

    [HttpPost("signin")]
    public async Task<ActionResult<AuthenticationResponseDto>> SignIn(UserBaseRequestDto request)
    {
        AuthenticationResponseDto response = new();

        if (!ModelState.IsValid)
        {
            response.Errors = ModelState.Values.SelectMany(x => x.Errors.Select(y => new IdentityError()
            {
                Description = y.ErrorMessage
            })).ToList();
            return BadRequest();
        }

        AuthenticationResult authResult = await _identityService.AuthenticateAsync(request.UserName, request.Password);

        if (authResult.Success)
        {
            response.Token = authResult.Token;
            response.RefreshToken = authResult.RefreshToken;
            return Ok(response);
        }
        else
        {
            return Unauthorized();
        }
    }

    [HttpPost("refreshToken")]
    public async Task<ActionResult<AuthenticationResponseDto>> RefreshToken(RefreshTokenRequest request)
    {
        AuthenticationResult result = await _identityService.RefreshTokenAsync(request.Token, request.RefreshToken);
        if (result.Success)
        {
            AuthenticationResponseDto response = new()
            {
                Token = result.Token,
                RefreshToken = result.RefreshToken
            };

            return Ok(response);
        }
        else
        {
            return Unauthorized();
        }
    }
}