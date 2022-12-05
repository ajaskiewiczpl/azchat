namespace AZChat.Configuration;

public class AuthenticationConfiguration
{
    public const string SectionName = "Authentication";

    public string Secret { get; set; } = null!;

    public string Issuer { get; set; } = null!;

    public string Audience { get; set; } = null!;

    public TimeSpan TokenLifetime { get; set; }
}