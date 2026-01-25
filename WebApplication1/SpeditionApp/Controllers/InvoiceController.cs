using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs.Invoice;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly ILogger<InvoiceController> _logger;

    public InvoiceController(DatabaseContext context, ILogger<InvoiceController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices([FromQuery] int lastId = -1, [FromQuery] int amount = 100)
    {
        try
        {
            return await _context.Invoices
                .Where(i => i.InvoiceId > lastId)
                .OrderBy(i => i.InvoiceId)
                .Take(amount)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching invoices.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        try
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound($"Invoice {id} not found.");
            return Ok(invoice);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching invoice {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] CreateInvoiceDto dto)
    {
        try
        {
            var invoice = new Invoice
            {
                JobId = dto.JobId,
                InvoiceNumber = dto.Number,
                Amount = dto.Amount,
                IssueDate = dto.IssueDate,
                PaymentDate = dto.Maturity,
                PaymentStatus = dto.PaymentStatus
            };
            await _context.Invoices.AddAsync(invoice);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInvoice), new {id = invoice.InvoiceId}, invoice);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating invoice.");
            return BadRequest("Could not create invoice. Ensure Job ID exists.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating invoice.");
            return StatusCode(500, "Internal server error.");
        }
    }
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInvoice(int id)
    {
        try
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound($"Invoice {id} not found.");
            
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting invoice {Id}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}