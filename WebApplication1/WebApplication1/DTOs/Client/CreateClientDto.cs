namespace WebApplication1.DTOs.Client;

public class CreateClientDto
{
    public required string Name { set; get; }
    public required int Nip { set; get; }
    public required string Address { set; get; }
    public required int Phone { set; get; }
}