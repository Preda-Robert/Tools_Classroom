namespace SmartClass.API.Services;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Data;
using SmartClass.API.Models.DTOs;
using SmartClass.API.Models.Entities;

public class AnnouncementService : IAnnouncementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AnnouncementService> _logger;

    public AnnouncementService(ApplicationDbContext context, ILogger<AnnouncementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<AnnouncementDto>> GetClassAnnouncementsAsync(int classId, int userId)
    {
        var hasAccess = await _context.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == userId) ||
                       await _context.ClassEnrollments.AnyAsync(e => e.ClassId == classId && e.StudentId == userId);

        if (!hasAccess)
            return Enumerable.Empty<AnnouncementDto>();

        return await _context.Announcements
            .Where(a => a.ClassId == classId)
            .Include(a => a.Creator)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto
            {
                Id = a.Id,
                ClassId = a.ClassId,
                Title = a.Title,
                Content = a.Content,
                CreatedBy = a.CreatedBy,
                CreatorName = $"{a.Creator.FirstName} {a.Creator.LastName}",
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AnnouncementDto?> CreateAnnouncementAsync(CreateAnnouncementDto dto, int classId, int teacherId)
    {
        var classEntity = await _context.Classes
            .Include(c => c.Teacher)
            .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);
            
        if (classEntity == null)
            return null;

        var announcement = new Announcement
        {
            ClassId = classId,
            Title = dto.Title,
            Content = dto.Content,
            CreatedBy = teacherId
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return new AnnouncementDto
        {
            Id = announcement.Id,
            ClassId = announcement.ClassId,
            Title = announcement.Title,
            Content = announcement.Content,
            CreatedBy = announcement.CreatedBy,
            CreatorName = $"{classEntity.Teacher.FirstName} {classEntity.Teacher.LastName}",
            CreatedAt = announcement.CreatedAt
        };
    }

    public async Task<bool> DeleteAnnouncementAsync(int announcementId, int teacherId)
    {
        var announcement = await _context.Announcements
            .Include(a => a.Class)
            .FirstOrDefaultAsync(a => a.Id == announcementId);

        if (announcement == null || announcement.Class.TeacherId != teacherId)
            return false;

        _context.Announcements.Remove(announcement);
        await _context.SaveChangesAsync();

        return true;
    }
}