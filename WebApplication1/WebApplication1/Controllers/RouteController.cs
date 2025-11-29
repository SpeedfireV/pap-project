using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Route;

namespace WebApplication1.Controllers;
[ApiController]
[Route("[controller]")]
public class RouteController : ControllerBase
{
    readonly DatabaseContext _context;
    
    public RouteController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Route>> GetRoutes()
    {
        return _context.Routes.ToList();
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Route>> GetRoute(int id)
    {
        var route = await _context.Routes.FindAsync(id);
        if (route == null)
        {
            return NotFound();
        }
        return route;
    }
    
    [HttpPost]
    public async Task<ActionResult<Route>> CreateRoute([FromBody] CreateRouteDto dto)
    {
       var route = new Route {
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
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRoute(int id)
    {
        var route = await _context.Routes.FindAsync(id);
        if (route == null) return NotFound();
        _context.Routes.Remove(route);
        await _context.SaveChangesAsync();
        return Ok();
    }
}