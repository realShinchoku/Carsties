using System.Globalization;
using AuctionService.Data;
using Grpc.Core;

namespace AuctionService.Services;

public class GrpcAuctionService : GrpcAuction.GrpcAuctionBase
{
    private readonly AuctionDbContext _dbContext;

    public GrpcAuctionService(AuctionDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<GrpcAuctionResponse> GetAuction(GetAuctionRequest request, ServerCallContext context)
    {
        Console.WriteLine("==> Received Grpc request for auction");
        
        var auction = await _dbContext.Auctions.FindAsync(Guid.Parse(request.Id))
            ?? throw new RpcException(new Status(StatusCode.NotFound, $"Auction with id {request.Id} not found"));

        var response = new GrpcAuctionResponse
        {
            Auction = new GrpcAuctionModel
            {
                Id = auction.Id.ToString(),
                Seller = auction.Seller,
                AuctionEnd = auction.AuctionEnd.ToString(CultureInfo.InvariantCulture),
                ReservePrice = auction.ReservePrice,
            }
        };
        
        return response;
    }
}