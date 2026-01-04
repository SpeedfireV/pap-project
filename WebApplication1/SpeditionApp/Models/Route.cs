using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Route
{
    [Key]
    public int RouteId { get; set; }
    
    [Required]
    public int TransportId { get; set; }
    
    [ValidateNever]
    [ForeignKey("TransportId")]
    public Transport? Transport { get; set; }
    
    [Required]
    public string StartPoint { get; set; } = string.Empty;
    
    [Required]
    public string EndPoint { get; set; } = string.Empty;
    
    [Required]
    public int Distance { get; set; }
    
    [Required]
    public TimeSpan EstimatedTime { get; set; }
}