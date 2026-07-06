using Microsoft.AspNetCore.Mvc;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            // Simple demo credential check
            if (request.Username == "admin" && request.Password == "admin123")
            {
                return Ok(new AuthResult
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@example.com",
                    Role = "Admin",
                    Token = "demo-jwt-token-payload-goes-here"
                });
            }

            return Unauthorized(new { message = "Invalid username or password" });
        }
    }
}
