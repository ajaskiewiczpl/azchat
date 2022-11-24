using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        [HttpGet("check")]
        public ActionResult<bool> Check()
        {
            return true;
        }
    }
}