namespace SmartClass.API.Models.DTOs;

public class AssignmentDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int MaxPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int MaxPoints { get; set; } = 100;
}