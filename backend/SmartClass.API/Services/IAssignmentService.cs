namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs;

public interface IAssignmentService
{
    Task<IEnumerable<AssignmentDto>> GetClassAssignmentsAsync(int classId, int userId);
    Task<AssignmentDto?> GetAssignmentByIdAsync(int assignmentId, int userId);
    Task<AssignmentDto?> CreateAssignmentAsync(CreateAssignmentDto dto, int classId, int teacherId);
    Task<bool> DeleteAssignmentAsync(int assignmentId, int teacherId);
}