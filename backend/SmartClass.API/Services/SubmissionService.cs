namespace SmartClass.API.Services;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Models.Entities;

public class SubmissionService : ISubmissionService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SubmissionService> _logger;
    private readonly IWebHostEnvironment _environment;

    public SubmissionService(
        ApplicationDbContext context, 
        ILogger<SubmissionService> logger,
        IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _environment = environment;
    }

    public async Task<SubmissionDto?> GetMySubmissionAsync(int assignmentId, int studentId)
    {
        var submission = await _context.Submissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

        if (submission == null)
            return null;

        return new SubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentId = submission.StudentId,
            StudentName = $"{submission.Student.FirstName} {submission.Student.LastName}",
            Content = submission.Content,
            FilePath = submission.FilePath,
            SubmittedAt = submission.SubmittedAt,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            IsLate = submission.SubmittedAt > submission.Assignment.DueDate
        };
    }

    public async Task<IEnumerable<SubmissionDto>> GetAssignmentSubmissionsAsync(int assignmentId, int teacherId)
    {
        // Verify teacher owns this assignment's class
        var assignment = await _context.Assignments
            .Include(a => a.Class)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null || assignment.Class.TeacherId != teacherId)
            return Enumerable.Empty<SubmissionDto>();

        var submissions = await _context.Submissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        return submissions.Select(s => new SubmissionDto
        {
            Id = s.Id,
            AssignmentId = s.AssignmentId,
            StudentId = s.StudentId,
            StudentName = $"{s.Student.FirstName} {s.Student.LastName}",
            Content = s.Content,
            FilePath = s.FilePath,
            SubmittedAt = s.SubmittedAt,
            Grade = s.Grade,
            Feedback = s.Feedback,
            IsLate = s.SubmittedAt > s.Assignment.DueDate
        });
    }

    public async Task<SubmissionDto?> SubmitAssignmentAsync(CreateSubmissionDto dto, int assignmentId, int studentId)
    {
        // Verify student has access to this assignment
        var assignment = await _context.Assignments
            .Include(a => a.Class)
            .ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return null;

        var isEnrolled = assignment.Class.Enrollments.Any(e => e.StudentId == studentId);
        if (!isEnrolled)
            return null;

        // Check if submission already exists
        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

        string? filePath = null;
        if (!string.IsNullOrEmpty(dto.FileContent) && !string.IsNullOrEmpty(dto.FileName))
        {
            filePath = await SaveFileAsync(dto.FileName, dto.FileContent, studentId, assignmentId);
        }

        if (existingSubmission != null)
        {
            // Update existing submission
            existingSubmission.Content = dto.Content;
            if (filePath != null)
                existingSubmission.FilePath = filePath;
            existingSubmission.SubmittedAt = DateTime.UtcNow;
            existingSubmission.Grade = null; // Reset grade on resubmission
            existingSubmission.Feedback = null;
        }
        else
        {
            // Create new submission
            existingSubmission = new Submission
            {
                AssignmentId = assignmentId,
                StudentId = studentId,
                Content = dto.Content,
                FilePath = filePath,
                SubmittedAt = DateTime.UtcNow
            };
            _context.Submissions.Add(existingSubmission);
        }

        await _context.SaveChangesAsync();

        var student = await _context.Users.FindAsync(studentId);
        
        return new SubmissionDto
        {
            Id = existingSubmission.Id,
            AssignmentId = existingSubmission.AssignmentId,
            StudentId = existingSubmission.StudentId,
            StudentName = $"{student?.FirstName} {student?.LastName}",
            Content = existingSubmission.Content,
            FilePath = existingSubmission.FilePath,
            SubmittedAt = existingSubmission.SubmittedAt,
            Grade = existingSubmission.Grade,
            Feedback = existingSubmission.Feedback,
            IsLate = existingSubmission.SubmittedAt > assignment.DueDate
        };
    }

    public async Task<SubmissionDto?> GradeSubmissionAsync(int submissionId, GradeSubmissionDto dto, int teacherId)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Class)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null || submission.Assignment.Class.TeacherId != teacherId)
            return null;

        submission.Grade = dto.Grade;
        submission.Feedback = dto.Feedback;

        await _context.SaveChangesAsync();

        return new SubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentId = submission.StudentId,
            StudentName = $"{submission.Student.FirstName} {submission.Student.LastName}",
            Content = submission.Content,
            FilePath = submission.FilePath,
            SubmittedAt = submission.SubmittedAt,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            IsLate = submission.SubmittedAt > submission.Assignment.DueDate
        };
    }

    private async Task<string> SaveFileAsync(string fileName, string base64Content, int studentId, int assignmentId)
    {
        try
        {
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "submissions");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{studentId}_{assignmentId}_{DateTime.UtcNow.Ticks}_{fileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            var fileBytes = Convert.FromBase64String(base64Content);
            await File.WriteAllBytesAsync(filePath, fileBytes);

            return uniqueFileName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file {FileName}", fileName);
            throw;
        }
    }
}