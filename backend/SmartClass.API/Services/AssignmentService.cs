namespace SmartClass.API.Services;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Models.Entities;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(ApplicationDbContext context, ILogger<AssignmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<AssignmentDto>> GetClassAssignmentsAsync(int classId, int userId)
    {
        // Verify user has access to this class
        var hasAccess = await _context.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == userId) ||
                       await _context.ClassEnrollments.AnyAsync(e => e.ClassId == classId && e.StudentId == userId);

        if (!hasAccess)
            return Enumerable.Empty<AssignmentDto>();

        return await _context.Assignments
            .Where(a => a.ClassId == classId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AssignmentDto
            {
                Id = a.Id,
                ClassId = a.ClassId,
                Title = a.Title,
                Description = a.Description,
                DueDate = a.DueDate,
                MaxPoints = a.MaxPoints,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AssignmentDto?> GetAssignmentByIdAsync(int assignmentId, int userId)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Class)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return null;

        // Check access
        var hasAccess = assignment.Class.TeacherId == userId ||
                       await _context.ClassEnrollments.AnyAsync(e => e.ClassId == assignment.ClassId && e.StudentId == userId);

        if (!hasAccess)
            return null;

        return new AssignmentDto
        {
            Id = assignment.Id,
            ClassId = assignment.ClassId,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            MaxPoints = assignment.MaxPoints,
            CreatedAt = assignment.CreatedAt
        };
    }

    public async Task<AssignmentDto?> CreateAssignmentAsync(CreateAssignmentDto dto, int classId, int teacherId)
    {
        // Verify teacher owns this class
        var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);
        if (classEntity == null)
            return null;

        var assignment = new Assignment
        {
            ClassId = classId,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            MaxPoints = dto.MaxPoints
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return new AssignmentDto
        {
            Id = assignment.Id,
            ClassId = assignment.ClassId,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            MaxPoints = assignment.MaxPoints,
            CreatedAt = assignment.CreatedAt
        };
    }

    public async Task<bool> DeleteAssignmentAsync(int assignmentId, int teacherId)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Class)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null || assignment.Class.TeacherId != teacherId)
            return false;

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return true;
    }
}