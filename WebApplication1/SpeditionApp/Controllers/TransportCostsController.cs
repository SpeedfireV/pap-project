using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.TransportCost;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportCostsController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<TransportCostsController> _logger;

    public TransportCostsController(DatabaseContext context, ILogger<TransportCostsController> logger)
    {
        _context = context;
        _logger = logger;
    }
    [HttpPost]
    public async Task<ActionResult<TransportCost>> PostTransportCost(
        [FromBody] CreateTransportCostDto dto)
    {
        try
        {
            var transportExists = await _context.Transports.AnyAsync(t => t.TransportId == dto.TransportId);
            if (!transportExists) return BadRequest($"Transport {dto.TransportId} not found.");

            var cost = new TransportCost
            {
                TransportId = dto.TransportId,
                Description = dto.Description,
                Amount = dto.Amount,
                Currency = dto.Currency,
                DateIncurred = dto.DateIncurred,
                Category = dto.Category
                
            };

            await _context.TransportCosts.AddAsync(cost);
            await _context.SaveChangesAsync();

            // 4. Return the Entity directly
            return CreatedAtAction(nameof(GetCostsByTransport), new { transportId = cost.TransportId }, cost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving transport cost.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("transport/{transportId}")]
    public async Task<ActionResult<IEnumerable<TransportCost>>> GetCostsByTransport(int transportId)
    {
        try
        {
            var costs = await _context.TransportCosts
                .Where(c => c.TransportId == transportId)
                .ToListAsync();

            return Ok(costs);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogCritical(ex, "The source collection is null.");
            return StatusCode(500, "Server configuration error.");
        }
    }

    [HttpGet("total/{transportId}")]
    public async Task<ActionResult<decimal>> GetTotalCost(int transportId)
    {
        try
        {
            var costsExist = await _context.TransportCosts.AnyAsync(c => c.TransportId == transportId);
            if (!costsExist) return Ok();

            var total = await _context.TransportCosts
                .Where(c => c.TransportId == transportId)
                .SumAsync(c => (decimal)c.Amount);

            return Ok(total);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating total cost for transport {Id}.", transportId);
            return StatusCode(500, "Error calculating total amount.");
        }
    }
}