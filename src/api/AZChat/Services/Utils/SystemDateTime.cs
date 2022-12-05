namespace AZChat.Services.Utils;

public class SystemDateTime : IDateTime
{
    public DateTime UtcNow => DateTime.UtcNow;
}