namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs;

public interface IAnnouncementService
{
    Task<IEnumerable<AnnouncementDto>> GetClassAnnouncementsAsync(int classId, int userId);
    Task<AnnouncementDto?> CreateAnnouncementAsync(CreateAnnouncementDto dto, int classId, int teacherId);
    Task<bool> DeleteAnnouncementAsync(int announcementId, int teacherId);
}