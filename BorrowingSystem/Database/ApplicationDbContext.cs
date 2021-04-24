using BorrowingSystem.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Database
{
    public class ApplicationDbContext: IdentityDbContext
    {
        public ApplicationDbContext( DbContextOptions<ApplicationDbContext> options): base(options)
        {

        }

        public DbSet<User> User { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Room> Room { get; set; }
        public DbSet<Reservation> Reservation { get; set; }

    }
}
