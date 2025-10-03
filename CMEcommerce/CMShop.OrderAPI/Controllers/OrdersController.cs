using CMShop.OrderAPI.Data.ValueObjects;
using CMShop.OrderAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.OrderAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _repository;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IOrderRepository repository, ILogger<OrdersController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET /api/v1/orders - Listar todos os pedidos (admin)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderVO>>> GetAllOrders()
        {
            try
            {
                _logger.LogInformation("Listando todos os pedidos (admin)");
                var orders = await _repository.FindAllOrders();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao listar todos os pedidos");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/orders/{id} - Obter pedido por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderVO>> GetOrderById(long id)
        {
            try
            {
                _logger.LogInformation("Buscando pedido por ID: {OrderId}", id);
                
                var order = await _repository.FindOrderById(id);
                if (order == null)
                {
                    _logger.LogInformation("Pedido não encontrado: {OrderId}", id);
                    return NotFound("Pedido não encontrado");
                }

                _logger.LogInformation("Pedido encontrado: {OrderId}", id);
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar pedido por ID: {OrderId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/orders/user/{userId} - Listar pedidos por usuário
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderVO>>> GetOrdersByUserId(string userId)
        {
            try
            {
                _logger.LogInformation("Buscando pedidos para usuário: {UserId}", userId);
                
                var orders = await _repository.FindOrdersByUserId(userId);
                
                _logger.LogInformation("Encontrados {Count} pedidos para usuário: {UserId}", orders.Count(), userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar pedidos para usuário: {UserId}", userId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // POST /api/v1/orders - Criar novo pedido
        [HttpPost]
        public async Task<ActionResult<OrderVO>> CreateOrder([FromBody] OrderVO orderVO)
        {
            try
            {
                if (orderVO == null)
                {
                    _logger.LogWarning("Tentativa de criar pedido nulo");
                    return BadRequest("Pedido não pode ser nulo");
                }

                if (orderVO.OrderHeader == null)
                {
                    _logger.LogWarning("Tentativa de criar pedido sem header");
                    return BadRequest("OrderHeader é obrigatório");
                }

                if (string.IsNullOrEmpty(orderVO.OrderHeader.UserId))
                {
                    _logger.LogWarning("Tentativa de criar pedido sem UserId");
                    return BadRequest("UserId é obrigatório");
                }

                if (orderVO.OrderDetails == null || !orderVO.OrderDetails.Any())
                {
                    _logger.LogWarning("Tentativa de criar pedido sem itens");
                    return BadRequest("OrderDetails não pode ser vazio");
                }

                _logger.LogInformation("Criando novo pedido para usuário: {UserId}", orderVO.OrderHeader.UserId);

                var result = await _repository.CreateOrder(orderVO);

                _logger.LogInformation("Pedido criado com sucesso. ID: {OrderId}", result.OrderHeader.Id);
                return CreatedAtAction(nameof(GetOrderById), new { id = result.OrderHeader.Id }, result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Dados inválidos ao criar pedido");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar pedido");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT /api/v1/orders/{id} - Atualizar pedido
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderVO>> UpdateOrder(long id, [FromBody] OrderVO orderVO)
        {
            try
            {
                if (orderVO == null)
                {
                    return BadRequest("Pedido não pode ser nulo");
                }

                if (orderVO.OrderHeader.Id != id)
                {
                    return BadRequest("ID do pedido não confere");
                }

                _logger.LogInformation("Atualizando pedido: {OrderId}", id);

                var result = await _repository.UpdateOrder(orderVO);
                
                _logger.LogInformation("Pedido atualizado com sucesso: {OrderId}", id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar pedido: {OrderId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // PATCH /api/v1/orders/{id}/payment-status - Atualizar status de pagamento
        [HttpPatch("{id}/payment-status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePaymentStatus(long id, [FromBody] PaymentStatusRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest("Request não pode ser nulo");
                }

                _logger.LogInformation("Atualizando status de pagamento do pedido {OrderId} para {PaymentStatus}", id, request.PaymentStatus);

                DateTime? purchaseDate = request.PaymentStatus ? DateTime.Now : null;
                var success = await _repository.UpdateOrderPaymentStatus(id, request.PaymentStatus, purchaseDate);
                
                if (!success)
                {
                    _logger.LogWarning("Pedido não encontrado para atualizar status: {OrderId}", id);
                    return NotFound("Pedido não encontrado");
                }

                _logger.LogInformation("Status de pagamento atualizado com sucesso para pedido: {OrderId}", id);
                return Ok(new { message = "Status de pagamento atualizado com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar status de pagamento do pedido: {OrderId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE /api/v1/orders/{id} - Deletar pedido
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteOrder(long id)
        {
            try
            {
                _logger.LogInformation("Deletando pedido: {OrderId}", id);

                var success = await _repository.DeleteOrder(id);
                
                if (!success)
                {
                    _logger.LogWarning("Pedido não encontrado para deletar: {OrderId}", id);
                    return NotFound("Pedido não encontrado");
                }

                _logger.LogInformation("Pedido deletado com sucesso: {OrderId}", id);
                return Ok(new { message = "Pedido deletado com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar pedido: {OrderId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        public class PaymentStatusRequest
        {
            public bool PaymentStatus { get; set; }
        }
    }
}
