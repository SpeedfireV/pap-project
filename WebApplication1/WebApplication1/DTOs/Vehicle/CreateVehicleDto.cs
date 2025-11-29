namespace WebApplication1.DTOs.Vehicle;

public class CreateVehicleDto
{
    public required string LicensePlate { set; get; }
    public required VehicleType Type { set; get; }
    public required int Capacity { set; get; }
    public required VehicleState State { set; get; }
}