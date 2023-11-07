using BiddingService.Models;
using Contracts;
using MassTransit;
using MongoDB.Driver;
using MongoDB.Entities;

namespace BiddingService.Services;

public class CheckAuctionFinished : BackgroundService
{
    private readonly ILogger<CheckAuctionFinished> _logger;
    private readonly IServiceProvider _services;
    private readonly IConfiguration _config;

    public CheckAuctionFinished(ILogger<CheckAuctionFinished> logger, IServiceProvider services, IConfiguration config)
    {
        _logger = logger;
        _services = services;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Starting check for finished auctions");

        stoppingToken.Register(() => _logger.LogInformation("==> Auction check is stopping"));

        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckAuctions(stoppingToken);

            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task CheckAuctions(CancellationToken stoppingToken)
    {
        var db = await DB.AllDatabaseNamesAsync(MongoClientSettings.FromConnectionString(_config.GetConnectionString("BidDbConnection")));
        if (!db.Contains("BidDB")) return;
        var dbInit = await DB.Database("BidDB").IsAccessibleAsync();
        if (!dbInit) return;
        var dbExists = await DB.Database("BidDB").ExistsAsync();
        if(!dbExists) return;

        var finishedAuctions = await DB.Find<Auction>()
            .Match(x => x.AuctionEnd <= DateTime.UtcNow)
            .Match(x => !x.Finished)
            .ExecuteAsync(stoppingToken);

        if (finishedAuctions.Count == 0) return;

        _logger.LogInformation("==> Found {FinishedAuctionsCount} auctions that have completed",
            finishedAuctions.Count);

        using var scope = _services.CreateScope();
        var endpoint = scope.ServiceProvider.GetRequiredService<IPublishEndpoint>();

        foreach (var auction in finishedAuctions)
        {
            auction.Finished = true;
            await auction.SaveAsync(cancellation: stoppingToken);

            var winningBid = await DB.Find<Bid>()
                .Match(a => a.AuctionId == auction.ID)
                .Match(x => x.BidStatus == BidStatus.Accepted)
                .Sort(x => x.Descending(s => s.Amount))
                .ExecuteFirstAsync(stoppingToken);

            await endpoint.Publish(new AuctionFinished
            {
                AuctionId = auction.ID,
                ItemSold = winningBid != null,
                Winner = winningBid?.Bidder,
                Seller = auction.Seller,
                Amount = winningBid?.Amount
            }, stoppingToken);
        }
    }
}