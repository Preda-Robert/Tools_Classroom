namespace SmartClass.API.Services;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Models.Entities;

public class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;

    public ClassService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClassDto>> GetUserClassesAsync(int userId, string role)
    {
        if (role == "Teacher")
        {
            return await _context.Classes
                .Where(c => c.TeacherId == userId && c.IsActive)
                .Select(c => new ClassDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    JoinCode = c.JoinCode,
                    TeacherName = $"{c.Teacher.FirstName} {c.Teacher.LastName}",
                    StudentCount = c.Enrollments.Count,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }
        else
        {
            return await _context.ClassEnrollments
                .Where(e => e.StudentId == userId)
                .Select(e => new ClassDto
                {
                    Id = e.Class.Id,
                    Name = e.Class.Name,
                    Description = e.Class.Description,
                    JoinCode = e.Class.JoinCode,
                    TeacherName = $"{e.Class.Teacher.FirstName} {e.Class.Teacher.LastName}",
                    StudentCount = e.Class.Enrollments.Count,
                    CreatedAt = e.Class.CreatedAt
                })
                .ToListAsync();
        }
    }

    public async Task<ClassDto?> GetClassByIdAsync(int classId, int userId)
    {
        var classEntity = await _context.Classes
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (classEntity == null) return null;

        // Check authorization
        var isTeacher = classEntity.TeacherId == userId;
        var isEnrolled = await _context.ClassEnrollments
            .AnyAsync(e => e.ClassId == classId && e.StudentId == userId);

        if (!isTeacher && !isEnrolled) return null;

        return new ClassDto
        {
            Id = classEntity.Id,
            Name = classEntity.Name,
            Description = classEntity.Description,
            JoinCode = classEntity.JoinCode,
            TeacherName = $"{classEntity.Teacher.FirstName} {classEntity.Teacher.LastName}",
            StudentCount = classEntity.Enrollments.Count,
            CreatedAt = classEntity.CreatedAt
        };
    }

    public async Task<ClassDto?> CreateClassAsync(CreateClassDto dto, int teacherId)
    {
        var joinCode = GenerateJoinCode();

        var classEntity = new Class
        {
            Name = dto.Name,
            Description = dto.Description,
            JoinCode = joinCode,
            TeacherId = teacherId
        };

        _context.Classes.Add(classEntity);
        await _context.SaveChangesAsync();

        var teacher = await _context.Users.FindAsync(teacherId);

        return new ClassDto
        {
            Id = classEntity.Id,
            Name = classEntity.Name,
            Description = classEntity.Description,
            JoinCode = classEntity.JoinCode,
            TeacherName = $"{teacher.FirstName} {teacher.LastName}",
            StudentCount = 0,
            CreatedAt = classEntity.CreatedAt
        };
    }

    public async Task<bool> JoinClassAsync(string joinCode, int studentId)
    {
        var classEntity = await _context.Classes
            .FirstOrDefaultAsync(c => c.JoinCode == joinCode && c.IsActive);

        if (classEntity == null) return false;

        // Check if already enrolled
        var alreadyEnrolled = await _context.ClassEnrollments
            .AnyAsync(e => e.ClassId == classEntity.Id && e.StudentId == studentId);

        if (alreadyEnrolled) return false;

        var enrollment = new ClassEnrollment
        {
            ClassId = classEntity.Id,
            StudentId = studentId
        };

        _context.ClassEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteClassAsync(int classId, int teacherId)
    {
        var classEntity = await _context.Classes
            .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

        if (classEntity == null) return false;

        classEntity.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    private string GenerateJoinCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}