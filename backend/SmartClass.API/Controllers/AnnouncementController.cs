namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Services;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/classes/{classId}/announcements")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;
    private readonly ILogger<AnnouncementsController> _logger;

    public AnnouncementsController(IAnnouncementService announcementService, ILogger<AnnouncementsController> logger)
    {
        _announcementService = announcementService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetClassAnnouncements(int classId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Getting announcements for class {ClassId} by user {UserId}", classId, userId);

        var announcements = await _announcementService.GetClassAnnouncementsAsync(classId, userId);
        return Ok(announcements);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement(int classId, [FromBody] CreateAnnouncementDto dto)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        _logger.LogInformation("Creating announcement in class {ClassId} by teacher {TeacherId}", classId, teacherId);

        var announcement = await _announcementService.CreateAnnouncementAsync(dto, classId, teacherId);
        if (announcement == null)
            return NotFound(new { message = "Class not found or unauthorized" });

        return Ok(announcement);
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAnnouncement(int classId, int id)
    {
        var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var success = await _announcementService.DeleteAnnouncementAsync(id, teacherId);
        if (!success)
            return NotFound();

        return NoContent();
    }
}