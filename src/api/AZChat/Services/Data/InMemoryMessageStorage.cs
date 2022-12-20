using AZChat.Data.Models;
using Microsoft.Extensions.Internal;

namespace AZChat.Services.Data;

public class InMemoryMessageStorage : IMessageStorage
{
    private readonly ISystemClock _clock;

    private readonly List<Message> _messages = new();

    public InMemoryMessageStorage(ISystemClock clock)
    {
        _clock = clock;
    }

    public Task AddAsync(string senderUserId, string recipientUserId, string messageBody)
    {
        _messages.Add(new Message()
        {
            Timestamp = _clock.UtcNow,
            FromUserId = senderUserId,
            ToUserId = recipientUserId,
            Body = messageBody
        });

        return Task.CompletedTask;
    }

    public Task<List<Message>> GetAsync(string userId, string otherUserId, int count)
    {
        List<Message> messages = _messages
            .Where(x =>
                x.FromUserId == userId && x.ToUserId == otherUserId ||
                x.FromUserId == otherUserId && x.ToUserId == userId)
            .OrderBy(x => x.Timestamp)
            .ToList();
        return Task.FromResult(messages);
    }
}