using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public async Task<ActionResult<TransportCost>> PostTransportCost(TransportCost cost, CancellationToken ct)
    {
        try
        {
            if (cost == null) return BadRequest("Cost data is required.");

            var transportExists = await _context.Transports.AnyAsync(t => t.TransportId == cost.TransportId, ct);
            if (!transportExists) return BadRequest($"Transport with ID {cost.TransportId} does not exist.");

            await _context.TransportCosts.AddAsync(cost, ct);
            await _context.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(GetCostsByTransport), new { transportId = cost.TransportId }, cost);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("PostTransportCost operation was cancelled.");
            return StatusCode(499);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while saving transport cost.");
            return BadRequest("Could not save cost. Database constraint violation.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in PostTransportCost.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("transport/{transportId}")]
    public async Task<ActionResult<IEnumerable<TransportCost>>> GetCostsByTransport(int transportId, CancellationToken ct)
    {
        try
        {
            var costs = await _context.TransportCosts
                .Where(c => c.TransportId == transportId)
                .ToListAsync(ct);

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
    public async Task<ActionResult<decimal>> GetTotalCost(int transportId, CancellationToken ct)
    {
        try
        {
            var costsExist = await _context.TransportCosts.AnyAsync(c => c.TransportId == transportId, ct);
            if (!costsExist) return Ok(0m);

            var total = await _context.TransportCosts
                .Where(c => c.TransportId == transportId)
                .SumAsync(c => (decimal)c.Amount, ct);

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