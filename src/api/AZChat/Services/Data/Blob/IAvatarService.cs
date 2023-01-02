using SixLabors.ImageSharp;

namespace AZChat.Services.Data.Blob;

public interface IAvatarService
{
    Task<Image> CreateAvatarAsync(Stream stream, CancellationToken token);
    Task<byte[]> GetAvatarAsync(string userId);
    Task UploadAvatarAsync(string userId, Stream stream, CancellationToken token);
    Task DeleteAvatarAsync(string userId);
}