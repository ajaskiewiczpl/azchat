using Microsoft.Azure.Cosmos;

namespace AZChat.Services.Data.CosmosDb;

public interface ICosmosFactory
{
    Task EnsureCreatedAsync();
    Container GetMessagesContainer();
}