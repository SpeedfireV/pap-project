namespace WebApplication1.DTOs.Error;

public class CreateErrorDto
{
    public required string TicketName { set; get; }
    public required string TicketDescription { set; get; }
}