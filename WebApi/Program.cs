using WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add CORS service
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

// Add SignalR service
builder.Services.AddSignalR();

var app = builder.Build();

// Set up CORS
app.UseCors();

// Map the SignalR hub
app.MapHub<CollaborationHub>("/collabHub");

// Set up a default route just to test
app.MapGet("/", () => "SignalR is running!");

app.Run();
