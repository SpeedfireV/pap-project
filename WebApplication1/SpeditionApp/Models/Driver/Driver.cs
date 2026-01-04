using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Driver
{
    [Key]
    public int DriverId { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Surname { get; set; } = string.Empty;
    
    [Required]
    public int LicenseNumber { get; set; }
    
    [Required]
    [Phone]
    public int Phone { get; set; }
    
    [Required]
    public DriverStatus Status { get; set; }
}