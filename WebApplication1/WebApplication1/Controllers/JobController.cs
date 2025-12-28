using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Job;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobController: ControllerBase
{
    readonly DatabaseContext _context;
    public JobController(DatabaseContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public ActionResult<IEnumerable<Job>> GetJobs()
    {
        var jobs = _context.Jobs.ToList();
        return jobs;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Job>> GetJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null) return NotFound();
        return job;
    }

    [HttpPost]
    public async Task<ActionResult<Job>> CreateJob([FromBody] CreateJobDto dto)
    {
        var job = new Job
        {
            ClientId = dto.ClientId,
            Date = dto.Date,
            Status = dto.Status,
            Remarks = dto.Remarks
        };
        await _context.Jobs.AddAsync(job);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetJob), new {id = job.JobId}, job);
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null) return NotFound();
        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] JobStatus newStatus, [FromQuery] int userId)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null) return NotFound();

        // 1. Create history record
        var history = new StatusHistory
        {
            JobId = job.JobId,
            UserId = userId, // Linked to User table
            OldStatus = job.Status,
            NewStatus = newStatus,
            ChangeDate = DateTime.UtcNow
        };

        // 2. Update Job
        job.Status = newStatus;

        _context.StatusHistories.Add(history);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
}