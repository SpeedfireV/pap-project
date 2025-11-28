using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Transport
{
    [Key]
    public int TransportId { get; set; }
    
    [Required]
    public int JobId { get; set; }
    
    [Required]
    public int VehicleId { get; set; }
    
    [Required]
    public int DriverId { get; set; }

    [ValidateNever]
    public Job Job { get; set; } = null!;
    
    [ValidateNever]
    public Vehicle Vehicle { get; set; } = null!;
    
    [ValidateNever]
    public Driver Driver { get; set; } = null!;
    
    [Required]
    public DateOnly StartDate { get; set; }
    
    [Required]
    public DateOnly EndDate { get; set; }
    
    [Required]
    public int CargoMass { get; set; }
    
    [Required]
    public int Status { get; set; }
}