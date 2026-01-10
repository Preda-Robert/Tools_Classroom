namespace SmartClass.API.Models.Entities;

public class QuizSubmission
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    public int StudentId { get; set; }
    public string AnswersJson { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public int TimeSpent { get; set; }
    
    public Quiz Quiz { get; set; } = null!;
    public User Student { get; set; } = null!;
}