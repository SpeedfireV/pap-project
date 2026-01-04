using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Vehicle
{
    [Key]
    public int VehicleId { get; set; }
    
    [Required]
    public string LicensePlate { get; set; } = string.Empty;
    
    [Required]
    public VehicleType Type { get; set; }
    
    [Required]
    public int Capacity { get; set; }
    
    [Required]
    public VehicleState State { get; set; }
}