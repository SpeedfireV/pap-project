using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Transport;

namespace WebApplication1.Controllers;

[ApiController]
[Route("[controller]")]
public class TransportController: ControllerBase
{
    readonly DatabaseContext _context;
    public TransportController(DatabaseContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public ActionResult<IEnumerable<Transport>> GetTransports()
    {
        var transports = _context.Transports.ToList();
        return transports;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Transport>> GetTransport(int id)
    {
        var transport = await _context.Transports.FindAsync(id);
        if (transport == null) return NotFound();
        return transport;
    }

    [HttpPut]
    public async Task<ActionResult<Transport>> UpdateTransport(int id, [FromBody] UpdateTransportDto dto)
    {
        var transport = await _context.Transports.FindAsync(id);
        if (transport == null) return NotFound();

        transport.JobId = dto.JobId ?? transport.JobId;
        transport.VehicleId = dto.VehicleId ?? transport.VehicleId;
        transport.DriverId = dto.DriverId ?? transport.DriverId;
        transport.StartDate = dto.StartDate ?? transport.StartDate;
        transport.EndDate = dto.EndDate ?? transport.EndDate;
        transport.CargoMass = dto.CargoMass ?? transport.CargoMass;
        transport.Status = dto.Status ?? transport.Status;

        await _context.SaveChangesAsync();

        return transport;
    }


    [HttpPost]
    public async Task<ActionResult<Transport>> CreateTransport([FromBody] CreateTransportDto dto)
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
        return CreatedAtAction(nameof(GetTransport), new {id = transport.TransportId}, transport);
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransport(int id)
    {
        var transport = await _context.Transports.FindAsync(id);
        if (transport == null) return NotFound();
        _context.Transports.Remove(transport);
        await _context.SaveChangesAsync();
        return Ok();
    }
    
}