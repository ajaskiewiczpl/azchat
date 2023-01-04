using AZChat.Configuration;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Options;

namespace AZChat.Services.Data.Blob;

public class BlobStorageService : IBlobStorageService
{
    private const string UserDataContainerName = "user-data";

    private readonly IOptions<ConnectionStrings> _connectionStrings;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(IOptions<ConnectionStrings> connectionStrings, ILogger<BlobStorageService> logger)
    {
        _connectionStrings = connectionStrings;
        _logger = logger;
    }

    public async Task EnsureCreatedAsync()
    {
        await GetUserDataContainerClient().CreateIfNotExistsAsync();
    }

    public BlobContainerClient GetUserDataContainerClient()
    {
        BlobServiceClient serviceClient = GetBlobServiceClient();
        BlobContainerClient containerClient = serviceClient.GetBlobContainerClient(UserDataContainerName);
        return containerClient;
    }

    public async Task DeleteUserDataAsync(string userID)
    {
        BlobContainerClient containerClient = GetUserDataContainerClient();
        AsyncPageable<BlobItem> blobs = containerClient.GetBlobsAsync(prefix: userID);
        await foreach (Page<BlobItem> page in blobs.AsPages())
        {
            foreach (BlobItem blobItem in page.Values)
            {
                if (blobItem.Deleted)
                {
                    continue;
                }

                Response deleteResponse = await containerClient.DeleteBlobAsync(blobItem.Name);

                if (deleteResponse.IsError)
                {
                    _logger.LogError("Failed to delete blob '{blobName}': {status}", blobItem.Name, deleteResponse.Status);
                    throw new Exception($"Failed to delete blob '{blobItem.Name}': {deleteResponse.Status}");
                }

                _logger.LogDebug("Successfully deleted blob: {blobName}", blobItem.Name);
            }
        }
    }

    private BlobServiceClient GetBlobServiceClient()
    {
        BlobServiceClient serviceClient = new BlobServiceClient(_connectionStrings.Value.BlobStorage);
        return serviceClient;
    }
}