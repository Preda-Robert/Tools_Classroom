namespace SmartClass.API.Models.Entities;

public class Class
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public int TeacherId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public User Teacher { get; set; } = null!;
    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
}