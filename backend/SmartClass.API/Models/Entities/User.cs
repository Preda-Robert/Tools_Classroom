namespace SmartClass.API.Models.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Class> ClassesTeaching { get; set; } = new List<Class>();
    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}

public enum UserRole
{
    Student = 0,
    Teacher = 1
}