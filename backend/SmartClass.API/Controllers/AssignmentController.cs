namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Services;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/classes/{classId}/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ILogger<AssignmentsController> _logger;

    public AssignmentsController(IAssignmentService assignmentService, ILogger<AssignmentsController> logger)
    {
        _assignmentService = assignmentService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetClassAssignments(int classId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Getting assignments for class {ClassId} by user {UserId}", classId, userId);

        var assignments = await _assignmentService.GetClassAssignmentsAsync(classId, userId);
        return Ok(assignments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignment(int classId, int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var assignment = await _assignmentService.GetAssignmentByIdAsync(id, userId);
        if (assignment == null)
            return NotFound();

        return Ok(assignment);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateAssignment(int classId, [FromBody] CreateAssignmentDto dto)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Creating assignment in class {ClassId} by teacher {TeacherId}", classId, teacherId);

        var assignment = await _assignmentService.CreateAssignmentAsync(dto, classId, teacherId);
        if (assignment == null)
            return NotFound(new { message = "Class not found or unauthorized" });

        return CreatedAtAction(nameof(GetAssignment), new { classId, id = assignment.Id }, assignment);
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int classId, int id)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var success = await _assignmentService.DeleteAssignmentAsync(id, teacherId);
        if (!success)
            return NotFound();

        return NoContent();
    }
}