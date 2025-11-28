using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Invoice
{
    [Key]
    public int InvoiceId { get; set; }
    
    [Required]
    public int JobId { get; set; }

    [ValidateNever]
    public Job Job { get; set; } = null!;
    
    [Required]
    public int Number { get; set; }
    
    [Required]
    public int Amount { get; set; }
    
    [Required]
    public int IssueDate { get; set; }
    
    [Required]
    public int Maturity { get; set; }
    
    [Required]
    public int PaymentStatus { get; set; }
}