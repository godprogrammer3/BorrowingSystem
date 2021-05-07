using BorrowingSystem.Database;
using BorrowingSystem.Jwt;
using BorrowingSystem.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
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
    }
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        private readonly IJwtAuthManager _jwtAuthManager;
        public UserService(ApplicationDbContext db, IJwtAuthManager jwtAuthManager)
        {
            _db = db;
            _jwtAuthManager = jwtAuthManager;
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

        public void EditProfile(string newFullName, string newEmail, string newPhoneNumber,string newProfilePicture ,string newPassword,string oldPassword,string accessToken)
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);
            var user = _db.User.FirstOrDefault(c => c.Email == principal.FindFirst(ClaimTypes.Email).Value);
            if (user!=null)
            {
                if (BCrypt.Net.BCrypt.Verify(oldPassword, user.Password))
                {
                    if (!String.IsNullOrEmpty(newFullName))
                    {
                        user.FullName = newFullName;
                    }
                    if (!String.IsNullOrEmpty(newEmail))
                    {
                        user.Email = newEmail;
                    }
                    if (!String.IsNullOrEmpty(newPhoneNumber))
                    {
                        user.PhoneNumber = newPhoneNumber;
                    }
                }
                else
                {
                    throw new Exception("InvalidCredential!");
                }
            }
            throw new Exception("Unauthoried!");
        }
    }
}
