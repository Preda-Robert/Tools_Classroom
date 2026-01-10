namespace SmartClass.API.Models.DTOs;

public class SubmissionDto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int? Grade { get; set; }
    public string? Feedback { get; set; }
    public bool IsLate { get; set; }
}

public class CreateSubmissionDto
{
    public string Content { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public string? FileContent { get; set; } // Base64 encoded file
}

public class GradeSubmissionDto
{
    public int Grade { get; set; }
    public string? Feedback { get; set; }
}

public class AssignmentWithSubmissionDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int MaxPoints { get; set; }
    public DateTime CreatedAt { get; set; }
    public SubmissionDto? MySubmission { get; set; }
}