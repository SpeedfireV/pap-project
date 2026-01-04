namespace WebApplication1.DTOs.Driver;

public class CreateDriverDto
{
    public required string Name { set; get; }
    public required string Surname { set; get; }
    public required int LicenseNumber { set; get; }
    public required int Phone { set; get; }
    public required DriverStatus Status { set; get; }
}