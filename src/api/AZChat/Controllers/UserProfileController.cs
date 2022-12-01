using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    [Authorize]
    [HttpGet()]
    public async Task<ActionResult> GetProfile()
    {
        return Ok(User.Identity.Name);
    }
}