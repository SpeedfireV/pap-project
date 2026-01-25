using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MaintenanceLogController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<MaintenanceLogController> _logger;

    public MaintenanceLogController(DatabaseContext context, ILogger<MaintenanceLogController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaintenanceLog>>> GetLogs([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.MaintenanceLogs
                .Where(m => m.MaintenanceId > lastId)
                .OrderBy(m => m.MaintenanceId)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching maintenance logs.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<MaintenanceLog>> CreateLog(MaintenanceLog log)
    {
        try
        {
            log.Vehicle = null; // Prevent object cycle or accidental updates

            _context.MaintenanceLogs.Add(log);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLogs), new { id = log.MaintenanceId }, log);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating maintenance log.");
            return BadRequest("Could not save log. Check Vehicle ID.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating maintenance log.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<MaintenanceLog>>> GetLogsByVehicle(int vehicleId)
    {
        try
        {
            var logs = await _context.MaintenanceLogs
                .Where(m => m.VehicleId == vehicleId)
                .OrderByDescending(m => m.ServiceDate)
                .ToListAsync();

            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching logs for vehicle {VehicleId}.", vehicleId);
            return StatusCode(500, "Internal server error.");
        }
    }
}