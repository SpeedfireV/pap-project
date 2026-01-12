using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Route;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RouteController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<RouteController> _logger;

    public RouteController(DatabaseContext context, ILogger<RouteController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Route>>> GetRoutes([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            // Pagination logic: Get the next 'amount' of routes starting after 'lastId'
            return await _context.Routes
                .Where(e => e.RouteId > lastId)
                .OrderBy(e => e.RouteId)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching routes.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Route>> GetRoute(int id)
    {
        try
        {
            var route = await _context.Routes.FindAsync(id);
            
            if (route == null)
            {
                return NotFound($"Route with ID {id} was not found.");
            }
            return Ok(route);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving route {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Route>> CreateRoute([FromBody] CreateRouteDto dto)
    {

        try
        {
            var route = new Route
            {
                TransportId = dto.TransportId,
                StartPoint = dto.StartPoint,
                EndPoint = dto.EndPoint,
                Distance = dto.Distance,
                EstimatedTime = dto.EstimatedTime
            };

            await _context.Routes.AddAsync(route);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetRoute),
                new { id = route.RouteId },
                route
            );
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while creating a new route.");
            return BadRequest("Could not save the route. Verify if the data is valid.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during route creation.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRoute(int id)
    {
        try
        {
            var route = await _context.Routes.FindAsync(id);
            if (route == null) 
                return NotFound($"Route with ID {id} not found.");

            _context.Routes.Remove(route);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Route {Id} was modified or deleted by another user.", id);
            return Conflict("Concurrency error: the record no longer exists.");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "Conflict: Route {Id} is likely in use and cannot be deleted.", id);
            return Conflict("Cannot delete this route because it is linked to existing transport records.");
        }
        
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while deleting route {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}