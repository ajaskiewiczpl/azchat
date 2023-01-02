namespace AZChat.Configuration;

public class AdminAccountConfiguration
{
    public const string SectionName = "AdminAccount";

    public string UserName { get; set; } = null!;

    public string Password { get; set; } = null!;
}