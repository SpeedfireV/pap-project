using System.Data.Entity;
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportCostsController : ControllerBase
{
    private readonly DatabaseContext _context;

    public TransportCostsController(DatabaseContext context)
    {
        _context = context;
    }

    // POST: api/TransportCosts
    [HttpPost]
    public async Task<ActionResult<TransportCost>> PostTransportCost(TransportCost cost)
    {
        // Link cost to a valid transport
        _context.TransportCosts.Add(cost);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCostsByTransport), new { transportId = cost.TransportId }, cost);
    }

    // GET: api/TransportCosts/transport/5
    [HttpGet("transport/{transportId}")]
    public async Task<ActionResult<IEnumerable<TransportCost>>> GetCostsByTransport(int transportId)
    {
        var costs = await _context.TransportCosts
            .Where(c => c.TransportId == transportId)
            .ToListAsync();

        return Ok(costs);
    }

    // GET: api/TransportCosts/total/5
    [HttpGet("total/{transportId}")]
    public async Task<ActionResult<decimal>> GetTotalCost(int transportId)
    {
        // Useful for calculating margin
        var total = await _context.TransportCosts
            .Where(c => c.TransportId == transportId)
            .SumAsync(c => c.Amount);

        return Ok(total);
    }
}