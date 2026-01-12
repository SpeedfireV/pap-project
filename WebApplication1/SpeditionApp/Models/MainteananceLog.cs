using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace WebApplication1;

public class MaintenanceLog
{
    [Key]
    public int MaintenanceId { get; set; }

    public int VehicleId { get; set; }

    [Required]
    [StringLength(100)]
    // Use 'required' to ensure this is set during object creation and satisfy the compiler
    public required string ServiceType { get; set; }

    public int OdometerReading { get; set; }

    [StringLength(1000)]
    // If the description is mandatory, use 'required'. 
    // If it can be empty, initialize it with string.Empty.
    public required string Description { get; set; }

    public float Cost { get; set; }

    public DateTime ServiceDate { get; set; }

    public DateTime? NextServiceDue { get; set; }

    [ValidateNever]
    [ForeignKey("VehicleId")]
    public Vehicle? Vehicle { get; set; }
}