using Microsoft.AspNetCore.SignalR;

namespace AZChat.Hubs;

public class ChatHub : Hub
{
    public async Task Connect(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, userId);
    }
}