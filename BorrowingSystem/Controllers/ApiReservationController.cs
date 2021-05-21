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
                _reservationService.Create(request.RoomId, request.StartDateTime, request.HourPeriod, token);
                return NoContent();
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
    }
}
