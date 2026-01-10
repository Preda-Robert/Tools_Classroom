namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs;

public interface IQuizService
{
    Task<IEnumerable<QuizDto>> GetClassQuizzesAsync(int classId, int userId);
    Task<QuizDto?> GetQuizByIdAsync(int quizId, int userId);
    Task<QuizDto?> CreateQuizAsync(CreateQuizDto dto, int classId, int teacherId);
    Task<bool> DeleteQuizAsync(int quizId, int teacherId);
}