using AutoMapper;
using BiddingService.DTOs;
using BiddingService.Models;
using BiddingService.Services;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;
using Microsoft.Extensions.Logging;

namespace BiddingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BidsController : ControllerBase
{
    private readonly GrpcAuctionClient _grpcClient;
    private readonly IMapper _mapper;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<BidsController> _logger;

    public BidsController(IMapper mapper, IPublishEndpoint publishEndpoint, GrpcAuctionClient grpcClient, ILogger<BidsController> logger)
    {
        _mapper = mapper;
        _publishEndpoint = publishEndpoint;
        _grpcClient = grpcClient;
        _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Bid>> PlaceBid([FromQuery] string auctionId, int amount)
    {
        try
        {
            var auction = await DB.Find<Auction>().OneAsync(auctionId);

            if (auction == null)
            {
                auction = _grpcClient.GetAuction(auctionId);

                if (auction == null) return BadRequest("Cannot access bids on this auction at this time");
            }

            if (auction.Seller == User.Identity.Name)
                return BadRequest("You cannot bid on your own auction");

            var bid = new Bid
            {
                Amount = amount,
                AuctionId = auctionId,
                Bidder = User.Identity.Name
            };

            if (auction.AuctionEnd < DateTime.UtcNow)
            {
                bid.BidStatus = BidStatus.Finished;
            }

            else
            {
                var highBid = await DB.Find<Bid>()
                    .Match(a => a.AuctionId == auctionId)
                    .Sort(b => b.Descending(x => x.Amount))
                    .ExecuteFirstAsync();

                if ((highBid != null && amount > highBid.Amount) || highBid == null)
                    bid.BidStatus = amount > auction.ReservePrice
                        ? BidStatus.Accepted
                        : BidStatus.AcceptedBelowReserve;

                if (highBid != null && amount <= highBid.Amount)
                    bid.BidStatus = BidStatus.TooLow;
            }

            await DB.SaveAsync(bid);

            await _publishEndpoint.Publish(_mapper.Map<BidPlaced>(bid));

            return Ok(_mapper.Map<BidDto>(bid));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while placing bid.");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{auctionId}")]
    public async Task<ActionResult<List<Bid>>> GetBidsForAuction(string auctionId)
    {
        try
        {
            var bids = await DB.Find<Bid>()
                .Match(a => a.AuctionId == auctionId)
                .Sort(b => b.Descending(x => x.BidTime))
                .ExecuteAsync();

            return Ok(_mapper.Map<IEnumerable<BidDto>>(bids));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting bids for auction.");
            return StatusCode(500, "Internal server error");
        }
    }
}
