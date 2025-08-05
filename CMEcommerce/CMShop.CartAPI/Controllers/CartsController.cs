using CMShop.CartAPI.Data.ValueObjects;
using CMShop.CartAPI.Repository;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.CartAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartsController : ControllerBase
    {
        private ICartRepository _repository;

        public CartsController(ICartRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        // GET /api/v1/carts - Listar todos os carrinhos (para admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartVO>>> GetAllCarts()
        {
            var carts = await _repository.FindAllCarts();
            return Ok(carts);
        }
    }
}
