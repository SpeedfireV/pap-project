using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Error;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")] // Base route: /Error
public class ErrorController: ControllerBase
{
    private readonly DatabaseContext _context;

    public ErrorController(DatabaseContext context)
    {
        _context = context;
    }
    
    [HttpPost] 
    public async Task<ActionResult<Error>> CreateError([FromBody] CreateErrorDto dto) 
    {
        var error = new Error
        {
            Name = dto.TicketName, 
            Description = dto.TicketDescription, 
            TicketDate = DateTime.UtcNow
        };
        
        await _context.Errors.AddAsync(error);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(
            nameof(GetError),          
            new { id = error.ErrorId }, 
            error                      
        );
    }
    
    [HttpGet]
    public ActionResult<List<Error>> GetErrors()
    {
        var errors = _context.Errors.ToList();
        return errors; 
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Error>> GetError(int id)
    {
        var error = await _context.Errors.FirstOrDefaultAsync(e => e.ErrorId == id);
        if (error == null) return NotFound();
        return error;
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteError(int id)
    {
        var error = await _context.Errors.FirstOrDefaultAsync(e => e.ErrorId == id);
        if (error == null) return NotFound();
        _context.Errors.Remove(error);
        await _context.SaveChangesAsync();
        return Ok();
    }
    
}