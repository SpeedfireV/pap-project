using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Driver;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DriverController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<DriverController> _logger;

    public DriverController(DatabaseContext context, ILogger<DriverController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Driver>>> GetDrivers([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Drivers
                .Where(d => d.DriverId > lastId)
                .OrderBy(d => d.DriverId)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching drivers.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Driver>> GetDriver(int id)
    {
        try
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound($"Driver with ID {id} not found.");
            return Ok(driver);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching driver {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDriver(int id)
    {
        try
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound($"Driver {id} not found.");
            
            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict deleting driver {Id}.", id);
            return Conflict("The driver was already deleted or modified.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting driver {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Driver>> CreateDriver([FromBody] CreateDriverDto dto)
    {
        try
        {
            var driver = new Driver
            {
                Name = dto.Name, 
                Surname = dto.Surname,
                LicenseNumber = dto.LicenseNumber,
                Phone = dto.Phone,
                Status = dto.Status
            };
            await _context.AddAsync(driver);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetDriver), new {id = driver.DriverId}, driver);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating driver.");
            return BadRequest("Could not create driver. Check license number uniqueness.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating driver.");
            return StatusCode(500, "Internal server error.");
        }
    }
}