using System.ComponentModel.DataAnnotations;
using WebApplication1.Models.Transport;

namespace WebApplication1.DTOs.Transport;

public class UpdateTransportDto
{
    
    [Required]
    public int? JobId { get; set; }
    
    [Required]
    public int? VehicleId { get; set; }
    
    [Required]
    public int? DriverId { get; set; }
    
    [Required]
    public DateOnly? StartDate { get; set; }
    
    [Required]
    public DateOnly? EndDate { get; set; }
    
    [Required]
    public int? CargoMass { get; set; }
    
    [Required]
    public TransportStatus? Status { get; set; }
    
}