using BorrowingSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using BorrowingSystem.Jwt;
using BorrowingSystem.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;

namespace BorrowingSystem.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class ApiUserController : ControllerBase
    {
        private readonly ILogger<ApiUserController> _logger;
        private readonly IUserService _userService;
        private readonly IJwtAuthManager _jwtAuthManager;
        public ApiUserController(ILogger<ApiUserController> logger, IUserService userService, IJwtAuthManager jwtAuthManager)
        {
            _logger = logger;
            _userService = userService;
            _jwtAuthManager = jwtAuthManager;
        }
        [AllowAnonymous]
        [HttpPost("register")]
        public ActionResult Register([FromBody] RegisterRequest request)
        {
            _logger.LogInformation($"Email:{request.Email},Password:{request.Password},FullName:{request.FullName}");
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            _userService.RegisterUser(request.Email, request.Password, request.FullName);
            _logger.LogInformation($"User [{request.FullName}] registered successfully.");
            return NoContent();

        }

        [AllowAnonymous]
        [HttpPost("login")]
        public ActionResult Login([FromBody] LoginRequest request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            User user = _userService.Login(request.Email, request.Password);
            if (user != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name,user.FullName),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(ClaimTypes.Email,user.Email),
                    new Claim(ClaimTypes.MobilePhone,user.PhoneNumber??""),
                    new Claim(ClaimTypes.NameIdentifier,user.Id.ToString())
                };
                var jwtResult = _jwtAuthManager.GenerateTokens(request.Email, claims, DateTime.Now);
                _logger.LogInformation($"User [{user.FullName}] logged in successfully.");
                return Ok(new LoginResult
                {
                    PhoneNumber = user.PhoneNumber,
                    ProfileImage = user.ProfileImage,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    AccessToken = jwtResult.AccessToken,
                    RefreshToken = jwtResult.RefreshToken.TokenString
                }); ;

            }
            return Forbid();
        }
        [HttpPost("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            string email = User.FindFirst(ClaimTypes.Email)?.Value;
            _jwtAuthManager.RemoveRefreshTokenByEmail(email);
            _logger.LogInformation($"User [{User.Identity?.Name}] logged out successfully.");
            return NoContent();
        }
        [HttpPost("refresh-token")]
        [Authorize]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var fullName = User.Identity?.Name;
                _logger.LogInformation($"User [{fullName}] is trying to refresh JWT token.");

                if (string.IsNullOrWhiteSpace(request.RefreshToken))
                {
                    return Unauthorized();
                }

                var accessToken = await HttpContext.GetTokenAsync("Bearer", "access_token");
                var jwtResult = _jwtAuthManager.Refresh(request.RefreshToken, accessToken, DateTime.Now);
                _logger.LogInformation($"User [{fullName}] has refreshed JWT token.");
                return Ok(new LoginResult
                {
                    FullName = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                    Email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                    Role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
                    AccessToken = jwtResult.AccessToken,
                    RefreshToken = jwtResult.RefreshToken.TokenString
                });
            }
            catch (SecurityTokenException e)
            {
                _logger.LogError(e.Message);
                return Unauthorized(e.Message);
            }
        }

        [HttpPost("edit-profile")]
        [Authorize]
        public async Task<ActionResult> EditProfile([FromBody] EditProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var accessToken = await HttpContext.GetTokenAsync("Bearer", "access_token");
            try
            {
                _userService.EditProfile(request.NewFullName, request.NewEmail, request.NewPhoneNumber, request.NewProfileImage, request.NewPassword, request.OldPassword, accessToken);
                return NoContent();
            }
            catch (Exception error)
            {
                if (error.Message == "Unauthoried!")
                {
                    return Unauthorized();
                }
                else if (error.Message == "InvalidCredential!")
                {
                    return Forbid();
                }
                else
                {
                    return BadRequest();
                }
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("get-all-banned-user")]
        public ActionResult GetAllBannedUser()
        {
            try
            {
                IEnumerable<User> users = _userService.GetAllBannedUser();
                return Ok(users);
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("get-all-normal-user")]
        public ActionResult GetAllNormalUser()
        {
            try
            {
                IEnumerable<User> users = _userService.GetAllNormalUser();
                return Ok(users);
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost("ban-user")]
        public ActionResult BanUser([FromBody] BanUserRequest request)
        {
            try
            {
               _userService.BanUser(request.Id);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost("un-ban-user")]
        public ActionResult UnBanUser([FromBody] UnBanUserRequest request)
        {
            try
            {
                _userService.UnBanUser(request.Id);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }

        public class RegisterRequest
        {
            [Required]
            [JsonPropertyName("email")]
            public string Email { get; set; }

            [Required]
            [JsonPropertyName("fullName")]
            public string FullName { get; set; }

            [Required]
            [JsonPropertyName("password")]
            public string Password { get; set; }
        }

        public class LoginRequest
        {
            [Required]
            [JsonPropertyName("email")]
            public string Email { get; set; }

            [Required]
            [JsonPropertyName("password")]
            public string Password { get; set; }
        }

        public class LoginResult
        {
            [JsonPropertyName("fullName")]
            public string FullName { get; set; }
            [JsonPropertyName("email")]
            public string Email { get; set; }
            [JsonPropertyName("role")]
            public string Role { get; set; }
            [JsonPropertyName("accessToken")]
            public string AccessToken { get; set; }
            [JsonPropertyName("refreshToken")]
            public string RefreshToken { get; set; }
            [JsonPropertyName("profileImage")]
            public string ProfileImage { get; set; }
            [JsonPropertyName("phoneNumber")]
            public string PhoneNumber { get; set; }

        }

        public class RefreshTokenRequest
        {
            [JsonPropertyName("refreshToken")]
            public string RefreshToken { get; set; }
        }

        public class EditProfileRequest
        {
            [Required]
            [JsonPropertyName("oldPassword")]
            public string OldPassword { get; set; }
            [JsonPropertyName("newPassword")]
            public string NewPassword { get; set; }
            [JsonPropertyName("newFullName")]
            public string NewFullName { get; set; }
            [JsonPropertyName("newEmail")]
            public string NewEmail { get; set; }
            [JsonPropertyName("newPhoneNumber")]
            public string NewPhoneNumber { get; set; }
            [JsonPropertyName("newProfileImage")]
            public string NewProfileImage { get; set; }

        }

        public class BanUserRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
        }

        public class UnBanUserRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
        }
    }
}
