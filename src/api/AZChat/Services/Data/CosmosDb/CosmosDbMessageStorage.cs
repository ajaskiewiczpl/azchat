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
        _logger.LogInformation("Message stored in {time} ms", s.ElapsedMilliseconds);
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

        s.Start();

        _logger.LogInformation("Retrieved {number} messages in {time} ms", messages.Count, s.ElapsedMilliseconds);

        GetMessagesResult result = new GetMessagesResult()
        {
            Messages = messages.OrderBy(x => x.Timestamp).ToList(),
            ContinuationToken = response.ContinuationToken,
            HasMoreMessages = iterator.HasMoreResults
        };

        return result;
    }
}

public class GetMessagesResult
{
    public List<Message> Messages { get; set; } = new();

    [Required]
    public string ContinuationToken { get; set; } = null!;

    public bool HasMoreMessages { get; set; }
}