using BorrowingSystem.Models;
using BorrowingSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    [Route("api/equipment")]
    [ApiController]
    public class ApiEquipmentController : ControllerBase
    {
        private readonly IEquipmentService _equipmentService;
        private readonly ILogger<ApiEquipmentController> _logger;
        public ApiEquipmentController(IEquipmentService equipmentService , ILogger<ApiEquipmentController> logger)
        {
            _equipmentService = equipmentService;
            _logger = logger;
        }

        [Authorize(Roles = "admin")]
        [HttpPost("get-all-equipment-by-room")]
        public ActionResult GetAllEquipmentByRoom([FromBody] GetAllEquipmentByRoomRequest request)
        {
            try
            {
                IEnumerable<Equipment> equipments = _equipmentService.GetAllEquipmentByRoom(request.Id);
                return Ok(equipments);
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public ActionResult Create([FromBody] CreateEquipmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                _equipmentService.Create(request.Id,request.Name,request.SerialNumber);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }

        [Authorize(Roles = "admin")]
        [HttpDelete("delete")]
        public ActionResult Delete([FromQuery]DeleteEquipmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                _equipmentService.Delete(request.Id);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPatch("patch")]
        public ActionResult Patch([FromBody] UpdateEquipmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                _equipmentService.Patch(request.Id,request.Name,request.SerialNumber, request.Status);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }

        public class GetAllEquipmentByRoomRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
        }

        public class CreateEquipmentRequest
        {
            [Required]
            [JsonPropertyName("roomId")]
            public int Id { get; set; }
            [Required]
            [JsonPropertyName("name")]
            public string Name { get; set; }
            [Required]
            [JsonPropertyName("serialNumber")]
            public string SerialNumber { get; set; }
        }

        public class DeleteEquipmentRequest
        {
            [Required]
            [FromQuery(Name = "id")]
            public int Id { get; set; }

        }

        public class UpdateEquipmentRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("name")]
            public string Name { get; set; }
            [JsonPropertyName("serialNumber")]
            public string SerialNumber { get; set; }
            [JsonPropertyName("status")]
            public int Status { get; set; }

        }
    }
}
