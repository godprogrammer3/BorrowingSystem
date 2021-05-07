using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("[controller]")]
    public class ErrorController : Controller
    {
        [HttpGet("")]
        [AllowAnonymous]
        public IActionResult Get()
        {
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}
