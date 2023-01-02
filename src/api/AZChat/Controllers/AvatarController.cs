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
public class AvatarController : BaseController
{
    private readonly IAvatarService _avatarService;

    public AvatarController(IAvatarService avatarService)
    {
        _avatarService = avatarService;
    }

    [HttpGet("{userId}")]
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
            return string.Empty;
        }
    }

    [HttpPost()]
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

        avatarStream.Seek(0, SeekOrigin.Begin);
        await _avatarService.UploadAvatarAsync(UserId, avatarStream);

        string avatarBase64 = avatar.ToBase64String(PngFormat.Instance);
        return Ok(avatarBase64);
    }

    [HttpDelete()]
    public async Task<ActionResult> DeleteAvatar()
    {
        string currentUserId = User.Claims.Single(x => x.Type == CustomClaims.UserId).Value;
        await _avatarService.DeleteAvatarAsync(currentUserId);
        return Ok();
    }
}