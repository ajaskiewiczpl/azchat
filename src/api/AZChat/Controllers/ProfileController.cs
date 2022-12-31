using System.Drawing;
using System.Drawing.Imaging;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private string userAvatarPath = "D:/user.png";

    [HttpGet("avatar/{userId}")]
    public async Task<ActionResult<string>> GetAvatar(string userId)
    {
        if (System.IO.File.Exists(userAvatarPath))
        {
            byte[] data = await System.IO.File.ReadAllBytesAsync(userAvatarPath);
            string response = ImageUtils.ToBase64Png(data);
            return Ok(response);
        }
        else
        {
            return NotFound();
        }
    }

    [HttpPost("avatar")]
    public async Task<ActionResult<string>> SetAvatar(IFormFile? file)
    {
        if (file == null)
        {
            return BadRequest();
        }

        using (Stream fileStream = file.OpenReadStream())
        using (MemoryStream ms = new MemoryStream())
        {
            Image img = Image.FromStream(fileStream);
            img = ImageUtils.Resize(img, 64);
            img.Save(ms, ImageFormat.Png);

            await System.IO.File.WriteAllBytesAsync(userAvatarPath, ms.GetBuffer());

            string imageBase64 = ImageUtils.ToBase64Png(ms.GetBuffer());
            return Ok(imageBase64);
        }
    }
}