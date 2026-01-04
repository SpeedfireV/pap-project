using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusHistoryController : ControllerBase
{
    private readonly DatabaseContext _context;

    public StatusHistoryController(DatabaseContext context)
    {
        _context = context;
    }

    [HttpGet("job/{jobId}")]
    public async Task<ActionResult<IEnumerable<StatusHistory>>> GetHistoryByJob(int jobId)
    {
        var history = await _context.StatusHistories
            .Include(sh => sh.User) // Includes Google User info
            .Where(sh => sh.JobId == jobId)
            .OrderByDescending(sh => sh.ChangeDate)
            .ToListAsync();

        return Ok(history);
    }
}