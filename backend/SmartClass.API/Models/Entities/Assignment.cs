namespace SmartClass.API.Models.Entities;

public class Assignment
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int MaxPoints { get; set; } = 100;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Class Class { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}