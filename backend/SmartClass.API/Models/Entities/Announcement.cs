namespace SmartClass.API.Models.Entities;

public class Announcement
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Class Class { get; set; } = null!;
    public User Creator { get; set; } = null!;
}