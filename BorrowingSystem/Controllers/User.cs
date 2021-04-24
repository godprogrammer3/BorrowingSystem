using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    public class User : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Login()
        {
            return StatusCode((int)HttpStatusCode.OK, Json("Sucess."));
        }
        public IActionResult Register()
        {
            return View();
        }
    }
}
