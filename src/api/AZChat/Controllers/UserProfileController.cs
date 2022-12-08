using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace AZChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    [Authorize]
    [HttpGet()]
    public async Task<ActionResult> GetProfile()
    {
        string userName = User.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Name).Value;
        return Ok(userName);
    }
}