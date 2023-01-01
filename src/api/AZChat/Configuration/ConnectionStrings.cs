namespace AZChat.Configuration;

public class ConnectionStrings
{
    public const string SectionName = "ConnectionStrings";

    public string Sql { get; set; } = null!;

    public string CosmosDb { get; set; } = null!;

    public string BlobStorage { get; set; } = null!;
}