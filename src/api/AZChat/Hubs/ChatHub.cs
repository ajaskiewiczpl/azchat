using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AZChat.Hubs;

[Authorize]
public class ChatHub : Hub
{
}