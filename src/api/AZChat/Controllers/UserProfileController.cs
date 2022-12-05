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
        string userId = User.Claims.Single(x => x.Type == CustomClaims.UserIdClaim).Value;
        return Ok(userId);
    }
}