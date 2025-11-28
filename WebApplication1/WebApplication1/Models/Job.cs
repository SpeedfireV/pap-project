using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Job
{
    [Key]
    public int JobId { get; set; }
    
    [Required]
    public int ClientId { get; set; }

    [ValidateNever]
    public Client Client { get; set; } = null!;
    
    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;
    
    [Required]
    public string Remarks { get; set; } = string.Empty;
}