using WebApplication1.Models.Transport;

namespace WebApplication1.DTOs.Transport;

public class CreateTransportDto
{
    public required int JobId { get; set; }
    
    public required int VehicleId { get; set; }
    
    public required int DriverId { get; set; }

    public required DateOnly StartDate { get; set; }
    
    public required DateOnly EndDate { get; set; }
    
    public required int CargoMass { get; set; }
    
    public TransportStatus Status { get; set; }
}