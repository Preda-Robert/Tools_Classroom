namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Services;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/assignments/{assignmentId}/submissions")]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;
    private readonly ILogger<SubmissionsController> _logger;

    public SubmissionsController(ISubmissionService submissionService, ILogger<SubmissionsController> logger)
    {
        _submissionService = submissionService;
        _logger = logger;
    }

    [Authorize(Roles = "Student")]
    [HttpGet("my-submission")]
    public async Task<IActionResult> GetMySubmission(int assignmentId)
    {
        var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Getting submission for assignment {AssignmentId} by student {StudentId}", assignmentId, studentId);

        var submission = await _submissionService.GetMySubmissionAsync(assignmentId, studentId);
        
        if (submission == null)
            return NotFound(new { message = "No submission found" });

        return Ok(submission);
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet]
    public async Task<IActionResult> GetAssignmentSubmissions(int assignmentId)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Getting submissions for assignment {AssignmentId} by teacher {TeacherId}", assignmentId, teacherId);

        var submissions = await _submissionService.GetAssignmentSubmissionsAsync(assignmentId, teacherId);
        return Ok(submissions);
    }

    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> SubmitAssignment(int assignmentId, [FromBody] CreateSubmissionDto dto)
    {
        var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Student {StudentId} submitting assignment {AssignmentId}", studentId, assignmentId);

        var submission = await _submissionService.SubmitAssignmentAsync(dto, assignmentId, studentId);
        
        if (submission == null)
            return NotFound(new { message = "Assignment not found or unauthorized" });

        return Ok(submission);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("{submissionId}/grade")]
    public async Task<IActionResult> GradeSubmission(int assignmentId, int submissionId, [FromBody] GradeSubmissionDto dto)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Teacher {TeacherId} grading submission {SubmissionId}", teacherId, submissionId);

        var submission = await _submissionService.GradeSubmissionAsync(submissionId, dto, teacherId);
        
        if (submission == null)
            return NotFound(new { message = "Submission not found or unauthorized" });

        return Ok(submission);
    }
}