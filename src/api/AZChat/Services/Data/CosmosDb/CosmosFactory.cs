using AZChat.Configuration;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace AZChat.Services.Data.CosmosDb;

public class CosmosFactory : ICosmosFactory
{
    private const string DbName = "AzChat";
    private const string MessagesContainerName = "Messages";

    private readonly CosmosClient _client;

    public CosmosFactory(IOptions<DatabaseConfiguration> dbConfig)
    {
        _client = new CosmosClient(dbConfig.Value.CosmosDbConnectionString);
    }

    public async Task EnsureCreatedAsync()
    {
        DatabaseResponse databaseResponse = await _client.CreateDatabaseIfNotExistsAsync(DbName);
        ContainerResponse containerResponse =
            await databaseResponse.Database.CreateContainerIfNotExistsAsync(MessagesContainerName, "/FromUserId");
    }

    public Container GetMessagesContainer()
    {
        return _client.GetDatabase(DbName).GetContainer(MessagesContainerName);
    }
}