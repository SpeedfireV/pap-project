using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Error;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErrorController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<ErrorController> _logger;

    public ErrorController(DatabaseContext context, ILogger<ErrorController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Error>>> GetErrors([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Errors
                .Where(e => e.Id > lastId)
                .OrderBy(e => e.Id)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching errors.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Error>> GetError(int id)
    {
        try
        {
            var error = await _context.Errors.FindAsync(id);
            if (error == null) return NotFound("Error ticket not found.");
            return Ok(error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching error ticket {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Error>> CreateError(CreateErrorDto dto)
    {
        try
        {
            var error = new Error
            {
                Name = dto.TicketName,
                Description = dto.TicketDescription,
                TicketDate = DateTime.UtcNow
            };

            _context.Errors.Add(error);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetError), new { id = error.Id }, error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating error ticket.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteError(int id)
    {
        try
        {
            var error = await _context.Errors.FindAsync(id);
            if (error == null) return NotFound("Error ticket not found.");

            _context.Errors.Remove(error);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting error ticket {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}