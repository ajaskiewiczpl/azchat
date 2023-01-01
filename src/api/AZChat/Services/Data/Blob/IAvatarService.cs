using System.Drawing;

namespace AZChat.Services.Data.Blob;

public interface IAvatarService
{
    Image CreateAvatar(Stream stream);
    Task<byte[]> GetAvatarAsync(string userId);
    Task UploadAvatarAsync(string userId, Stream stream);
    Task DeleteAvatarAsync(string userId);
}