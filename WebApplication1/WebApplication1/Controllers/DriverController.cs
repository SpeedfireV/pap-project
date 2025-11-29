using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Driver;

namespace WebApplication1.Controllers;
[ApiController]
[Route("[controller]")]
public class DriverController: ControllerBase
{
    private readonly DatabaseContext _context;

    public DriverController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Driver>> GetDrivers()
    {
        var drivers = _context.Drivers.ToList();
        return drivers;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Driver>> GetDriver(int id)
    {
        var driver = await _context.Drivers.FindAsync(id);
        if (driver == null) return NotFound();
        return driver;
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDriver(int id)
    {
        var driver = await _context.Drivers.FindAsync(id);
        if (driver == null) return NotFound();
        _context.Drivers.Remove(driver);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<Driver>> CreateDriver([FromBody] CreateDriverDto dto)
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
}