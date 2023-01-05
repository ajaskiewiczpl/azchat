using System.ComponentModel.DataAnnotations;
using AZChat.Services.Data.Blob;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;

namespace AZChat.Controllers;

public class AvatarResponse
{
    [Required]
    public string AvatarData { get; set; }
}

[ApiController]
//[Authorize]
[Route("api/[controller]")]
public class AvatarController : BaseController
{
    private readonly IAvatarService _avatarService;
    private readonly ILogger<AvatarController> _logger;

    public AvatarController(IAvatarService avatarService, ILogger<AvatarController> logger)
    {
        _avatarService = avatarService;
        _logger = logger;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<AvatarResponse>> GetAvatar(string userId)
    {
        byte[] avatarBinary = await _avatarService.GetAvatarAsync(userId);

        if (avatarBinary.Any())
        {
            string avatarBase64 = ImageUtils.ToBase64Png(avatarBinary);
            return Ok(new AvatarResponse()
            {
                AvatarData = avatarBase64
            });
        }
        else
        {
            return NoContent();
        }
    }

    [HttpPost()]
    [Authorize]
    public async Task<ActionResult<string>> SetAvatar(IFormFile? file, CancellationToken token)
    {
        if (file == null)
        {
            return BadRequest();
        }

        await using Stream inputFileStream = file.OpenReadStream();
        Image avatar = await _avatarService.CreateAvatarAsync(inputFileStream, token);

        if (token.IsCancellationRequested)
        {
            return NoContent();
        }

        await using MemoryStream avatarStream = new MemoryStream();
        await avatar.SaveAsPngAsync(avatarStream, token);

        if (token.IsCancellationRequested)
        {
            return NoContent();
        }

        avatarStream.Seek(0, SeekOrigin.Begin);
        await _avatarService.UploadAvatarAsync(UserId, avatarStream, token);

        if (token.IsCancellationRequested)
        {
            return NoContent();
        }
        
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