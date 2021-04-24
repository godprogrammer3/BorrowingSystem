using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Models
{
    public class User
    {
        public enum UserRole
        {
            admin,
            user
        }
        public enum UserStatus
        {
            normal,
            banned
        }
        [Key]
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public UserRole Role { get; set; }
        public UserStatus Status { get; set; }
    }
}
