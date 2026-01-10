// backend/SmartClass.API/Services/QuizService.cs
namespace SmartClass.API.Services;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Models.Entities;
using System.Text.Json;

public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<QuizService> _logger;

    public QuizService(ApplicationDbContext context, ILogger<QuizService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<QuizDto>> GetClassQuizzesAsync(int classId, int userId)
    {
        var hasAccess = await _context.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == userId) ||
                       await _context.ClassEnrollments.AnyAsync(e => e.ClassId == classId && e.StudentId == userId);

        if (!hasAccess)
            return Enumerable.Empty<QuizDto>();

        var quizzes = await _context.Quizzes
            .Where(q => q.ClassId == classId)
            .Include(q => q.Questions)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        return quizzes.Select(q => new QuizDto
        {
            Id = q.Id,
            ClassId = q.ClassId,
            Title = q.Title,
            Description = q.Description,
            DueDate = q.DueDate,
            TimeLimit = q.TimeLimit,
            MaxPoints = q.MaxPoints,
            CreatedAt = q.CreatedAt,
            Questions = q.Questions.OrderBy(qq => qq.OrderIndex).Select(qq => new QuizQuestionDto
            {
                Id = qq.Id,
                QuestionText = qq.QuestionText,
                Options = JsonSerializer.Deserialize<List<string>>(qq.OptionsJson) ?? new List<string>(),
                CorrectAnswerIndex = qq.CorrectAnswerIndex,
                Points = qq.Points
            }).ToList()
        }).ToList();
    }

    public async Task<QuizDto?> GetQuizByIdAsync(int quizId, int userId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Class)
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null)
            return null;

        var hasAccess = quiz.Class.TeacherId == userId ||
                       await _context.ClassEnrollments.AnyAsync(e => e.ClassId == quiz.ClassId && e.StudentId == userId);

        if (!hasAccess)
            return null;

        return new QuizDto
        {
            Id = quiz.Id,
            ClassId = quiz.ClassId,
            Title = quiz.Title,
            Description = quiz.Description,
            DueDate = quiz.DueDate,
            TimeLimit = quiz.TimeLimit,
            MaxPoints = quiz.MaxPoints,
            CreatedAt = quiz.CreatedAt,
            Questions = quiz.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuizQuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                Options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>(),
                CorrectAnswerIndex = q.CorrectAnswerIndex,
                Points = q.Points
            }).ToList()
        };
    }

    public async Task<QuizDto?> CreateQuizAsync(CreateQuizDto dto, int classId, int teacherId)
    {
        var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);
        if (classEntity == null)
            return null;

        var maxPoints = dto.Questions.Sum(q => q.Points);

        var quiz = new Quiz
        {
            ClassId = classId,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            TimeLimit = dto.TimeLimit,
            MaxPoints = maxPoints
        };

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        var questions = dto.Questions.Select((q, index) => new QuizQuestion
        {
            QuizId = quiz.Id,
            QuestionText = q.QuestionText,
            OptionsJson = JsonSerializer.Serialize(q.Options),
            CorrectAnswerIndex = q.CorrectAnswerIndex,
            Points = q.Points,
            OrderIndex = index
        }).ToList();

        _context.QuizQuestions.AddRange(questions);
        await _context.SaveChangesAsync();

        return new QuizDto
        {
            Id = quiz.Id,
            ClassId = quiz.ClassId,
            Title = quiz.Title,
            Description = quiz.Description,
            DueDate = quiz.DueDate,
            TimeLimit = quiz.TimeLimit,
            MaxPoints = quiz.MaxPoints,
            CreatedAt = quiz.CreatedAt,
            Questions = questions.Select(q => new QuizQuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                Options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>(),
                CorrectAnswerIndex = q.CorrectAnswerIndex,
                Points = q.Points
            }).ToList()
        };
    }

    public async Task<bool> DeleteQuizAsync(int quizId, int teacherId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Class)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null || quiz.Class.TeacherId != teacherId)
            return false;

        _context.Quizzes.Remove(quiz);
        await _context.SaveChangesAsync();

        return true;
    }
}