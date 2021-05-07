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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .ToTable("User");

            modelBuilder.Entity<Equipment>()
                .ToTable("Equipment");


            modelBuilder.Entity<Room>()
               .ToTable("Room");

            modelBuilder.Entity<Reservation>()
                .ToTable("Reservation");

            modelBuilder.Entity<User>()
                .Property(c => c.Role)
                .HasConversion<string>();

            modelBuilder.Entity<User>()
                .Property(c => c.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Equipment>()
                .Property(c => c.Status)
                .HasConversion<string>();


            base.OnModelCreating(modelBuilder);
        }

    }
}
