namespace AZChat.Services.Data.Blob;

public interface IAvatarService
{
    Task<MemoryStream> CreateAvatarAsync(Stream stream);
    Task<byte[]> GetAvatarAsync(string userId);
    Task UploadAvatarAsync(string userId, Stream stream);
    Task DeleteAvatarAsync(string userId);
}