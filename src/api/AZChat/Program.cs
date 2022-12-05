using System.Net.Mime;
using System.Text;
using System.Text.Json;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Services.Authentication;
using AZChat.Services.Data;
using AZChat.Services.HealthChecks;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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

            WebApplicationBuilder builder = GetWebApplicationBuilder(args);
            WebApplication app = builder.Build();

            app.Logger.LogInformation("Web app created");

            await ConfigureApp(app);

            app.Logger.LogInformation("Web app configured, starting up");

            await app.RunAsync();
        }

        private static WebApplicationBuilder GetWebApplicationBuilder(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            IConfiguration authConfig = builder.Configuration.GetSection(AuthenticationConfiguration.SectionName);
            builder.Services.Configure<AuthenticationConfiguration>(authConfig);

            builder.Services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddSerilog();
            });

            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddScoped<IDateTime, SystemDateTime>();
            builder.Services.AddScoped<IAuthTokenService, JwtAuthTokenService>();

            if (builder.Environment.IsDevelopment())
            {
                string dbFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "db.sqlite");
                builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={dbFilePath}"));
                builder.Services.AddCors();
            }
            else
            {
            }

            builder.Services
                .AddIdentity<User, IdentityRole>(identityOptions => { })
                .AddEntityFrameworkStores<AppDbContext>();

            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.SaveToken = true;
                    options.TokenValidationParameters = new()
                    {
                        ValidateLifetime = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = authConfig[nameof(AuthenticationConfiguration.Issuer)],
                        ValidAudience = authConfig[nameof(AuthenticationConfiguration.Audience)],
                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.ASCII.GetBytes(authConfig[nameof(AuthenticationConfiguration.Secret)]))
                    };
                });

            builder.Services.AddAuthorization();

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
                .AddTransientHttpErrorPolicy(policyBuilder =>
                    policyBuilder.WaitAndRetryAsync(Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(2), 3)));

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(x =>
            {
                x.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Description = "JWT Auth",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });

                x.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme()
                        {
                            Reference = new OpenApiReference()
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new List<string>()
                    }
                });
            });

            builder.Services.AddSpaStaticFiles(options => options.RootPath = "public");
            return builder;
        }

        private static async Task ConfigureApp(WebApplication app)
        {
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

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseSpa(spa => { });

            app.MapHealthChecks(ApiHealthCheck.Name);
            app.MapControllers();

            app.Logger.LogInformation("Migrating database schema");
            using (var scope = app.Services.CreateScope())
            {
                AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await dbContext.Database.MigrateAsync();
            }
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
