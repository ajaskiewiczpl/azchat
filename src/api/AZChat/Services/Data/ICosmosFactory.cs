using Microsoft.Azure.Cosmos;

namespace AZChat.Services.Data;

public interface ICosmosFactory
{
    Task EnsureCreatedAsync();
    Container GetContainer();
}