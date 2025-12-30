using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Transport;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<TransportController> _logger;

    public TransportController(DatabaseContext context, ILogger<TransportController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transport>>> GetTransports()
    {
        try
        {
            return await _context.Transports.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching all transports.");
            return StatusCode(500, "Internal server error while retrieving data.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transport>> GetTransport(int id)
    {
        try
        {
            var transport = await _context.Transports.FindAsync(id);
            if (transport == null) 
                return NotFound($"Transport with ID {id} not found.");

            return Ok(transport);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching transport {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPut("{id}")] 
    public async Task<ActionResult<Transport>> UpdateTransport(int id, [FromBody] UpdateTransportDto dto)
    {
        if (dto == null) return BadRequest("Update data is null.");

        try
        {
            var transport = await _context.Transports.FindAsync(id);
            if (transport == null) return NotFound($"Cannot update. Transport {id} not found.");

            transport.JobId = dto.JobId ?? transport.JobId;
            transport.VehicleId = dto.VehicleId ?? transport.VehicleId;
            transport.DriverId = dto.DriverId ?? transport.DriverId;
            transport.StartDate = dto.StartDate ?? transport.StartDate;
            transport.EndDate = dto.EndDate ?? transport.EndDate;
            transport.CargoMass = dto.CargoMass ?? transport.CargoMass;
            transport.Status = dto.Status ?? transport.Status;

            await _context.SaveChangesAsync();
            return Ok(transport);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict for Transport {Id}.", id);
            return Conflict("The record was modified by another user. Please refresh and try again.");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database update error for Transport {Id}.", id);
            return BadRequest("Could not update transport. Check if related IDs (Vehicle/Driver) are correct.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during update of Transport {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Transport>> CreateTransport([FromBody] CreateTransportDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var transport = new Transport
            {
                JobId = dto.JobId,
                VehicleId = dto.VehicleId,
                DriverId = dto.DriverId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CargoMass = dto.CargoMass,
                Status = dto.Status
            };

            await _context.Transports.AddAsync(transport);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransport), new { id = transport.TransportId }, transport);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while creating transport.");
            return BadRequest("Data integrity error. Ensure all related IDs exist.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during transport creation.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransport(int id)
    {
        try
        {
            var transport = await _context.Transports.FindAsync(id);
            if (transport == null) return NotFound($"Transport {id} not found.");

            _context.Transports.Remove(transport);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting transport {Id}.", id);
            return StatusCode(500, "An error occurred while deleting the transport.");
        }
    }
}