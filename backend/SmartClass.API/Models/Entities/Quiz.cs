namespace SmartClass.API.Models.Entities;

public class Quiz
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int TimeLimit { get; set; }
    public int MaxPoints { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Class Class { get; set; } = null!;
    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizSubmission> Submissions { get; set; } = new List<QuizSubmission>();
}