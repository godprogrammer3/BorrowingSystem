using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
  
    public class ManagementController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Room([FromQuery(Name = "id")] int id, [FromQuery(Name = "name")] string name)
        {
            ViewBag.id = id;
            ViewBag.name = name;
            return View();
        }
    }

}
