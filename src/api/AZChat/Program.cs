using System.IdentityModel.Tokens.Jwt;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Hubs;
using AZChat.Services.Authentication;
using AZChat.Services.Data;
using AZChat.Services.HealthChecks;
using AZChat.Services.Hubs.Chat;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Internal;
using Microsoft.Extensions.Primitives;
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
            Console.Title = "AZ Chat";

            WebApplicationBuilder builder = GetWebApplicationBuilder(args);
            WebApplication app = builder.Build();
            
            ConfigureLogging(app.Configuration);
            
            Log.Information("Web app created");

            await ConfigureApp(app);
            Log.Information("Web app configured");

            Log.Information("Migrating database schema");
            using (var scope = app.Services.CreateScope())
            {
                AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.SetCommandTimeout(TimeSpan.FromMinutes(5));
                await dbContext.Database.MigrateAsync();
            }

            // TODO cleanup RefreshTokens

            Log.Information("App configured, starting");

            await app.RunAsync();
        }

        private static WebApplicationBuilder GetWebApplicationBuilder(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            IConfiguration authConfig = builder.Configuration.GetSection(JwtConfiguration.SectionName);
            builder.Services.Configure<JwtConfiguration>(authConfig);
            IConfiguration databaseConfig = builder.Configuration.GetSection(DatabaseConfiguration.SectionName);
            builder.Services.Configure<DatabaseConfiguration>(databaseConfig);

            builder.Services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddSerilog();
            });

            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddTransient<IDateTime, SystemDateTime>();
            builder.Services.AddTransient<ISystemClock, SystemClock>();
            builder.Services.AddTransient<IAuthTokenService, JwtAuthTokenService>();
            builder.Services.AddTransient<IIdentityService, IdentityService>();
            builder.Services.AddTransient<IChatHubService, ChatHubService>();
            builder.Services.AddSingleton<IMessageStorage, InMemoryMessageStorage>();

            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddCors();
            }
            else
            {
            }

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                string? connectionString = databaseConfig[nameof(DatabaseConfiguration.ConnectionString)];
                options.UseSqlServer(connectionString);
            });

            builder.Services
                .AddIdentity<User, IdentityRole>(identityOptions =>
                {
                    identityOptions.Password.RequireDigit = false;
                    identityOptions.Password.RequireLowercase = false;
                    identityOptions.Password.RequireNonAlphanumeric = false;
                    identityOptions.Password.RequireUppercase = false;
                    identityOptions.Password.RequiredLength = 3;
                })
                .AddEntityFrameworkStores<AppDbContext>();
            
            //JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/issues/415

            TokenValidationParameters tokenValidationParameters = new TokenValidationParameters()
            {
                ValidateLifetime = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = authConfig[nameof(JwtConfiguration.Issuer)],
                ValidAudience = authConfig[nameof(JwtConfiguration.Audience)],
                ClockSkew = TimeSpan.Zero,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.ASCII.GetBytes(authConfig[nameof(JwtConfiguration.Secret)]))
            };

            builder.Services.AddSingleton(tokenValidationParameters);

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
                    options.TokenValidationParameters = tokenValidationParameters;
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            StringValues accessToken = context.Request.Query["access_token"];
                            PathString path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/api/hub/chat")))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
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

            builder.Services.AddSignalR();
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
                app.UseCors(cors => cors.AllowAnyMethod().AllowCredentials().AllowAnyHeader().WithOrigins("http://localhost:3000"));
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
            app.MapHub<ChatHub>("/api/hub/chat");
        }

        private static void ConfigureLogging(IConfiguration configuration)
        {
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }
    }
}
