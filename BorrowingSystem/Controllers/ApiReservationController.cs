using BorrowingSystem.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    [Route("api/reservation")]
    [ApiController]
    public class ApiReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ApiReservationController> _logger;
        public ApiReservationController(IReservationService reservationService , ILogger<ApiReservationController> logger)
        {
            _reservationService = reservationService;
            _logger = logger;
        }
        [Authorize]
        [HttpGet("get-available-equipment-in-month")]
        public ActionResult GetAvailableEquipmentInMonth([FromQuery] GetAvailableEquipmentInMonthRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                return Ok(_reservationService.GetAvailableEquipmentInMonth(request.Id));
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }
        [Authorize]
        [HttpPost("create")]
        public async Task<ActionResult> Create([FromBody] CreateReservationRequetst request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                var token = await HttpContext.GetTokenAsync("Bearer", "access_token");
                var result = _reservationService.Create(request.RoomId, request.StartDateTime, request.HourPeriod, token);
                return Created("NotSpecified", result);
            }
            catch (Exception error)
            {
                _logger.LogError(error.Message);
                if(error.Message == "You already reserved in period time!")
                {
                    return Conflict(error.Message);
                }
                if( error.Message == "Reservation is full!")
                {
                    return StatusCode((int)HttpStatusCode.Gone,error.Message);
                }
                if( error.Message == "You are in banned status! Please contact admin.")
                {
                    return BadRequest(error.Message);
                }
                return BadRequest();
            }

        }

        [Authorize]
        [HttpGet("get-all-reservation-by-user")]
        public async Task<ActionResult> GetReservationByUserId()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                var token = await HttpContext.GetTokenAsync("Bearer", "access_token");
                return Ok(_reservationService.GetReservationByUserId(token));
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }

        [Authorize]
        [HttpGet("get-reservation-by-id")]
        public async Task<ActionResult> GetReservationById([FromQuery] GetReservationByIdRequest request )
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                var token = await HttpContext.GetTokenAsync("Bearer", "access_token");
                return Ok(_reservationService.GetReservationById(request.Id, token));
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                if(error.Message == "Not found this reservation!")
                {
                    return NotFound();
                }else if (error.Message == "Forbidden this is not your reservation!" )
                {
                    return BadRequest("Retricted access this is not your reservation!");
                }
                return BadRequest("Unknown error!");
            }

        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<ActionResult> Delete([FromQuery] DeleteReservationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                var token = await HttpContext.GetTokenAsync("Bearer", "access_token");
                _reservationService.Delete(request.Id,token);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }


        [Authorize( Roles = "admin" )]
        [HttpGet("get-reservation-by-room-date-hour")]
        public ActionResult GetReservationByRoomDateHour([FromQuery] GetReservationByRoomDateHourRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                return Ok(_reservationService.GetReservationByRoomDateHour( request.RoomId , request.Date , request.Hour ));
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }


        public class GetAvailableEquipmentInMonthRequest
        {
            [Required]
            public int Id { get; set; }
        }
        public class CreateReservationRequetst
        {
            [Required]
            public int RoomId { get; set; }
            [Required]
            public DateTime StartDateTime { get; set; }
            [Required]
            public int HourPeriod { get; set; }

        }

        public class DeleteReservationRequest
        {
            [Required]
            [FromQuery(Name = "id")]
            public int Id { get; set; }
        }
        public class GetReservationByRoomDateHourRequest
        {
            [Required]
            [FromQuery(Name = "roomId")]
            public int RoomId { get; set; }
            [Required]
            [FromQuery(Name = "date")]
            public int Date { get; set; }
            [Required]
            [FromQuery(Name = "hour")]
            public int Hour { get; set; }
        }

        public class GetReservationByIdRequest
        {
            [Required]
            [FromQuery(Name = "id")]
            public int Id { get; set; }

        }
    }
}
