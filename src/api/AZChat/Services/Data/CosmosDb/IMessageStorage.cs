using AZChat.Data.Models;

namespace AZChat.Services.Data.CosmosDb;

public interface IMessageStorage
{
    Task AddAsync(Message message);
    Task<GetMessagesResult> GetAsync(string userId, string otherUserId, string? continuationToken);
}