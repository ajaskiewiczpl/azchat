using System.Net.Mime;
using System.Text.Json;
using AZChat.Models;
using AZChat.Services.Data;
using AZChat.Services.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Serilog;

namespace AZChat
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            ConfigureLogging();

            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            builder.Services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddSerilog();
            });
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite("Data Source=db.sqlite"));
                builder.Services.AddCors();
            }
            else
            {

            }

            builder.Services
                .AddIdentity<User, IdentityRole>(identityOptions =>
                {
                })
                .AddEntityFrameworkStores<AppDbContext>();

            builder.Services
                .AddHealthChecks()
                .AddCheck<ApiHealthCheck>(ApiHealthCheck.Name);

            builder.Services
                .AddHttpClient<ApiHealthCheck>((services, client) =>
                {
                    IServer? server = services.GetService<IServer>();
                    IServerAddressesFeature? addresses = server?.Features.Get<IServerAddressesFeature>();
                    client.BaseAddress = new Uri(addresses?.Addresses.FirstOrDefault() ?? string.Empty);
                })
                .AddTransientHttpErrorPolicy(policyBuilder => policyBuilder.WaitAndRetryAsync(Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(2), 3)));

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddSpaStaticFiles(options => options.RootPath = "public");

            WebApplication app = builder.Build();

            app.Logger.LogInformation("Web app created");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseCors(cors => cors.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
            }
            else
            {
                app.UseHsts();
            }

            app.UseHealthChecks("/api/health",
                new HealthCheckOptions
                {
                    ResponseWriter = async (context, report) =>
                    {
                        var result = new
                        {
                            status = report.Status.ToString(),
                            errors = report.Entries.Select(e => new
                            {
                                key = e.Key,
                                value = Enum.GetName(typeof(HealthStatus), e.Value.Status)
                            })
                        };
                        context.Response.ContentType = MediaTypeNames.Application.Json;
                        await context.Response.WriteAsync(JsonSerializer.Serialize(result));
                    }
                });

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapHealthChecks(ApiHealthCheck.Name);
            app.MapControllers();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseSpa(spa => { });
            
            using (var scope = app.Services.CreateScope())
            {
                AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await dbContext.Database.MigrateAsync();
            }

            app.Logger.LogInformation("Web app configured, starting up");

            await app.RunAsync();
        }

        private static void ConfigureLogging()
        {
            Log.Logger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss.fff} {Level}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();
        }
    }
}
