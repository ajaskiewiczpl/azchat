using Serilog;

namespace AZChat
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss.fff} {Level}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddSerilog();
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddCors();
            builder.Services.AddSpaStaticFiles(options => options.RootPath = "public");

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseCors(cors => cors.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
            }

            app.UseAuthorization();


            app.MapControllers();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseSpa(spa => { });

            app.Run();
        }
    }
}
