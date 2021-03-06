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
  

    public class ReservationRoom
    {
        public Reservation Reservation { get; set; }
        public Room Room { get; set; }
    }

    public class ReservationUser
    { 
        public Reservation Reservation { get; set; }
        public User User { get; set; }
       
    }

    public interface IReservationService {
        List<List<int>> GetAvailableEquipmentInMonth(int roomId);
        Reservation Create(int roomId, DateTime startDateTime, int hourPeriod, string accessToken);
        List<ReservationRoom> GetReservationByUserId(string accessToken);
        void Delete(int reservationId, string accessToken);
        List<ReservationUser> GetReservationByRoomDateHour(int roomId, int date, int hour);
        ReservationRoom GetReservationById(int id,string accessToken);
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

        public Reservation Create(int roomId, DateTime startDateTime, int hourPeriod , string accessToken)
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
            User user = _db.User.Find(int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value));
            if(user.Status == User.UserStatus.banned)
            {
                throw new Exception("You are in banned status! Please contact admin.");
            }
            IEnumerable<Equipment> equipments = _db.Equipment.Where(c => c.RoomId == roomId && c.Status == Equipment.EquipmentStatus.available);
            int equipmentQuentity = equipments.Count();
            IEnumerable<Reservation> reservarions= _db.Reservation.Where(c => (( c.StartDateTime >= startDateTime && c.StartDateTime < endDateTime ) || ( c.EndDateTime > startDateTime && c.EndDateTime <= endDateTime )) && c.RoomId == roomId );
            _logger.LogInformation(reservarions.Count().ToString());
            if(reservarions.Count() >= equipmentQuentity)
            {
                throw new Exception("Reservation is full!");
            }
            if( reservarions.FirstOrDefault(c=> c.UserId == int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value)  ) != null){
                if(int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value) != 3)
                {
                    throw new Exception("You already reserved in period time!");
                }
                
            }

            Reservation newReservation = new() { UserId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value), RoomId = roomId, StartDateTime = startDateTime, EndDateTime = endDateTime };
            _db.Reservation.Add(newReservation);
            _db.SaveChanges();
            return newReservation;
        }

        public void Delete(int reservationId, string accessToken)
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken); 
            int userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);
            string userRole = principal.FindFirst(ClaimTypes.Role).Value;
            Reservation reservation = _db.Reservation.Find(reservationId);
            if(reservation == null)
            {
                throw new Exception("This reservation id not found!");
            }
            if( userRole == "admin" || reservation.UserId == userId)
            {
                _db.Reservation.Remove(reservation);
                _db.SaveChanges();
                return;
            }
            throw new Exception("Your user id is not match this reservation!");
        }

        public List<List<int>> GetAvailableEquipmentInMonth(int roomId)
        {
            
            IEnumerable<Equipment> equipments = _db.Equipment.Where(c => c.RoomId == roomId && c.Status == Equipment.EquipmentStatus.available );
            List<List<int>> availableEquipmentInMonth = new ();
            int equipmentQuentity =  equipments.Count();
            TimeZoneInfo asiaThTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            DateTime asiaThDateTime = TimeZoneInfo.ConvertTime(DateTime.Now, asiaThTimeZone);
            for (var dateIndex = asiaThDateTime.Day; dateIndex <= DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month); dateIndex++)
            {
                List<int> availableEquipmentInDay = new ();
                for (var hourIndex = 9; hourIndex <= 21; hourIndex++)
                {
                    availableEquipmentInDay.Add(equipmentQuentity); 
                }
                availableEquipmentInMonth.Add(availableEquipmentInDay);
            }
            IEnumerable<Reservation> reservations = _db.Reservation.Where(c => (c.StartDateTime.Year == DateTime.Now.Year && c.StartDateTime.Month == DateTime.Now.Month) && c.RoomId == roomId);
            int reservationCount = reservations.Count();
            for (var reservationIndex = 0; reservationIndex < reservationCount; reservationIndex++)
            {
                for (var hourIndex = reservations.ElementAt(reservationIndex).StartDateTime.Hour; hourIndex < reservations.ElementAt(reservationIndex).EndDateTime.Hour; hourIndex++)
                {
                    if(reservations.ElementAt(reservationIndex).StartDateTime.Day - asiaThDateTime.Day >= 0)
                    {
                        availableEquipmentInMonth[reservations.ElementAt(reservationIndex).StartDateTime.Day - asiaThDateTime.Day][hourIndex - 9]--;
                    }
                    
                }
            }
            return availableEquipmentInMonth;
        }

        public ReservationRoom GetReservationById(int id , string accessToken)
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);
            int userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);
            string userRole = principal.FindFirst(ClaimTypes.Role).Value;

           var result = _db.Reservation.Join(
              _db.Room,
              reservation => reservation.RoomId,
              room => room.Id,
              (reservation, room) => new
              {
                  reservation,
                  room,
              }
             ).FirstOrDefault(c => c.reservation.Id == id);
            if (result != null)
            {
               
                if (userRole == "admin")
                {
                    return new() { Reservation = result.reservation , Room = result.room };
                }else if( userId == result.reservation.UserId)
                {
                    return new() { Reservation = result.reservation, Room = result.room };
                }
                throw new Exception("Forbidden this is not your reservation!");
            }
            throw new Exception("Not found this reservation!");

        }

        public List<ReservationUser> GetReservationByRoomDateHour(int roomId, int date, int hour)
        {
            return _db.Reservation.Join(
                _db.User,
                reservation => reservation.UserId,
                user => user.Id,
                (reservation,user) => new { 
                   reservation,
                   user,
                            }
               ).Where(c => c.reservation.RoomId == roomId && c.reservation.StartDateTime.Day == date && ( hour >= c.reservation.StartDateTime.Hour && hour <= c.reservation.EndDateTime.Hour))
               .Select( c => new ReservationUser() { User = c.user , Reservation = c.reservation} )
               .ToList() ;
        }

        public List<ReservationRoom> GetReservationByUserId(string accessToken)
        {
            var (principal, jwtToken) = _jwtAuthManager.DecodeJwtToken(accessToken);

            return _db.Reservation.Join(
                _db.Room,
                reservation => reservation.RoomId,
                room => room.Id,
                (reservation, room) => new
                {
                    reservation,
                    room
                }
            ).Where( c=>c.reservation.UserId == int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value)).Select( c => new ReservationRoom() { Reservation = c.reservation , Room = c.room }).ToList();
         
        }
    }
}
