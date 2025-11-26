namespace SmartClass.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using SmartClass.API.Models.DTOs.Auth;
using SmartClass.API.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        
        if (result == null)
            return BadRequest(new { message = "User already exists" });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        
        if (result == null)
            return Unauthorized(new { message = "Invalid credentials" });

        return Ok(result);
    }
}