using BorrowingSystem.Database;
using BorrowingSystem.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Services
{
    public interface IEquipmentService
    {
        IEnumerable<Equipment> GetAllEquipmentByRoom(int roomId);
        void Create(int roomId,string name,string serialNumber);

        void Delete(int id);

        void Patch(int id, string name, string serialNumber, int status);
    }
    public class EquipmentService : IEquipmentService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<Equipment> _logger;
        public EquipmentService(ApplicationDbContext db, ILogger<Equipment> logger)
        {
            _db  = db;
            _logger = logger;
        }

        public void Create(int roomId ,string name, string serialNumber)
        {
            Equipment equipment = new() { Name = name , SerialNumber = serialNumber , Status = Equipment.EquipmentStatus.available , RoomId = roomId };
            _db.Equipment.Add(equipment);
            _db.SaveChanges();
            return;
        }

        public void Delete(int id)
        {
            Equipment equipment = _db.Equipment.Find(id);
            _db.Equipment.Remove(equipment);
            _db.SaveChanges();
            return;
        }

        public IEnumerable<Equipment> GetAllEquipmentByRoom(int roomId)
        {
            return _db.Equipment.Where(c => c.RoomId == roomId);
        }

        public void Patch(int id, string name, string serialNumber, int status)
        {
            Equipment equipment = _db.Equipment.Find(id);
            if (!String.IsNullOrEmpty(name))
            {
                equipment.Name = name;
            }
            if (!String.IsNullOrEmpty(serialNumber))
            {
                equipment.SerialNumber = serialNumber;
            }
            if (status != 0)
            {
                equipment.Status = (Equipment.EquipmentStatus)status;
            }
            _db.Update(equipment);
            _db.SaveChanges();
            return;
        }
    }
}
