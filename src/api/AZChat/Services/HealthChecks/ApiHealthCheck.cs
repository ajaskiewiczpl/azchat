using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AZChat.Services.HealthChecks;

public class ApiHealthCheck : IHealthCheck
{
    public const string Name = "api-health-check";

    private readonly HttpClient _httpClient;

    public ApiHealthCheck(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
    {
        HttpResponseMessage response = await _httpClient.GetAsync("api/Health/check", cancellationToken);
        if (response.IsSuccessStatusCode)
        {
            return HealthCheckResult.Healthy();
        }
        else
        {
            return HealthCheckResult.Unhealthy();
        }
    }
}