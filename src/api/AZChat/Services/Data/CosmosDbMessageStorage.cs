using System.Diagnostics;
using AZChat.Data.Models;
using Microsoft.Azure.Cosmos;

namespace AZChat.Services.Data;

public class CosmosDbMessageStorage : IMessageStorage
{
    private readonly ICosmosFactory _cosmosFactory;
    private readonly ILogger<CosmosDbMessageStorage> _logger;

    public CosmosDbMessageStorage(ICosmosFactory cosmosFactory, ILogger<CosmosDbMessageStorage> logger)
    {
        _cosmosFactory = cosmosFactory;
        _logger = logger;
    }

    public async Task AddAsync(Message message)
    {
        Stopwatch s = Stopwatch.StartNew();

        Container container = _cosmosFactory.GetContainer();
        ItemResponse<Message> itemResponse = await container.CreateItemAsync(message, new PartitionKey(message.FromUserId));

        s.Stop();
        _logger.LogInformation("Message stored in {time} ms", s.ElapsedMilliseconds);
    }

    public async Task<List<Message>> GetAsync(string userId, string otherUserId, int count)
    {
        Stopwatch s = Stopwatch.StartNew();

        Container container = _cosmosFactory.GetContainer();
        QueryDefinition query = new QueryDefinition(
            $"select * from c where ((c.FromUserId = '{userId}' and c.ToUserId = '{otherUserId}') or (c.FromUserId = '{otherUserId}' and c.ToUserId = '{userId}'))");
        FeedIterator<Message>? iterator = container.GetItemQueryIterator<Message>(query);

        List<Message> messages = new();

        while (iterator.HasMoreResults)
        {
            FeedResponse<Message> response = await iterator.ReadNextAsync();
            messages.AddRange(response.Resource);
        }

        s.Start();

        _logger.LogInformation("Retrieved {number} of messages in {time} ms", messages.Count, s.ElapsedMilliseconds);

        return messages;
    }
}