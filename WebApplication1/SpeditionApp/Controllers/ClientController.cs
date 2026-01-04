using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Client;

namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ClientController: ControllerBase
{
    private readonly DatabaseContext _context;

    public ClientController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Client>> GetClients()
    {
        var clients = _context.Clients.ToList();
        return clients;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Client>> GetClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();
        return client;
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();
        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<Client>> CreateClient([FromBody] CreateClientDto dto)
    {

        var client = new Client
        {
            Name = dto.Name, 
            Nip = dto.Nip,
            Address = dto.Address,
            Phone = dto.Phone
        };
        await _context.AddAsync(client);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetClient), new {id = client.ClientId}, client);
    }
}