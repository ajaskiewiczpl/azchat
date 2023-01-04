using AZChat.Services.Utils;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using SixLabors.ImageSharp;

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

    public async Task<Image> CreateAvatarAsync(Stream stream, CancellationToken token)
    {
        try
        {
            Image memoryStream = await ImageUtils.ResizeAsync(stream, 64, 64, token);
            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create avatar");
            throw;
        }
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
            _logger.LogError(ex, "Failed to download avatar from storage");
            throw;
        }
    }

    public async Task UploadAvatarAsync(string userId, Stream stream, CancellationToken token)
    {
        try
        {
            BlobClient blobClient = GetAvatarBlobClient(userId);
            Response<BlobContentInfo> response = await blobClient.UploadAsync(stream, overwrite: true, token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload avatar to storage");
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
            _logger.LogError(ex, "Failed to delete avatar from storage");
            throw;
        }
    }

    private BlobClient GetAvatarBlobClient(string userId)
    {
        BlobContainerClient containerClient = _blobStorageService.GetUserDataContainerClient();
        BlobClient blobClient = containerClient.GetBlobClient($"{userId}/avatar.png");
        return blobClient;
    }
}