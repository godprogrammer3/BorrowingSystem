using BorrowingSystem.Database;
using BorrowingSystem.Jwt;
using BorrowingSystem.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BorrowingSystem.Services
{
    
    public interface IRoomService
    {
        void Create(string name , string equipmentName,DateTime now,string accessToken);
        IEnumerable<Room> GetAll();
        void Delete(int id);
        void Patch(int id, string name, string equipmentName);

    }
    public class RoomService : IRoomService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<UserService> _logger;
        private readonly IJwtAuthManager _jwtAuthManager;
        public RoomService(ApplicationDbContext db, ILogger<UserService> logger, IJwtAuthManager jwtAuthManager)
        {
            _db = db;
            _logger = logger;
            _jwtAuthManager = jwtAuthManager;
        }
        public void Create(string name, string equipmentName,DateTime now,string accessToken )
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);
            var createBy = principal.FindFirst(ClaimTypes.Name).Value;
            Room room = new() { Name = name , EquipmentName = equipmentName ,CreateBy = createBy , DateModified = now};
            _db.Room.Add(room);
            _db.SaveChanges();
        }

        public void Delete(int id)
        {
            var room = _db.Room.FirstOrDefault(c => c.Id == id);
            _db.Room.Remove(room);
            _db.SaveChanges();
            return;
        }

        public IEnumerable<Room> GetAll()
        {
            return _db.Room;
        }

        public void Patch(int id, string name , string equipmentName)
        {
            Room room = _db.Room.Find(id);
            if (room != null)
            {
                if (!String.IsNullOrEmpty(name))
                {
                    room.Name = name;
                }
                if(!String.IsNullOrEmpty(equipmentName))
                {
                    room.EquipmentName = equipmentName;
                }
                _db.Room.Update(room);
                _db.SaveChanges();
                return;
            }
            throw new Exception("Room doesn't exist!");
        }
    }
}
