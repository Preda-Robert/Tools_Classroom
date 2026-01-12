namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.Entities;
using System.Security.Claims;
using System.Text.Json;

[Authorize]
[ApiController]
[Route("api/classes/{classId}/quizzes/{quizId}")]
public class QuizSubmissionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<QuizSubmissionController> _logger;

    public QuizSubmissionController(ApplicationDbContext context, ILogger<QuizSubmissionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [Authorize(Roles = "Student")]
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz(int classId, int quizId, [FromBody] SubmitQuizDto dto)
    {
        var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Student {StudentId} submitting quiz {QuizId}", studentId, quizId);

        // Verify student has access to this quiz
        var quiz = await _context.Quizzes
            .Include(q => q.Class)
                .ThenInclude(c => c.Enrollments)
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == quizId && q.ClassId == classId);

        if (quiz == null)
            return NotFound(new { message = "Quiz not found" });

        var isEnrolled = quiz.Class.Enrollments.Any(e => e.StudentId == studentId);
        if (!isEnrolled)
            return Unauthorized(new { message = "Not enrolled in this class" });

        // Check if already submitted
        var existingSubmission = await _context.QuizSubmissions
            .FirstOrDefaultAsync(s => s.QuizId == quizId && s.StudentId == studentId);

        if (existingSubmission != null)
            return BadRequest(new { message = "Quiz already submitted" });

        // Calculate score
        var answers = dto.Answers;
        var score = 0;
        for (int i = 0; i < answers.Count && i < quiz.Questions.Count; i++)
        {
            var question = quiz.Questions.OrderBy(q => q.OrderIndex).ElementAt(i);
            if (answers[i] == question.CorrectAnswerIndex)
            {
                score += question.Points;
            }
        }

        var submission = new QuizSubmission
        {
            QuizId = quizId,
            StudentId = studentId,
            AnswersJson = JsonSerializer.Serialize(answers),
            Score = score,
            TimeSpent = dto.TimeSpent,
            SubmittedAt = DateTime.UtcNow
        };

        _context.QuizSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = submission.Id,
            quizId = submission.QuizId,
            studentId = submission.StudentId,
            answersJson = submission.AnswersJson,
            score = submission.Score,
            submittedAt = submission.SubmittedAt,
            timeSpent = submission.TimeSpent
        });
    }

    [Authorize(Roles = "Student")]
    [HttpGet("my-submission")]
    public async Task<IActionResult> GetMySubmission(int classId, int quizId)
    {
        var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var submission = await _context.QuizSubmissions
            .Include(s => s.Student)
            .Include(s => s.Quiz)
            .FirstOrDefaultAsync(s => s.QuizId == quizId && s.StudentId == studentId);

        if (submission == null)
            return NotFound(new { message = "No submission found" });

        return Ok(new
        {
            id = submission.Id,
            quizId = submission.QuizId,
            studentId = submission.StudentId,
            studentName = $"{submission.Student.FirstName} {submission.Student.LastName}",
            answersJson = submission.AnswersJson,
            score = submission.Score,
            submittedAt = submission.SubmittedAt,
            timeSpent = submission.TimeSpent
        });
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("submissions")]
    public async Task<IActionResult> GetQuizSubmissions(int classId, int quizId)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Verify teacher owns this quiz's class
        var quiz = await _context.Quizzes
            .Include(q => q.Class)
            .FirstOrDefaultAsync(q => q.Id == quizId && q.ClassId == classId);

        if (quiz == null || quiz.Class.TeacherId != teacherId)
            return NotFound(new { message = "Quiz not found or unauthorized" });

        var submissions = await _context.QuizSubmissions
            .Include(s => s.Student)
            .Where(s => s.QuizId == quizId)
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.TimeSpent)
            .ToListAsync();

        return Ok(submissions.Select(s => new
        {
            id = s.Id,
            quizId = s.QuizId,
            studentId = s.StudentId,
            studentName = $"{s.Student.FirstName} {s.Student.LastName}",
            answersJson = s.AnswersJson,
            score = s.Score,
            submittedAt = s.SubmittedAt,
            timeSpent = s.TimeSpent
        }));
    }
}

public class SubmitQuizDto
{
    public List<int> Answers { get; set; } = new();
    public int TimeSpent { get; set; }
}