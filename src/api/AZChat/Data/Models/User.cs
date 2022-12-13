using Microsoft.AspNetCore.Identity;

namespace AZChat.Data.Models;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}