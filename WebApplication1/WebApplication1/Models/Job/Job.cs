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
    public DateOnly StartDate { get; set; }

    [Required]
    public JobStatus Status { get; set; }
    
    [Required]
    public string Remarks { get; set; } = string.Empty;
}