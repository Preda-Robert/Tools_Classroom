namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs;

public interface ISubmissionService
{
    Task<SubmissionDto?> GetMySubmissionAsync(int assignmentId, int studentId);
    Task<IEnumerable<SubmissionDto>> GetAssignmentSubmissionsAsync(int assignmentId, int teacherId);
    Task<SubmissionDto?> SubmitAssignmentAsync(CreateSubmissionDto dto, int assignmentId, int studentId);
    Task<SubmissionDto?> GradeSubmissionAsync(int submissionId, GradeSubmissionDto dto, int teacherId);
}