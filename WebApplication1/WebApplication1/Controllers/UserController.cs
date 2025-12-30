using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<UserController> _logger;

    public UserController(DatabaseContext context, ILogger<UserController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncUser([FromBody] User googleUser, CancellationToken ct)
    {
        if (googleUser == null) return BadRequest("User data is missing.");

        try
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.ExternalId == googleUser.ExternalId, ct);

            if (existingUser == null)
            {
                _logger.LogInformation("Creating new user with ExternalId: {ExternalId}", googleUser.ExternalId);
                await _context.Users.AddAsync(googleUser, ct);
                await _context.SaveChangesAsync(ct);
                return CreatedAtAction(nameof(GetUserById), new { id = googleUser.UserId }, googleUser);
            }

            existingUser.FullName = googleUser.FullName;
            existingUser.Email = googleUser.Email;
            
            await _context.SaveChangesAsync(ct);
            return Ok(existingUser);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error during user sync for ExternalId: {ExternalId}", googleUser.ExternalId);
            return BadRequest("Could not sync user due to database constraints (e.g., duplicate email).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in SyncUser.");
            return StatusCode(500, "Internal server error during authentication sync.");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUserById(int id, CancellationToken ct)
    {
        try
        {
            var user = await _context.Users.FindAsync(new object[] { id }, ct);
            if (user == null) return NotFound($"User with ID {id} not found.");
            
            return Ok(user);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UserRole newRole, CancellationToken ct)
    {
        try
        {
            var user = await _context.Users.FindAsync(new object[] { id }, ct);
            if (user == null) return NotFound($"User {id} not found.");

            user.Role = newRole;
            await _context.SaveChangesAsync(ct);
            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict while updating role for user {Id}.", id);
            return Conflict("The user record was modified by another process.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role for user {Id}.", id);
            return StatusCode(500, "An error occurred while updating the user role.");
        }
    }
}