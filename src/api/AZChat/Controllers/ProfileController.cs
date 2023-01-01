using AZChat.Services.Data.Blob;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;

namespace AZChat.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController : BaseController
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

        await using Stream inputFileStream = file.OpenReadStream();
        Image avatar = await _avatarService.CreateAvatarAsync(inputFileStream);

        await using MemoryStream avatarStream = new MemoryStream();
        await avatar.SaveAsPngAsync(avatarStream);

        await _avatarService.UploadAvatarAsync(UserId, avatarStream);

        string avatarBase64 = avatar.ToBase64String(PngFormat.Instance);
        return Ok(avatarBase64);
    }

    [HttpDelete("avatar")]
    public async Task<ActionResult> DeleteAvatar()
    {
        string currentUserId = User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;
        await _avatarService.DeleteAvatarAsync(currentUserId);
        return Ok();
    }
}