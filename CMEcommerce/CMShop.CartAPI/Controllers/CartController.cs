using CMShop.CartAPI.Data.ValueObjects;
using CMShop.CartAPI.Model;
using CMShop.CartAPI.Repository;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.CartAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartController : ControllerBase
    {
        private ICartRepository _repository;

        public CartController(ICartRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        // GET /api/v1/cart/user/{userId} - Buscar carrinho por usuário
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<CartVO>> FindCartByUserId(string userId)
        {
            var cart = await _repository.FindCartByUserID(userId);
            if (cart == null)
            {
                return Ok(new CartVO { CartHeader = new CartHeaderVO { UserId = userId }, CartDetails = new List<CartDetailVO>() });
            }
            return Ok(cart);
        }

        // POST /api/v1/cart - Adicionar item ao carrinho
        [HttpPost]
        public async Task<ActionResult<CartVO>> AddToCart(CartDetailVO cartDetail)
        {
            // Buscar carrinho existente ou criar novo
            var existingCart = await _repository.FindCartByUserID(cartDetail.UserId);
            
            if (existingCart == null)
            {
                // Criar novo carrinho
                var newCart = new CartVO
                {
                    CartHeader = new CartHeaderVO { UserId = cartDetail.UserId },
                    CartDetails = new List<CartDetailVO> { cartDetail }
                };
                var createdCart = await _repository.SaveOrUpdateCart(newCart);
                return Ok(createdCart);
            }
            else
            {
                // Adicionar ao carrinho existente
                var cartDetails = existingCart.CartDetails.ToList();
                var existingItem = cartDetails.FirstOrDefault(x => x.ProductId == cartDetail.ProductId);
                
                if (existingItem != null)
                {
                    // Atualizar quantidade
                    existingItem.Count += cartDetail.Count;
                }
                else
                {
                    // Adicionar novo item
                    cartDetails.Add(cartDetail);
                }
                
                existingCart.CartDetails = cartDetails;
                var updatedCart = await _repository.SaveOrUpdateCart(existingCart);
                return Ok(updatedCart);
            }
        }

        // PUT /api/v1/cart/{id} - Atualizar item do carrinho
        [HttpPut("{id}")]
        public async Task<ActionResult<CartVO>> UpdateCartItem(long id, CartDetailVO cartDetail)
        {
            // Buscar carrinho do usuário
            var cart = await _repository.FindCartByUserID(cartDetail.UserId);
            if (cart == null)
            {
                return NotFound("Carrinho não encontrado");
            }

            // Atualizar item específico
            var cartDetails = cart.CartDetails.ToList();
            var itemToUpdate = cartDetails.FirstOrDefault(x => x.Id == id);
            
            if (itemToUpdate == null)
            {
                return NotFound("Item não encontrado no carrinho");
            }

            itemToUpdate.Count = cartDetail.Count;
            cart.CartDetails = cartDetails;
            
            var updatedCart = await _repository.SaveOrUpdateCart(cart);
            return Ok(updatedCart);
        }

        // DELETE /api/v1/cart/{id} - Remover item do carrinho
        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromCart(long id)
        {
            var success = await _repository.RemoveFromCart(id);
            if (!success)
            {
                return NotFound("Item não encontrado");
            }
            return Ok(new { message = "Item removido com sucesso" });
        }

        // DELETE /api/v1/cart/user/{userId}/clear - Limpar carrinho
        [HttpDelete("user/{userId}/clear")]
        public async Task<ActionResult> ClearCart(string userId)
        {
            var success = await _repository.ClearCart(userId);
            if (!success)
            {
                return NotFound("Carrinho não encontrado");
            }
            return Ok(new { message = "Carrinho limpo com sucesso" });
        }

        // GET /api/v1/cart/user/{userId}/total - Calcular total do carrinho
        [HttpGet("user/{userId}/total")]
        public async Task<ActionResult> GetCartTotal(string userId)
        {
            var cart = await _repository.FindCartByUserID(userId);
            if (cart == null || !cart.CartDetails.Any())
            {
                return Ok(new { total = 0.0 });
            }

            var total = cart.CartDetails.Sum(x => (x.Product?.Price ?? 0) * x.Count);
            return Ok(new { total = total });
        }
    }
}
