using System.Data.Entity;
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly DatabaseContext _context;

    public UserController(DatabaseContext context)
    {
        _context = context;
    }

    // This is called after the Frontend gets a success from Google
    [HttpPost("sync")]
    public async Task<IActionResult> SyncUser([FromBody] User googleUser)
    {
        // Check if user already exists based on Google ExternalId
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.ExternalId == googleUser.ExternalId);

        if (existingUser == null)
        {
            // First time login - save them to our DB
            _context.Users.Add(googleUser);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserById), new { id = googleUser.UserId }, googleUser);
        }

        // Update profile info if it changed (e.g., FullName)
        existingUser.FullName = googleUser.FullName;
        existingUser.Email = googleUser.Email;
        
        await _context.SaveChangesAsync();
        return Ok(existingUser);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUserById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // Admin can change roles (e.g., promote a user to Admin)
    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UserRole newRole)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Role = newRole;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}