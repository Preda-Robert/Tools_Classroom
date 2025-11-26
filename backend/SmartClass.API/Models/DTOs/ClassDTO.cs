namespace SmartClass.API.Models.DTOs;

public class ClassDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateClassDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class JoinClassDto
{
    public string JoinCode { get; set; } = string.Empty;
}