using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Cargo;

namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class CargoController: ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<CargoController> _logger;

    public CargoController(DatabaseContext context, ILogger<CargoController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cargo>>> GetCargos([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Cargos.Where(e => e.CargoId > lastId)
                .OrderBy(e => e.CargoId)
                .Take(amount)
                .ToListAsync();
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogCritical(ex, "Cargos source is null. Check DatabaseContext.");
            return StatusCode(500, "Internal configuration error.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching cargos.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Cargo>> GetCargo(int id)
    {
        try
        {
            var cargo = await _context.Cargos.FindAsync(id);
            
            if (cargo == null) 
                return NotFound($"Cargo with ID {id} not found.");
            
            return Ok(cargo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cargo {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCargo(int id)
    {
        try
        {
            var cargo = await _context.Cargos.FindAsync(id);
            if (cargo == null) return NotFound($"Cargo {id} not found.");

            _context.Cargos.Remove(cargo);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict deleting cargo {Id}.", id);
            return Conflict("The cargo was already deleted or modified.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting cargo {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Cargo>> CreateCargo([FromBody] CreateCargoDto dto)
    {
        try
        {
            var cargo = new Cargo
            {
                TransportId = dto.TransportId,
                Name = dto.Name, 
                Description = dto.Description,
                Amount = dto.Amount
            };
            await _context.Cargos.AddAsync(cargo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCargo), new {id = cargo.CargoId}, cargo);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating cargo.");
            return BadRequest("Could not create cargo.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating cargo.");
            return StatusCode(500, "Internal server error.");
        }
    }
}