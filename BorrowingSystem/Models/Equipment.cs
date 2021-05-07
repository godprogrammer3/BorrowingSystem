using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Models
{
    public class Equipment
    {
        public enum EquipmentStatus
        {
            available,
            repairing
        }
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } 
        public EquipmentStatus Status{ get; set; }
        [ForeignKey("Room")]
        public int RoomId { get; set; }
        public string SerialNumber   { get; set; } 
    }
}
