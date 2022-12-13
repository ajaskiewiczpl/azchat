namespace AZChat.Configuration;

public class JwtConfiguration
{
    public const string SectionName = "JWT";

    public string Secret { get; set; } = null!;

    public string Issuer { get; set; } = null!;

    public string Audience { get; set; } = null!;

    public TimeSpan JwtLifetime { get; set; }

    public TimeSpan RefreshTokenLifetime { get; set; }
}