using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Vehicle;

namespace WebApplication1.Controllers;
[ApiController]
[Route("[controller]")]
public class VehicleController: ControllerBase
{
    private readonly DatabaseContext _context;

    public VehicleController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Vehicle>> GetVehicles()
    {
        var vehicles = _context.Vehicles.ToList();
        return vehicles;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound();
        return vehicle;
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound();
        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] CreateVehicleDto dto)
    {

        var vehicle = new Vehicle
        {
            LicensePlate = dto.LicensePlate, 
            Type = dto.Type,
            Capacity = dto.Capacity,
            State = dto.State
        };
        await _context.AddAsync(vehicle);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetVehicle), new {id = vehicle.VehicleId}, vehicle);
    }
}