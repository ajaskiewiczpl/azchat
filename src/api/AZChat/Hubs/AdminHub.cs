using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AZChat.Hubs;

[Authorize(Roles = Roles.Admin)]
public class AdminHub : Hub
{
}