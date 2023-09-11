using AuctionService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AuctionDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();
try
{
    app.InitDb();
}
catch (Exception e)
{
    Console.WriteLine(e);
    throw;
}


// Configure the HTTP request pipeline.
app.UseAuthorization();

app.MapControllers();

app.Run();