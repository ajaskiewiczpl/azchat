using AZChat.Services.Utils;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

public class BaseController : ControllerBase
{
    protected string UserId => User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;
}