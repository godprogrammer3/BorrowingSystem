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
  

    public class AvailableEquipmentInMonth 
    {
        public int Date { get; set; }
        public int DayOfWeek { get; set; }
        public List<AvailableEquipmentInDay> AvailableEquipments { get; set; }
    }  
    public class AvailableEquipmentInDay
    {
        public int Hour { get; set; }
        public int Quantity { get; set; }
    }


    public interface IReservationService {
        List<AvailableEquipmentInMonth> GetAvailableEquipmentInMonth(int roomId);
        void Create(int roomId, DateTime startDateTime, int hourPeriod, string accessToken);
    }

    public class ReservationService : IReservationService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<ReservationService> _logger;
        private readonly IJwtAuthManager _jwtAuthManager;
        public ReservationService(ApplicationDbContext db, ILogger<ReservationService> logger, IJwtAuthManager jwtAuthManager)
        {
            _db = db;
            _logger = logger;
            _jwtAuthManager = jwtAuthManager;
        }

        public void Create(int roomId, DateTime startDateTime, int hourPeriod , string accessToken)
        {
            TimeZoneInfo asiaThTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            startDateTime = TimeZoneInfo.ConvertTimeFromUtc(startDateTime, asiaThTimeZone);
            DateTime endDateTime = startDateTime.AddHours(hourPeriod);
            _logger.LogInformation("startDate : "+startDateTime.ToLongDateString() +' '+ startDateTime.ToLongTimeString());
            _logger.LogInformation("endDate : " + endDateTime.ToLongDateString() + ' ' + endDateTime.ToLongTimeString());
            if ( endDateTime.Day != startDateTime.Day ||(startDateTime.Hour < 9 || (startDateTime.Hour > 21)) || (endDateTime.Hour < 10 || (startDateTime.Hour > 22)) )
            {
                throw new Exception("Invalid start or end time!");
            }
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);
            IEnumerable<Equipment> equipments = _db.Equipment.Where(c => c.RoomId == roomId);
            int equipmentQuentity = equipments.Count();
            IEnumerable<Reservation> reservarions= _db.Reservation.Where(c => ( c.StartDateTime >= startDateTime && c.StartDateTime < endDateTime ) || ( c.EndDateTime > startDateTime && c.EndDateTime <= endDateTime ) );
            _logger.LogInformation(reservarions.Count().ToString());
            if(reservarions.Count() >= equipmentQuentity)
            {
                throw new Exception("Reservation is full!");
            }
            if( reservarions.FirstOrDefault(c=> c.UserId == int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value)  ) != null){
                throw new Exception("You already reserved in period time!");
            }
            Reservation newReservation = new() { UserId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value), RoomId = roomId, StartDateTime = startDateTime, EndDateTime = endDateTime };
            _db.Reservation.Add(newReservation);
            _db.SaveChanges();
            return;
        }

        public List<AvailableEquipmentInMonth> GetAvailableEquipmentInMonth(int roomId)
        {
            
            DateTime firstDate = new (DateTime.Now.Year , DateTime.Now.Month ,1 );
            IEnumerable<Equipment> equipments = _db.Equipment.Where(c => c.RoomId == roomId );
            List<AvailableEquipmentInMonth> availableEquipmentInMonth = new List<AvailableEquipmentInMonth>();
            int equipmentQuentity =  equipments.Count();
            for(var dateIndex = 1; dateIndex <= DateTime.DaysInMonth(firstDate.Year, firstDate.Month); dateIndex++)
            {
                List<AvailableEquipmentInDay> availableEquipmentInDay = new List<AvailableEquipmentInDay>();
                for (var hourIndex = 9; hourIndex <= 21; hourIndex++)
                {
                    availableEquipmentInDay.Add(new() { Hour = hourIndex , Quantity = equipmentQuentity}); 
                }
                availableEquipmentInMonth.Add(new() {Date = dateIndex,DayOfWeek = (int)firstDate.DayOfWeek , AvailableEquipments = availableEquipmentInDay });
                firstDate = firstDate.AddDays(1);
            }
            IEnumerable<Reservation> reservations = _db.Reservation.Where(c => (c.StartDateTime.Year == DateTime.Now.Year && c.StartDateTime.Month == DateTime.Now.Month) && c.RoomId == roomId);
            foreach(Reservation reservation in reservations)
            {
                for(var hourIndex = reservation.StartDateTime.Hour; hourIndex < reservation.EndDateTime.Hour; hourIndex++)
                {
                    availableEquipmentInMonth[reservation.StartDateTime.Day-1].AvailableEquipments[hourIndex - 9].Quantity--;
                }
            }
            return availableEquipmentInMonth;
        }
    }
}
