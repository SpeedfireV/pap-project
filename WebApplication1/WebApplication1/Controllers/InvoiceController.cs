using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs.Invoice;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController: ControllerBase
{
    readonly DatabaseContext _context;
    public InvoiceController(DatabaseContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public ActionResult<IEnumerable<Invoice>> GetInvoices()
    {
        var invoices = _context.Invoices.ToList();
        return invoices;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return NotFound();
        return invoice;
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] CreateInvoiceDto dto)
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
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInvoice(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return NotFound();
        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return Ok();
    }
    
}