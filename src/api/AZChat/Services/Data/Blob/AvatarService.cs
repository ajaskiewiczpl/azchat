﻿using AZChat.Services.Utils;
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

    public async Task<Image> CreateAvatarAsync(Stream stream)
    {
        try
        {
            Image memoryStream = await ImageUtils.ResizeAsync(stream, 64, 64);
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