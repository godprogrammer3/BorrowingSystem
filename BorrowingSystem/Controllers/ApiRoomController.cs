using BorrowingSystem.Jwt;
using BorrowingSystem.Models;
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
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    [Route("api/room")]
    [ApiController]
    public class ApiRoomController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ILogger<ApiRoomController> _logger;
        public ApiRoomController(IRoomService roomService, ILogger<ApiRoomController> logger)
        {
            _roomService = roomService;
            _logger = logger;
        } 
        [Authorize( Roles = "admin")]
        [HttpPost("create")]
        public async Task<ActionResult> Create([FromBody] CreateRequest request) {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            
            try
            {
                var accessToken = await HttpContext.GetTokenAsync("Bearer", "access_token");
                _roomService.Create(request.Name, DateTime.Now ,accessToken);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
        
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("get-all")]
        public ActionResult GetAll()
        {
            try
            {
                IEnumerable<Room> rooms = _roomService.GetAll();
                return Ok(rooms);
            }catch(Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }
           
        }

        [Authorize(Roles = "admin")]
        [HttpPost("delete")]
        public ActionResult Delete([FromBody] DeleteRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                _roomService.Delete(request.Id);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }

        [Authorize(Roles = "admin")]
        [HttpPost("edit")]
        public ActionResult Edit([FromBody] EditRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                _roomService.Edit(request.Id,request.Name);
                return NoContent();
            }
            catch (Exception error)
            {
                _logger.LogError(error.ToString());
                return BadRequest();
            }

        }
        public class CreateRequest
        {
            [Required]
            [JsonPropertyName("name")]
            public string Name { get; set; }
        }
        public class DeleteRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
        }
        public class EditRequest
        {
            [Required]
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [Required]
            [JsonPropertyName("name")]
            public string Name { get; set; }
        }
    }
}
