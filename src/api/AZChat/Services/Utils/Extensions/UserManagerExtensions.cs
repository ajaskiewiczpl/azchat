using AZChat.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace AZChat.Services.Utils.Extensions;

public static class UserManagerExtensions
{
    public static async Task DeleteByIdAsync(this UserManager<User> userManager, string userID)
    {
        User? user = await userManager.FindByIdAsync(userID);
        if (user != null)
        {
            await userManager.DeleteAsync(user);
        }
    }
}