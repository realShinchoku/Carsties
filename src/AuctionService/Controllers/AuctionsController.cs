using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AutoMapper;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AuctionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IAuctionRepository _repo;
    private readonly ILogger<AuctionsController> _logger;

    public AuctionsController(IAuctionRepository repo, IMapper mapper, IPublishEndpoint publishEndpoint, ILogger<AuctionsController> logger)
    {
        _repo = repo;
        _mapper = mapper;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a list of all auctions.
    /// </summary>
    /// <param name="date">Optional date filter to retrieve auctions updated after the specified date.</param>
    /// <returns>List of AuctionDto objects.</returns>
    [HttpGet]
    public async Task<ActionResult<List<AuctionDto>>> GetAllAuctions(string date)
    {
        try
        {
            return await _repo.GetAuctionsAsync(date);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all auctions.");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Retrieves a specific auction by ID.
    /// </summary>
    /// <param name="id">The ID of the auction to retrieve.</param>
    /// <returns>AuctionDto object.</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<AuctionDto>> GetAuctionById(Guid id)
    {
        try
        {
            var auction = await _repo.GetAuctionByIdAsync(id);
            if (auction == null) return NotFound();
            return auction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting auction by id.");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Creates a new auction.
    /// </summary>
    /// <param name="createAuctionDto">The data for the new auction.</param>
    /// <returns>The created AuctionDto object.</returns>
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<AuctionDto>> CreateAuction(CreateAuctionDto createAuctionDto)
    {
        try
        {
            var auction = _mapper.Map<Auction>(createAuctionDto);

            auction.Seller = User.Identity?.Name;

            _repo.AddAuction(auction);

            var newAuction = _mapper.Map<AuctionDto>(auction);

            await _publishEndpoint.Publish(_mapper.Map<AuctionCreated>(newAuction));

            var result = await _repo.SaveChangesAsync();

            if (!result) return BadRequest("Could not save changes to database.");

            return CreatedAtAction(nameof(GetAuctionById), new { id = auction.Id }, newAuction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating auction.");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Updates an existing auction.
    /// </summary>
    /// <param name="id">The ID of the auction to update.</param>
    /// <param name="updateAuctionDto">The updated data for the auction.</param>
    /// <returns>HTTP status code indicating the result of the operation.</returns>
    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateAuction(Guid id, UpdateAuctionDto updateAuctionDto)
    {
        try
        {
            var auction = await _repo.GetAuctionEntityByIdAsync(id);
            if (auction == null) return NotFound();

            if (auction.Seller != User.Identity?.Name) return Forbid();

            auction.Item.Make = updateAuctionDto.Make ?? auction.Item.Make;
            auction.Item.Model = updateAuctionDto.Model ?? auction.Item.Model;
            auction.Item.Year = updateAuctionDto.Year ?? auction.Item.Year;
            auction.Item.Color = updateAuctionDto.Color ?? auction.Item.Color;
            auction.Item.Mileage = updateAuctionDto.Mileage ?? auction.Item.Mileage;

            await _publishEndpoint.Publish(_mapper.Map<AuctionUpdated>(auction));

            var result = await _repo.SaveChangesAsync();

            if (!result) return BadRequest("Could not save changes to database.");

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating auction.");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Deletes an existing auction.
    /// </summary>
    /// <param name="id">The ID of the auction to delete.</param>
    /// <returns>HTTP status code indicating the result of the operation.</returns>
    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteAuction(Guid id)
    {
        try
        {
            var auction = await _repo.GetAuctionEntityByIdAsync(id);
            if (auction == null) return NotFound();

            if (auction.Seller != User.Identity?.Name) return Forbid();

            _repo.RemoveAuction(auction);

            await _publishEndpoint.Publish<AuctionDeleted>(new { Id = id.ToString() });

            var result = await _repo.SaveChangesAsync();

            if (!result) return BadRequest("Could not save changes to database.");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting auction.");
            return StatusCode(500, "Internal server error");
        }
    }
}
