namespace AZChat.Configuration;

public class DatabaseConfiguration
{
    public const string SectionName = "Database";

    public string SqlConnectionString { get; set; } = null!;

    public string CosmosDbConnectionString { get; set; } = null!;
}