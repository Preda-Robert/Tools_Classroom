namespace SmartClass.API.Models.Entities;

public class QuizQuestion
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = string.Empty;
    public int CorrectAnswerIndex { get; set; }
    public int Points { get; set; }
    public int OrderIndex { get; set; }
    
    public Quiz Quiz { get; set; } = null!;
}