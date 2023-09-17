using Contracts;
using MassTransit;

namespace AuctionService.Consumers;

public class AuctionUpdatedFaultConsumer : IConsumer<Fault<AuctionUpdated>>
{
    public Task Consume(ConsumeContext<Fault<AuctionUpdated>> context)
    {
        Console.WriteLine("->> Consuming faulty creation");

        var exception = context.Message.Exceptions.First();

        Console.WriteLine($"Exception type: {exception.ExceptionType}, {exception.Message}");

        return Task.CompletedTask;
    }
}