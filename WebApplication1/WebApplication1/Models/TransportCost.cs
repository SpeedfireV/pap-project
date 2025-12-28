using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace WebApplication1;
public class TransportCost

{
    [Key]
    public int TransportCostId { get; set; }

    [Required]
    public int TransportId { get; set; }

    [ValidateNever]
    [ForeignKey("TransportId")]
    public Transport Transport { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Description { get; set; } = string.Empty; // e.g., "Fuel Refill", "Highway Tolls"

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "PLN"; // e.g., "PLN", "EUR"

    [Required]
    public DateTime DateIncurred { get; set; } = DateTime.UtcNow;

    public CostCategory Category { get; set; }
}

public enum CostCategory
{
    Fuel,
    Toll,
    Repair,
    DriverBonus,
    Other
}