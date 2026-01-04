using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs.TransportCost;

public class CreateTransportCostDto
{
    [Required]
    public int TransportId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string Currency { get; set; } = "PLN";

    public DateTime DateIncurred { get; set; } = DateTime.UtcNow;

    [Required]
    public CostCategory Category { get; set; }
}