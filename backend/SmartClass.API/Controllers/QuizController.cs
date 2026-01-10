namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Services;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/classes/{classId}/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly ILogger<QuizzesController> _logger;

    public QuizzesController(IQuizService quizService, ILogger<QuizzesController> logger)
    {
        _quizService = quizService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetClassQuizzes(int classId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Getting quizzes for class {ClassId} by user {UserId}", classId, userId);

        var quizzes = await _quizService.GetClassQuizzesAsync(classId, userId);
        return Ok(quizzes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuiz(int classId, int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var quiz = await _quizService.GetQuizByIdAsync(id, userId);
        if (quiz == null)
            return NotFound();

        return Ok(quiz);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateQuiz(int classId, [FromBody] CreateQuizDto dto)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Creating quiz in class {ClassId} by teacher {TeacherId}", classId, teacherId);

        var quiz = await _quizService.CreateQuizAsync(dto, classId, teacherId);
        if (quiz == null)
            return NotFound(new { message = "Class not found or unauthorized" });

        return CreatedAtAction(nameof(GetQuiz), new { classId, id = quiz.Id }, quiz);
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuiz(int classId, int id)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var success = await _quizService.DeleteQuizAsync(id, teacherId);
        if (!success)
            return NotFound();

        return NoContent();
    }
}