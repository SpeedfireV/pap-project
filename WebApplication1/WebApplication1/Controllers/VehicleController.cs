using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Vehicle;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<VehicleController> _logger;

    public VehicleController(DatabaseContext context, ILogger<VehicleController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles(CancellationToken ct)
    {
        try
        {
            return await _context.Vehicles.ToListAsync(ct);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogCritical(ex, "Vehicles source is null. Check DatabaseContext.");
            return StatusCode(500, "Internal configuration error.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching vehicles.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(int id, CancellationToken ct)
    {
        try
        {
            var vehicle = await _context.Vehicles.FindAsync(new object[] { id }, ct);
            
            if (vehicle == null) 
                return NotFound($"Vehicle with ID {id} not found.");
            
            return Ok(vehicle);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vehicle {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] CreateVehicleDto dto, CancellationToken ct)
    {
        if (dto == null) return BadRequest("Vehicle data is missing.");

        try
        {
            var vehicle = new Vehicle
            {
                LicensePlate = dto.LicensePlate,
                Type = dto.Type,
                Capacity = dto.Capacity,
                State = dto.State
            };

            await _context.Vehicles.AddAsync(vehicle, ct);
            await _context.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, vehicle);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating vehicle.");
            return BadRequest("Could not create vehicle. License plate might already exist.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating vehicle.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVehicle(int id, CancellationToken ct)
    {
        try
        {
            var vehicle = await _context.Vehicles.FindAsync(new object[] { id }, ct);
            if (vehicle == null) return NotFound($"Vehicle {id} not found.");

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync(ct);
            
            return NoContent();
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict deleting vehicle {Id}.", id);
            return Conflict("The vehicle was already deleted or modified.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting vehicle {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}