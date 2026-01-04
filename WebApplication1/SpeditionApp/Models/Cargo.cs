using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class Cargo
{
    [Key]
    public int CargoId { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public int TransportId { get; set; }
    
    [ValidateNever]
    [ForeignKey("TransportId")]
    public Transport? Transport { get; set; }
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public int Amount { get; set; }
}