namespace SmartClass.API.Services;

using SmartClass.API.Models.DTOs.Auth;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}