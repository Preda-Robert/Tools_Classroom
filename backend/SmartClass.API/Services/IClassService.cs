namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs;

public interface IClassService
{
    Task<IEnumerable<ClassDto>> GetUserClassesAsync(int userId, string role);
    Task<ClassDto?> GetClassByIdAsync(int classId, int userId);
    Task<ClassDto?> CreateClassAsync(CreateClassDto dto, int teacherId);
    Task<bool> JoinClassAsync(string joinCode, int studentId);
    Task<bool> DeleteClassAsync(int classId, int teacherId);
}