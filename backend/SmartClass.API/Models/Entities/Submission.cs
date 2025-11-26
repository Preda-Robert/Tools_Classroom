namespace SmartClass.API.Models.Entities;

public class Submission
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public int? Grade { get; set; }
    public string? Feedback { get; set; }
    
    // Navigation properties
    public Assignment Assignment { get; set; } = null!;
    public User Student { get; set; } = null!;
}