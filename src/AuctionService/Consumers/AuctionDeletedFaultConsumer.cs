using Contracts;
using MassTransit;

namespace AuctionService.Consumers;

public class AuctionDeletedFaultConsumer: IConsumer<Fault<AuctionDeleted>>
{
    public Task Consume(ConsumeContext<Fault<AuctionDeleted>> context)
    {
        
        Console.WriteLine($"->> Consuming faulty creation");
        
        var exception = context.Message.Exceptions.First();
        
       Console.WriteLine($"Exception type: {exception.ExceptionType}, {exception.Message}");
       
       return Task.CompletedTask;
    }
}