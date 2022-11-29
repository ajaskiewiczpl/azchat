using AutoMapper;
using AZChat.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<UserController> _logger;

    public UserController(UserManager<User> userManager, IMapper mapper, ILogger<UserController> logger)
    {
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login()
    {
        return await Task.FromResult(Ok());
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterUserResponseDto>> Register(RegisterUserRequestDto request)
    {
        RegisterUserResponseDto response = new();

        User user = _mapper.Map<User>(request);
        IdentityResult identityResult = await _userManager.CreateAsync(user, request.Password);
        List<IdentityError> errors = identityResult.Errors.ToList();

        if (errors.Any())
        {
            response.Errors = errors;
            _logger.LogInformation("There were errors while creating a user: {@errors}", errors); // TODO need to log?
            return BadRequest(response);
        }
        else
        {
            return Ok(response);
        }
    }
}

public class RegisterUserRequestDto
{
    public string UserName { get; set; }
    public string Password { get; set; }
}

public class RegisterUserResponseDto
{
    public List<IdentityError> Errors { get; set; } = new();
}

public class UserMapProfile : Profile
{
    public UserMapProfile()
    {
        CreateMap<RegisterUserRequestDto, User>();
    }
}
