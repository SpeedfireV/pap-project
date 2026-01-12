using System.ComponentModel.DataAnnotations;

namespace WebApplication1;

public class Error
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Description { get; set; }

    public DateTime TicketDate { get; set; } = DateTime.UtcNow;
}