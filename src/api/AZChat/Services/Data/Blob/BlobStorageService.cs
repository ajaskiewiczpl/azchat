using AZChat.Configuration;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;

namespace AZChat.Services.Data.Blob;

public class BlobStorageService : IBlobStorageService
{
    private const string AvatarsContainerName = "avatars";
    private readonly IOptions<ConnectionStrings> _connectionStrings;

    public BlobStorageService(IOptions<ConnectionStrings> connectionStrings)
    {
        _connectionStrings = connectionStrings;
    }

    public async Task EnsureCreatedAsync()
    {
        await GetAvatarsContainerClient().CreateIfNotExistsAsync();
    }

    public BlobContainerClient GetAvatarsContainerClient()
    {
        var serviceClient = GetBlobServiceClient();
        BlobContainerClient containerClient = serviceClient.GetBlobContainerClient(AvatarsContainerName);
        return containerClient;
    }

    private BlobServiceClient GetBlobServiceClient()
    {
        BlobServiceClient serviceClient = new BlobServiceClient(_connectionStrings.Value.BlobStorage);
        return serviceClient;
    }
}