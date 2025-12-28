using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Cargo;

namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class CargoController: ControllerBase
{
    private readonly DatabaseContext _context;

    public CargoController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Cargo>> GetCargos()
    {
        var cargos = _context.Cargos.ToList();
        return cargos;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Cargo>> GetCargo(int id)
    {
        var cargo = await _context.Cargos.FindAsync(id);
        if (cargo == null) return NotFound();
        return cargo;
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
    public async Task<ActionResult<Cargo>> CreateCargo([FromBody] CreateCargoDto dto)
    {

        var cargo = new Cargo
        {
            Name = dto.Name, 
            Description = dto.Description,
            Amount = dto.Amount
        };
        await _context.AddAsync(cargo);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCargo), new {id = cargo.CargoId}, cargo);
    }
}