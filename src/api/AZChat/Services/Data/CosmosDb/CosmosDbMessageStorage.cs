using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using AZChat.Data.Models;
using Microsoft.Azure.Cosmos;

namespace AZChat.Services.Data.CosmosDb;

public class CosmosDbMessageStorage : IMessageStorage
{
    private readonly ICosmosDbService _cosmosDbService;
    private readonly ILogger<CosmosDbMessageStorage> _logger;

    private const int PageSize = 5;

    public CosmosDbMessageStorage(ICosmosDbService cosmosDbService, ILogger<CosmosDbMessageStorage> logger)
    {
        _cosmosDbService = cosmosDbService;
        _logger = logger;
    }

    public async Task AddAsync(Message message)
    {
        Stopwatch s = Stopwatch.StartNew();

        Container container = _cosmosDbService.GetMessagesContainer();
        ItemResponse<Message> itemResponse = await container.CreateItemAsync(message, new PartitionKey(message.FromUserId));

        s.Stop();
        _logger.LogDebug("Message stored in {time} ms, cost: {cost}", s.ElapsedMilliseconds, itemResponse.RequestCharge);
    }

    public async Task<GetMessagesResult> GetAsync(string userId, string otherUserId, string? continuationToken)
    {
        Stopwatch s = Stopwatch.StartNew();

        Container container = _cosmosDbService.GetMessagesContainer();
        QueryDefinition query = new QueryDefinition(
            $"select * from c where ((c.FromUserId = '{userId}' and c.ToUserId = '{otherUserId}') or (c.FromUserId = '{otherUserId}' and c.ToUserId = '{userId}')) order by c.Timestamp desc");
        FeedIterator<Message>? iterator = container.GetItemQueryIterator<Message>(query, continuationToken: string.IsNullOrWhiteSpace(continuationToken) ? null : continuationToken, requestOptions: new QueryRequestOptions()
        {
            MaxItemCount = PageSize
        });

        List<Message> messages = new();

        FeedResponse<Message> response = await iterator.ReadNextAsync();
        messages.AddRange(response.Resource);

        s.Stop();
        _logger.LogDebug("Retrieved {number} messages in {time} ms, cost: {cost}", messages.Count, s.ElapsedMilliseconds, response.RequestCharge);

        GetMessagesResult result = new GetMessagesResult()
        {
            Messages = messages.OrderBy(x => x.Timestamp).ToList(),
            ContinuationToken = response.ContinuationToken,
            HasMoreMessages = iterator.HasMoreResults
        };

        return result;
    }

    public async Task DeleteAsync(string userId)
    {
        Stopwatch s = Stopwatch.StartNew();

        double queryCost = 0.0;
        double deletionCost = 0.0;
        int itemsCount = 0;

        Container container = _cosmosDbService.GetMessagesContainer();
        QueryDefinition query = new QueryDefinition($"select * from c where c.FromUserId = '{userId}' or c.ToUserId = '{userId}'");
        FeedIterator<Message>? iterator = container.GetItemQueryIterator<Message>(query);

        while (iterator.HasMoreResults)
        {
            FeedResponse<Message> feedResponse = await iterator.ReadNextAsync();
            queryCost += feedResponse.RequestCharge;

            foreach (Message message in feedResponse.Resource)
            {
                ItemResponse<Message> itemResponse = await container.DeleteItemAsync<Message>(message.Id.ToString(), new PartitionKey(message.FromUserId));
                deletionCost += itemResponse.RequestCharge;
                itemsCount++;
            }
        }

        s.Stop();
        _logger.LogDebug("Deleted {number} messages in {time} ms, deletion cost: {deletionCost}, query cost: {queryCost}", itemsCount, s.ElapsedMilliseconds, deletionCost, queryCost);
    }
}

public class GetMessagesResult
{
    public List<Message> Messages { get; set; } = new();

    [Required]
    public string ContinuationToken { get; set; } = null!;

    public bool HasMoreMessages { get; set; }
}