using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Client
{
    [Key]
    public int ClientId { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public int Nip { get; set; }
    
    [Required]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    [Phone]
    public int Phone { get; set; }
}