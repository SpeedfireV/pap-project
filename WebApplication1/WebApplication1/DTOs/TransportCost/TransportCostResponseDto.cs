namespace WebApplication1.DTOs.TransportCost;

public class TransportCostResponseDto
{
    public int TransportCostId { get; set; }
    public int TransportId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime DateIncurred { get; set; }
    public string Category { get; set; } = string.Empty;
}