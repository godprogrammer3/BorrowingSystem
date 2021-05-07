using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BorrowingSystem.Services
{
    public interface IFileService
    {
        public string saveFile();
    }
    public class FileServiceL : IFileService
    {
        public string saveFile()
        {
            throw new NotImplementedException();
        }
    }
}
