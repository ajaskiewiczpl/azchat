using Azure.Storage.Blobs;

namespace AZChat.Services.Data.Blob;

public interface IBlobStorageService
{
    Task EnsureCreatedAsync();
    BlobContainerClient GetUserDataContainerClient();
    Task DeleteUserDataAsync(string userID);
}