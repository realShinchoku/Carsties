using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers;

public class BidPlacedConsumer : IConsumer<BidPlaced>
{
    public async Task Consume(ConsumeContext<BidPlaced> context)
    {
        Console.WriteLine("--> Consuming BidPlaced");

        var auction = await DB.Find<Item>().OneAsync(context.Message.AuctionId);


        if (context.Message.BidStatus.Contains("Accepted") && context.Message.Amount > auction.CurrentHighBind)
        {
            auction.CurrentHighBind = context.Message.Amount;
            await auction.SaveAsync();
        }
    }
}