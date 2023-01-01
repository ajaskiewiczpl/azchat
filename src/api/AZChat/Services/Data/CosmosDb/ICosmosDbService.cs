using Microsoft.Azure.Cosmos;

namespace AZChat.Services.Data.CosmosDb;

public interface ICosmosDbService
{
    Task EnsureCreatedAsync();
    Container GetMessagesContainer();
}