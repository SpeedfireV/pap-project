using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models.Transport;

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
    [ForeignKey("JobId")]
    public Job Job { get; set; } = null!;
    
    [ValidateNever]
    [ForeignKey("VehicleId")]
    public Vehicle Vehicle { get; set; } = null!;
    
    [ValidateNever]
    [ForeignKey("DriverId")]
    public Driver Driver { get; set; } = null!;
    
    [Required]
    public DateOnly StartDate { get; set; }
    
    [Required]
    public DateOnly EndDate { get; set; }
    
    [Required]
    public int CargoMass { get; set; }
    
    [Required]
    public TransportStatus Status { get; set; }
}