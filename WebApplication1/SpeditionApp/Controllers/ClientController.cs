using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Client;

namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ClientController: ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<ClientController> _logger;

    public ClientController(DatabaseContext context, ILogger<ClientController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Clients.Where(e => e.ClientId > lastId)
                .OrderBy(e => e.ClientId)
                .Take(amount)
                .ToListAsync();
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogCritical(ex, "Clients source is null. Check DatabaseContext.");
            return StatusCode(500, "Internal configuration error.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching clients.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Client>> GetClient(int id)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);
            
            if (client == null) 
                return NotFound($"Client with ID {id} not found.");
            
            return Ok(client);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching client {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteClient(int id)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null) return NotFound($"Client {id} not found.");

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict deleting client {Id}.", id);
            return Conflict("The client was already deleted or modified.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting client {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Client>> CreateClient([FromBody] CreateClientDto dto)
    {
        try
        {
            var client = new Client
            {
                Name = dto.Name, 
                Nip = dto.Nip,
                Address = dto.Address,
                Phone = dto.Phone
            };
            
            await _context.Clients.AddAsync(client);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetClient), new {id = client.ClientId}, client);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating client.");
            return BadRequest("Could not create client.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating client.");
            return StatusCode(500, "Internal server error.");
        }
    }
}