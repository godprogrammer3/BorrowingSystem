using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Controllers
{
    public class MyBorrowController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
