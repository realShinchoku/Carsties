using AuctionService.Consumers;
using AuctionService.Data;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AuctionDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddMassTransit(opts =>
{
    opts.AddEntityFrameworkOutbox<AuctionDbContext>(opt =>
    {
        opt.QueryDelay = TimeSpan.FromSeconds(10);
        opt.UsePostgres();
        opt.UseBusOutbox();
    });
    
    opts.AddConsumersFromNamespaceContaining<AuctionCreatedFaultConsumer>();
    
    opts.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("auction", false));

    opts.UsingRabbitMq((context, cfg) => { cfg.ConfigureEndpoints(context); });
});

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