using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Error
{
    [Key]
    public int ErrorId { get; set; }
    [Required]
    [Phone]
    public string TicketName { get; set; }
    [Required]
    public string Description { get; set; }
}