using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    public class RoomController : Controller
    {
        public IActionResult Index([FromQuery(Name = "id")] int id, [FromQuery(Name = "name")] string name)
        {
            ViewBag.name = "TestName";
            return View();
        }
    }
}
