namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Services;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyClasses()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Student";

        var classes = await _classService.GetUserClassesAsync(userId, role);
        return Ok(classes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClass(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var classDto = await _classService.GetClassByIdAsync(id, userId);

        if (classDto == null)
            return NotFound();

        return Ok(classDto);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var classDto = await _classService.CreateClassAsync(dto, teacherId);

        return CreatedAtAction(nameof(GetClass), new { id = classDto.Id }, classDto);
    }

    [Authorize(Roles = "Student")]
    [HttpPost("join")]
    public async Task<IActionResult> JoinClass([FromBody] JoinClassDto dto)
    {
        var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var success = await _classService.JoinClassAsync(dto.JoinCode, studentId);

        if (!success)
            return BadRequest(new { message = "Invalid join code or already enrolled" });

        return Ok(new { message = "Successfully joined class" });
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var success = await _classService.DeleteClassAsync(id, teacherId);

        if (!success)
            return NotFound();

        return NoContent();
    }
}