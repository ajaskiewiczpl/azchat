using System.Drawing;
using AZChat.Services.Utils;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace AZChat.Services.Data.Blob;

public class AvatarService : IAvatarService
{
    private readonly IBlobStorageService _blobStorageService;
    private readonly ILogger<AvatarService> _logger;

    public AvatarService(IBlobStorageService blobStorageService, ILogger<AvatarService> logger)
    {
        _blobStorageService = blobStorageService;
        _logger = logger;
    }

    public Image CreateAvatar(Stream stream)
    {
        Image img = Image.FromStream(stream);
        img = ImageUtils.Resize(img, 64);
        return img;
    }

    public async Task<byte[]> GetAvatarAsync(string userId)
    {
        try
        {
            BlobClient blobClient = GetAvatarBlobClient(userId);
            Response<bool> exists = await blobClient.ExistsAsync();
            if (exists.Value)
            {
                Response<BlobDownloadResult> response = await blobClient.DownloadContentAsync();
                return response.Value.Content.ToArray();
            }
            else
            {
                return Array.Empty<byte>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download avatar from blob storage");
            throw;
        }
    }

    public async Task UploadAvatarAsync(string userId, Stream stream)
    {
        try
        {
            BlobClient blobClient = GetAvatarBlobClient(userId);
            Response<BlobContentInfo> response = await blobClient.UploadAsync(stream, overwrite: true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload avatar to blob storage");
            throw;
        }
    }

    public async Task DeleteAvatarAsync(string userId)
    {
        try
        {
            BlobClient blobClient = GetAvatarBlobClient(userId);
            Response<bool> response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete avatar from blob storage");
            throw;
        }
    }

    private BlobClient GetAvatarBlobClient(string userId)
    {
        BlobContainerClient containerClient = _blobStorageService.GetAvatarsContainerClient();
        BlobClient blobClient = containerClient.GetBlobClient($"{userId}.png");
        return blobClient;
    }
}