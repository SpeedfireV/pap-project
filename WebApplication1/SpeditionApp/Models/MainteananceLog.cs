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
    public string ServiceType { get; set; }

    public int OdometerReading { get; set; }

    [StringLength(1000)]
    public string Description { get; set; }

    public float Cost { get; set; }

    public DateTime ServiceDate { get; set; }

    public DateTime? NextServiceDue { get; set; }

    [ValidateNever]
    [ForeignKey("VehicleId")]
    public Vehicle? Vehicle { get; set; }
}