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

    [HttpPost]
    public async Task<ActionResult<Error>> CreateError([FromBody] CreateErrorDto dto)
    {
        if (dto == null) return BadRequest("Error data is required.");

        try
        {
            var error = new Error
            {
                Name = dto.TicketName,
                Description = dto.TicketDescription,
                TicketDate = DateTime.UtcNow
            };

            await _context.Errors.AddAsync(error);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetError), new { id = error.ErrorId }, error);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Failed to save error ticket to database.");
            return StatusCode(500, "Database error while saving the ticket.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in CreateError.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<Error>>> GetErrors()
    {
        try
        {
            return await _context.Errors.ToListAsync();
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogCritical(ex, "Errors DbSet is null.");
            return StatusCode(500, "Configuration error.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not fetch error tickets.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Error>> GetError(int id)
    {
        try
        {
            var error = await _context.Errors.FirstOrDefaultAsync(e => e.ErrorId == id);
            if (error == null) return NotFound($"Error ticket {id} not found.");
            return Ok(error);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching ticket {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteError(int id)
    {
        try
        {
            var error = await _context.Errors.FirstOrDefaultAsync(e => e.ErrorId == id);
            if (error == null) return NotFound($"Error ticket {id} not found.");

            _context.Errors.Remove(error);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency error deleting ticket {Id}.", id);
            return Conflict("The ticket was already deleted or modified.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ticket {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}