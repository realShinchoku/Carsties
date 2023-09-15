using System.Runtime.InteropServices.ComTypes;
using AutoMapper;
using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers;

public class AuctionUpdatedConsumer : IConsumer<AuctionUpdated>
{
    private readonly IMapper _mapper;

    public AuctionUpdatedConsumer(IMapper mapper)
    {
        _mapper = mapper;
    }

    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        Console.WriteLine($"->> Consuming AuctionUpdated: {context.Message.Id}");

        var item = await DB.Find<Item>().OneAsync(context.Message.Id);

        _mapper.Map(context.Message, item);
        
        await item.SaveAsync();
    }
}