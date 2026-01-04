using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace WebApplication1;

public class StatusHistory
{
    [Key]
    public int StatusHistoryId { get; set; }

    [Required]
    public int JobId { get; set; }

    [ValidateNever]
    [ForeignKey("JobId")]
    public Job Job { get; set; } = null!;

    [Required]
    public int UserId { get; set; }

    [ValidateNever]
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [Required]
    public JobStatus OldStatus { get; set; }

    [Required]
    public JobStatus NewStatus { get; set; }

    [Required]
    public DateTime ChangeDate { get; set; } = DateTime.UtcNow;
}