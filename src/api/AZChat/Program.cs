using System.Net.Mime;
using System.Text;
using System.Text.Json;
using AZChat.Configuration;
using AZChat.Data.Models;
using AZChat.Hubs;
using AZChat.Services.Authentication;
using AZChat.Services.Data.Blob;
using AZChat.Services.Data.CosmosDb;
using AZChat.Services.Data.Sql;
using AZChat.Services.HealthChecks;
using AZChat.Services.Hubs.Chat;
using AZChat.Services.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Internal;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Serilog;
using Serilog.Core;

namespace AZChat
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            Console.Title = "AZ Chat";
            Logger logger = null;

            try
            {
                WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
                logger = ConfigureLogging(builder.Configuration);
                ConfigureApplicationBuilder(builder, logger);
                WebApplication app = builder.Build();

                logger.Information("Web app created");

                await ConfigureApp(app);
                logger.Information("Web app configured");

                using (var scope = app.Services.CreateScope())
                {
                    logger.Information("Applying SQL schema migrations");
                    AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    await dbContext.Database.MigrateAsync();

                    logger.Information("Configuring CosmosDb database and container");
                    ICosmosDbService cosmosDbService = scope.ServiceProvider.GetRequiredService<ICosmosDbService>();
                    await cosmosDbService.EnsureCreatedAsync();

                    logger.Information("Configuring blob storage");
                    IBlobStorageService blobStorageService = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();
                    await blobStorageService.EnsureCreatedAsync();

                    logger.Information("Creating admin role and account if not exists");
                    IOptions<AdminAccountConfiguration> adminAccountConfig = scope.ServiceProvider.GetRequiredService<IOptions<AdminAccountConfiguration>>();
                    IIdentityService identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
                    await identityService.CreateAdminAccountIfNotExistsAsync(adminAccountConfig.Value.UserName, adminAccountConfig.Value.Password);

                    // TODO cleanup RefreshTokens
                }

                logger.Information("App configured, starting");

                await app.RunAsync();
            }
            catch (Exception ex)
            {
                logger?.Fatal(ex, "Failed to start app");
                throw;
            }
        }

        private static void ConfigureApplicationBuilder(WebApplicationBuilder builder, Logger logger)
        {
            IConfiguration authConfig = builder.Configuration.GetSection(JwtConfiguration.SectionName);
            builder.Services.Configure<JwtConfiguration>(authConfig);

            IConfiguration databaseConfig = builder.Configuration.GetSection(ConnectionStrings.SectionName);
            builder.Services.Configure<ConnectionStrings>(databaseConfig);

            IConfiguration adminAccountConfig = builder.Configuration.GetSection(AdminAccountConfiguration.SectionName);
            builder.Services.Configure<AdminAccountConfiguration>(adminAccountConfig);

            builder.Services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddSerilog(logger);
            });

            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddTransient<IDateTime, SystemDateTime>();
            builder.Services.AddTransient<ISystemClock, SystemClock>();
            builder.Services.AddTransient<IAuthTokenService, JwtAuthTokenService>();
            builder.Services.AddTransient<IIdentityService, IdentityService>();
            builder.Services.AddTransient<IChatHubService, ChatHubService>();
            builder.Services.AddTransient<IMessageStorage, CosmosDbMessageStorage>();
            builder.Services.AddTransient<IBlobStorageService, BlobStorageService>();
            builder.Services.AddTransient<IAvatarService, AvatarService>();
            builder.Services.AddSingleton<ICosmosDbService, CosmosDbService>();

            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddCors();
            }
            else
            {
            }

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                string? connectionString = databaseConfig[nameof(ConnectionStrings.Sql)];
                options.UseSqlServer(connectionString);
            });
            
            builder.Services
                .AddIdentity<User, IdentityRole>(options =>
                {
                    options.Password.RequireDigit = false;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;
                    options.Password.RequiredLength = 3;
                })
                .AddEntityFrameworkStores<AppDbContext>()
                .AddTokenProvider<DataProtectorTokenProvider<User>>(TokenOptions.DefaultProvider);
            
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
                            if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/api/hub")))
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
            builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
            {
                options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
            builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

            builder.Services.AddSpaStaticFiles(options => options.RootPath = "public");
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
            app.MapHub<AdminHub>("/api/hub/admin");
        }

        private static Logger ConfigureLogging(IConfiguration configuration)
        {
            return new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }
    }
}
