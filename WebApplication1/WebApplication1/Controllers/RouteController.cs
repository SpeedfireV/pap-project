using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

public class RouteController
{
    readonly DatabaseContext _context;
    
    public RouteController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpPost]
    public Task<ActionResult<Route>> CreateRoute([FromBody] Route route)
    {
        
    }
}