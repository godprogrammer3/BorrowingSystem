using BorrowingSystem.Database;
using BorrowingSystem.Jwt;
using BorrowingSystem.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace BorrowingSystem.Services
{
    public interface IUserService
    {
        void RegisterUser(string email, string password , string fullName);
        User Login(string email, string password);
        void EditProfile(string newFullName, string newEmail, string newPhoneNumber, string newProfilePicture, string newPassword, string oldPassword, string accessToken);
        IEnumerable<User> GetAllBannedUser();
        IEnumerable<User> GetAllNormalUser();
        void BanUser(int id);
        void UnBanUser(int id);
        User GetUserById(int id);
    }
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ILogger<UserService> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public UserService(ApplicationDbContext db, IJwtAuthManager jwtAuthManager, ILogger<UserService> logger, IWebHostEnvironment webHostEnvironment)
        {
            _db = db;
            _jwtAuthManager = jwtAuthManager;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }


        public void RegisterUser(string email, string password, string fullName)
        {
            User user = new() { Email = email, FullName = fullName, Password = BCrypt.Net.BCrypt.HashPassword(password), Role = User.UserRole.user};
            _db.User.Add(user);
            _db.SaveChanges();
        }

        public User Login(string email, String password)
        {
            var user = _db.User
            .FirstOrDefault(u => u.Email == email);

            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return user;
            }
            else
            {
                return null;
            }
        }

        public void EditProfile(string newFullName, string newEmail, string newPhoneNumber,string newProfileImage, string newPassword,string oldPassword,string accessToken)
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);
            var user = _db.User.Find(int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value));
            if (user!=null)
            {
                if (BCrypt.Net.BCrypt.Verify(oldPassword, user.Password))
                {
                    if (!String.IsNullOrEmpty(newFullName))
                    {
                        user.FullName = newFullName;
                        _logger.LogInformation($"User[{user.FullName}] full name.");
                    }
                    if (!String.IsNullOrEmpty(newEmail))
                    {
                        user.Email = newEmail;
                        _logger.LogInformation($"User[{user.FullName}] changed email.");
                    }
                    if (!String.IsNullOrEmpty(newPhoneNumber))
                    {
                        user.PhoneNumber = newPhoneNumber;
                        _logger.LogInformation($"User[{user.FullName}] changed phone number.");
                    }
                    if (!String.IsNullOrEmpty(newPassword))
                    {
                        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
                        _logger.LogInformation($"User[{user.FullName}] changed password.");
                    }
                    if (!String.IsNullOrEmpty(newProfileImage))
                    {     
                        var base64String = newProfileImage.Split(",")[1];
                        if (!String.IsNullOrEmpty(newPassword))
                        {
                            throw new Exception("Bad format of profile image!");
                        }
                        //_logger.LogInformation(newProfileImage);
                        //_logger.LogInformation(base64String);
                        byte[] bytes = Convert.FromBase64String(base64String);
                        using var image = Image.Load(bytes, out IImageFormat format);
                        var fileName = user.Email + '.'+format.FileExtensions.ElementAt(0);
                        var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, "img/"+ fileName);
                        //_logger.LogInformation(fullPath);
                        image.Save(fullPath);
                        _logger.LogInformation($"User[{user.FullName}] changed profile image.");
                        user.ProfileImage = user.Email + '.' + format.FileExtensions.ElementAt(0);
                    }
                    _db.User.Update(user);
                    _db.SaveChanges();
                    return;
                }
                else
                {
                    throw new Exception("InvalidCredential!");
                }
            }
            throw new Exception("Unauthoried!");
        }

        public IEnumerable<User> GetAllBannedUser()
        {
            return _db.User.Where(c => c.Status == User.UserStatus.banned);
        }

        public IEnumerable<User> GetAllNormalUser()
        {
            return _db.User.Where(c => c.Status == User.UserStatus.normal);
        }

        public void BanUser(int id)
        {
            User user = _db.User.Find(id);
            user.Status = User.UserStatus.banned;
            _db.User.Update(user);
            _db.SaveChanges();
            return;
        }

        public void UnBanUser(int id)
        {
            User user = _db.User.Find(id);
            user.Status = User.UserStatus.normal;
            _db.User.Update(user);
            _db.SaveChanges();
            return;
        }

        public User GetUserById(int id)
        {
            User user = _db.User.Find(id);
            if (user != null)
            {
                return user;
            }
            throw new Exception("Not Found user");
        }
    }
}
