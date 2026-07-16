using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/addon-services")]
    [Authorize]
    public class AddOnServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddOnServicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableServices()
        {
            var services = await _context.AddOnServices
                .Where(s => s.IsAvailable)
                .ToListAsync();
            return Ok(services);
        }
    }
}
