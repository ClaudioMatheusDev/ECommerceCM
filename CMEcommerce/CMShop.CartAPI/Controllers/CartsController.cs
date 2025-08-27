using CMShop.CartAPI.Data.ValueObjects;
using CMShop.CartAPI.Mensagens;
using CMShop.CartAPI.RabbitMQSender;
using CMShop.CartAPI.Repository;
using CMShop.CartAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.CartAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartsController : ControllerBase
    {
        private ICartRepository _repository;
        private ICouponService _couponService;
        private IRabbitMQMessageSender _rabbitMQMessageSender;
        private readonly ILogger<CartsController> _logger;

        public CartsController(ICartRepository repository, ICouponService couponService, IRabbitMQMessageSender rabbitMQMessageSender, ILogger<CartsController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _couponService = couponService ?? throw new ArgumentNullException(nameof(couponService));
            _rabbitMQMessageSender = rabbitMQMessageSender ?? throw new ArgumentNullException(nameof(rabbitMQMessageSender));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }


        // GET /api/v1/carts/{userId} - Obter carrinho por usuário
        [HttpGet("{userId}")]
        public async Task<ActionResult<CartVO>> GetCartByUserId(string userId)
        {
            try
            {
                _logger.LogInformation("Buscando carrinho para usuário: {UserId}", userId);

                var cart = await _repository.FindCartByUserID(userId);
                if (cart == null)
                {
                    _logger.LogInformation("Carrinho não encontrado para usuário: {UserId}", userId);
                    return Ok(new CartVO { CartDetails = new List<CartDetailVO>() });
                }

                _logger.LogInformation("Carrinho encontrado para usuário: {UserId}", userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar carrinho para usuário: {UserId}", userId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // POST /api/v1/carts - Adicionar/Atualizar item no carrinho
        [HttpPost]
        public async Task<ActionResult<CartVO>> AddCart([FromBody] CartVO cart)
        {
            try
            {
                if (cart == null)
                {
                    _logger.LogWarning("Tentativa de adicionar carrinho nulo");
                    return BadRequest("Carrinho não pode ser nulo");
                }

                _logger.LogInformation("Recebido request para adicionar/atualizar carrinho: {CartData}", System.Text.Json.JsonSerializer.Serialize(cart));
                _logger.LogInformation("Adicionando/Atualizando carrinho para usuário: {UserId}", cart.CartHeader?.UserId);

                var result = await _repository.SaveOrUpdateCart(cart);

                _logger.LogInformation("Carrinho salvo com sucesso. CartHeader ID: {HeaderId}, Items: {ItemCount}",
                    result?.CartHeader?.Id, result?.CartDetails?.Count());

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Dados inválidos ao salvar carrinho");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao salvar carrinho - Detalhes: {Message}", ex.Message);
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT /api/v1/carts - Atualizar carrinho
        [HttpPut]
        public async Task<ActionResult<CartVO>> UpdateCart([FromBody] CartVO cart)
        {
            try
            {
                if (cart == null)
                {
                    return BadRequest("Carrinho não pode ser nulo");
                }

                _logger.LogInformation("Atualizando carrinho para usuário: {UserId}", cart.CartHeader?.UserId);

                var result = await _repository.SaveOrUpdateCart(cart);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar carrinho");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE /api/v1/carts/{cartDetailId} - Remover item do carrinho
        [HttpDelete("{cartDetailId}")]
        public async Task<ActionResult> RemoveFromCart(long cartDetailId)
        {
            try
            {
                _logger.LogInformation("Removendo item do carrinho: {CartDetailId}", cartDetailId);

                bool success = await _repository.RemoveFromCart(cartDetailId);
                if (success)
                {
                    _logger.LogInformation("Item removido com sucesso: {CartDetailId}", cartDetailId);
                    return Ok(new { message = "Item removido com sucesso" });
                }

                _logger.LogWarning("Item não encontrado: {CartDetailId}", cartDetailId);
                return NotFound("Item não encontrado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover item do carrinho: {CartDetailId}", cartDetailId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE /api/v1/carts/clear/{userId} - Limpar carrinho
        [HttpDelete("clear/{userId}")]
        public async Task<ActionResult> ClearCart(string userId)
        {
            try
            {
                _logger.LogInformation("Limpando carrinho para usuário: {UserId}", userId);

                bool success = await _repository.ClearCart(userId);
                if (success)
                {
                    _logger.LogInformation("Carrinho limpo com sucesso para usuário: {UserId}", userId);
                    return Ok(new { message = "Carrinho limpo com sucesso" });
                }

                _logger.LogWarning("Carrinho não encontrado para usuário: {UserId}", userId);
                return NotFound("Carrinho não encontrado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao limpar carrinho para usuário: {UserId}", userId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // POST /api/v1/carts/apply-coupon - Aplicar cupom
        [HttpPost("apply-coupon")]
        public async Task<ActionResult> ApplyCoupon([FromBody] CouponRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.CouponCode))
                {
                    return BadRequest("UserId e CouponCode são obrigatórios");
                }

                _logger.LogInformation("Aplicando cupom {CouponCode} para usuário: {UserId}", request.CouponCode, request.UserId);

                // Primeiro valida o cupom no CouponAPI
                var validationResult = await _couponService.ValidateCouponAsync(request.CouponCode);

                if (!validationResult.IsValid)
                {
                    _logger.LogWarning("Cupom inválido: {CouponCode} - {ErrorMessage}", request.CouponCode, validationResult.ErrorMessage);
                    return BadRequest(validationResult.ErrorMessage);
                }

                // Se o cupom é válido, aplica no carrinho
                bool success = await _repository.ApplyCoupon(request.UserId, request.CouponCode);
                if (success)
                {
                    _logger.LogInformation("Cupom aplicado com sucesso. Desconto: {DiscountAmount}", validationResult.DiscountAmount);
                    return Ok(new
                    {
                        message = "Cupom aplicado com sucesso",
                        discountAmount = validationResult.DiscountAmount
                    });
                }

                _logger.LogWarning("Falha ao aplicar cupom para usuário: {UserId}", request.UserId);
                return BadRequest("Falha ao aplicar cupom - carrinho não encontrado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao aplicar cupom");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE /api/v1/carts/remove-coupon/{userId} - Remover cupom
        [HttpDelete("remove-coupon/{userId}")]
        public async Task<ActionResult> RemoveCoupon(string userId)
        {
            try
            {
                _logger.LogInformation("Removendo cupom para usuário: {UserId}", userId);

                bool success = await _repository.RemoveCoupon(userId);
                if (success)
                {
                    _logger.LogInformation("Cupom removido com sucesso para usuário: {UserId}", userId);
                    return Ok(new { message = "Cupom removido com sucesso" });
                }

                _logger.LogWarning("Falha ao remover cupom para usuário: {UserId}", userId);
                return BadRequest("Falha ao remover cupom");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover cupom para usuário: {UserId}", userId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/carts - Listar todos os carrinhos (para admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartVO>>> GetAllCarts()
        {
            try
            {
                _logger.LogInformation("Listando todos os carrinhos (admin)");
                var carts = await _repository.FindAllCarts();
                return Ok(carts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao listar todos os carrinhos");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<CartVO>> Checkout(CheckoutHeaderVO vo)
        {
            try
            {
                _logger.LogInformation("=== INICIO CHECKOUT ===");
                _logger.LogInformation("Recebido request de checkout: {@CheckoutData}", vo);
                
                // Verificar se o modelo é válido
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Modelo inválido para checkout: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                
                if (vo?.UserID == null) 
                {
                    _logger.LogWarning("UserID é nulo no checkout");
                    return BadRequest("UserID é obrigatório");
                }
                
                _logger.LogInformation("Buscando carrinho para usuário: {UserId}", vo.UserID);
                var cart = await _repository.FindCartByUserID(vo.UserID);
                if (cart == null)
                {
                    _logger.LogWarning("Carrinho não encontrado para checkout: {UserId}", vo.UserID);
                    return NotFound("Carrinho não encontrado");
                }
                
                _logger.LogInformation("Carrinho encontrado. Itens no carrinho: {ItemCount}", cart.CartDetails?.Count() ?? 0);
                
                vo.CartDetails = cart.CartDetails;
                vo.DateTime = DateTime.Now;

                _logger.LogInformation("Preparando para enviar mensagem para fila de checkout...");
                _logger.LogInformation("Dados completos do checkout: {@CompleteCheckoutData}", vo);
                
                await _rabbitMQMessageSender.SendMessage(vo, "checkoutqueue");
                
                _logger.LogInformation("Mensagem enviada com sucesso para fila 'checkoutqueue'");
                _logger.LogInformation("Checkout processado com sucesso para usuário: {UserId}", vo.UserID);
                _logger.LogInformation("=== FIM CHECKOUT ===");
                
                return Ok(vo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar checkout para usuário: {UserId} - Stacktrace: {StackTrace}", vo?.UserID, ex.StackTrace);
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }


        public class CouponRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string CouponCode { get; set; } = string.Empty;
        }
    }

}