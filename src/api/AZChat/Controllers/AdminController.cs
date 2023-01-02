using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Authorize(Roles = Roles.Admin)]
[Route("api/[controller]")]
public class AdminController : BaseController
{
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        return Ok("admin");
    }
}