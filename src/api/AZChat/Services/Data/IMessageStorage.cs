using AZChat.Data.Models;

namespace AZChat.Services.Data;

public interface IMessageStorage
{
    Task AddAsync(string senderUserId, string recipientUserId, string messageBody);
    Task<List<Message>> GetAsync(string userId, string otherUserId, int count);
}