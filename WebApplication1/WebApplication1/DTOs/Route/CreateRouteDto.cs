namespace WebApplication1.DTOs.Route;

public class CreateRouteDto
{
    public required string StartPoint { get; set; }
    
    public required string EndPoint { get; set; }
    
    public required int Distance { get; set; }
    
    public required TimeSpan EstimatedTime { get; set; }
}