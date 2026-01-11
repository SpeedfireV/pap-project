using System.Data.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MaintenanceLogController : ControllerBase
{
    private readonly DatabaseContext _context;

    public MaintenanceLogController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaintenanceLog>>> GetLogs()
    {
        return await _context.MaintenanceLogs.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<MaintenanceLog>> CreateLog(MaintenanceLog log)
    {
        log.Vehicle = null; 

        _context.MaintenanceLogs.Add(log);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLogs), new { id = log.MaintenanceId }, log);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<MaintenanceLog>>> GetLogsByVehicle(int vehicleId)
    {
        var logs = await _context.MaintenanceLogs
            .Where(m => m.VehicleId == vehicleId)
            .OrderByDescending(m => m.ServiceDate)
            .ToListAsync();

        return logs;
    }
}