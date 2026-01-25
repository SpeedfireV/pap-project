using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Job;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<JobController> _logger;

    public JobController(DatabaseContext context, ILogger<JobController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetJobs([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Jobs
                .Where(j => j.JobId > lastId)
                .OrderBy(j => j.JobId)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching jobs.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Job>> GetJob(int id)
    {
        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return NotFound($"Job with ID {id} not found.");
            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching job {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Job>> CreateJob([FromBody] CreateJobDto dto)
    {
        try
        {
            var job = new Job
            {
                ClientId = dto.ClientId,
                StartDate = dto.Date,
                Status = dto.Status,
                Remarks = dto.Remarks
            };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJob), new {id = job.JobId}, job);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating job.");
            return BadRequest("Could not create job. Check Client ID.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating job.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJob(int id)
    {
        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return NotFound($"Job {id} not found.");
            
            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting job {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] JobStatus newStatus, [FromQuery] int userId)
    {
        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return NotFound($"Job {id} not found.");

            // 1. Create history record
            var history = new StatusHistory
            {
                JobId = job.JobId,
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for job {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}