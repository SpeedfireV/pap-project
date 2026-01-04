namespace WebApplication1.DTOs.Job;

public class CreateJobDto
{
    public required int ClientId { set; get; }
    public required DateOnly Date { set; get; }
    public required JobStatus Status { set; get; }
    public required string Remarks { set; get; }
}