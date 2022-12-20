using AZChat.Data.Models;

namespace AZChat.Services.Data;

public interface IMessageStorage
{
    Task AddAsync(Message message);
    Task<List<Message>> GetAsync(string userId, string otherUserId, int count);
}