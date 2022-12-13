namespace AZChat.Configuration;

public class DatabaseConfiguration
{
    public const string SectionName = "Database";

    public string ConnectionString { get; set; } = null!;
}