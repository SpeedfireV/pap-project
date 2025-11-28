using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Route
{
    [Key]
    public int RouteId { get; set; }
    
    [Required]
    public string StartPoint { get; set; } = string.Empty;
    
    [Required]
    public string EndPoint { get; set; } = string.Empty;
    
    [Required]
    public int Distance { get; set; }
    
    [Required]
    public int EstimatedTime { get; set; }
}