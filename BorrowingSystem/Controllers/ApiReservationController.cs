using BorrowingSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    [Route("api/reservation")]
    [ApiController]
    public class ApiReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ApiReservationController> _logger;
        public ApiReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
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
        public class GetAvailableEquipmentInMonthRequest
        {
            [Required]
            public int Id { get; set; }
        }
    }
}
