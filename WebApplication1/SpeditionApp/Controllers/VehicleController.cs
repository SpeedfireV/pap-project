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
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Vehicles.Where(e => e.VehicleId > lastId).OrderBy(e => e.VehicleId).Take(amount).ToListAsync();
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
    public async Task<ActionResult<Vehicle>> GetVehicle(int id)
    {
        try
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            
            if (vehicle == null) 
                return NotFound($"Vehicle with ID {id} not found.");
            
            return Ok(vehicle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vehicle {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] CreateVehicleDto dto)
    {
        try
        {
            var vehicle = new Vehicle
            {
                LicensePlate = dto.LicensePlate,
                Type = dto.Type,
                Capacity = dto.Capacity,
                State = dto.State
            };

            await _context.Vehicles.AddAsync(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, vehicle);
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
    public async Task<ActionResult> DeleteVehicle(int id)
    {
        try
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound($"Vehicle {id} not found.");

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
            
            return NoContent();
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