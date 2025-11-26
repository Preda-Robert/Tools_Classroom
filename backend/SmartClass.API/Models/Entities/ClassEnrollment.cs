namespace SmartClass.API.Models.Entities;

public class ClassEnrollment
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public int StudentId { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Class Class { get; set; } = null!;
    public User Student { get; set; } = null!;
}