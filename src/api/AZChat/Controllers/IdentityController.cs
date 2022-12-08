using System.Net;
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
            AddRefreshTokenToResponse(authResult.RefreshToken);
            return Ok(response);
        }
        else
        {
            return Unauthorized();
        }
    }

    [HttpPost("refreshToken")]
    public async Task<ActionResult<AuthenticationResponseDto>> RefreshToken(RefreshTokenRequestDto requestDto)
    {
        string? refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            _logger.LogInformation("Could not find refresh token cookie");
            return BadRequest();
        }

        AuthenticationResult authResult = await _identityService.RefreshTokenAsync(requestDto.Token, refreshToken);
        if (authResult.Success)
        {
            AuthenticationResponseDto response = new()
            {
                Token = authResult.Token
            };

            AddRefreshTokenToResponse(authResult.RefreshToken);

            return Ok(response);
        }
        else
        {
            return Unauthorized();
        }
    }

    private void AddRefreshTokenToResponse(string refreshToken)
    {
        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions()
        {
            HttpOnly = true
        });
    }
}