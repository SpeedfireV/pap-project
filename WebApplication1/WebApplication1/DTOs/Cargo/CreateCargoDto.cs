namespace WebApplication1.DTOs.Cargo;

public class CreateCargoDto
{
    public required int TransportId { get; set; }
    public required string Name { set; get; }
    public required string Description { set; get; }
    public required int Amount { set; get; }
}