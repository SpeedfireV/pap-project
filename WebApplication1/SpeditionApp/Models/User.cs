using System.ComponentModel.DataAnnotations;

namespace WebApplication1;

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required]
    public string ExternalId { get; set; } = string.Empty; // This stores the Google 'sub' claim

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? FullName { get; set; }

    [Required]
    public UserRole Role { get; set; } = UserRole.Dispatcher; // Use the Enum here
}

public enum UserRole
{
    Admin,
    Dispatcher,
    Driver
}