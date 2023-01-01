using System.Drawing;
using System.Drawing.Imaging;
using AZChat.Services.Data.Blob;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AZChat.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IAvatarService _avatarService;

    public ProfileController(IAvatarService avatarService)
    {
        _avatarService = avatarService;
    }

    [HttpGet("avatar/{userId}")]
    public async Task<ActionResult<string>> GetAvatar(string userId)
    {
        // TODO caching
        byte[] avatar = await _avatarService.GetAvatarAsync(userId);

        if (avatar.Any())
        {
            string response = ImageUtils.ToBase64Png(avatar);
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

        using (Stream inputFileStream = file.OpenReadStream())
        using (MemoryStream ms = new MemoryStream())
        {
            Image avatar = _avatarService.CreateAvatar(inputFileStream);
            avatar.Save(ms, ImageFormat.Png);
            
            string currentUserId = User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;
            ms.Seek(0, SeekOrigin.Begin);
            await _avatarService.UploadAvatarAsync(currentUserId, ms);

            string imageBase64 = ImageUtils.ToBase64Png(ms.GetBuffer());
            return Ok(imageBase64);
        }
    }

    [HttpDelete("avatar")]
    public async Task<ActionResult> DeleteAvatar()
    {
        string currentUserId = User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;
        await _avatarService.DeleteAvatarAsync(currentUserId);
        return Ok();
    }
}