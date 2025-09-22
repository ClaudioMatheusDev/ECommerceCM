using CMShop.PaymentAPI.Data.ValueObjects;
using CMShop.PaymentAPI.Repository;
using CMShop.PaymentAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.PaymentAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _repository;
        private readonly IPaymentService _service;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentRepository repository, 
            IPaymentService service, 
            ILogger<PaymentController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET /api/v1/payment - Listar todos os pagamentos (admin)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PaymentVO>>> GetAllPayments()
        {
            try
            {
                _logger.LogInformation("Listando todos os pagamentos (admin)");
                var payments = await _repository.FindAllPayments();
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao listar todos os pagamentos");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/payment/{id} - Obter pagamento por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<PaymentVO>> GetPaymentById(long id)
        {
            try
            {
                _logger.LogInformation("Buscando pagamento por ID: {PaymentId}", id);
                
                var payment = await _repository.FindPaymentById(id);
                if (payment == null)
                {
                    _logger.LogInformation("Pagamento não encontrado: {PaymentId}", id);
                    return NotFound("Pagamento não encontrado");
                }

                _logger.LogInformation("Pagamento encontrado: {PaymentId}", id);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar pagamento por ID: {PaymentId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/payment/order/{orderId} - Listar pagamentos por OrderId
        [HttpGet("order/{orderId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PaymentVO>>> GetPaymentsByOrderId(long orderId)
        {
            try
            {
                _logger.LogInformation("Buscando pagamentos para o pedido: {OrderId}", orderId);
                var payments = await _repository.FindPaymentsByOrderId(orderId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar pagamentos para o pedido: {OrderId}", orderId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET /api/v1/payment/user/{userId} - Listar pagamentos por usuário
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PaymentVO>>> GetPaymentsByUserId(string userId)
        {
            try
            {
                _logger.LogInformation("Buscando pagamentos para o usuário: {UserId}", userId);
                var payments = await _repository.FindPaymentsByUserId(userId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar pagamentos para o usuário: {UserId}", userId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // POST /api/v1/payment - Processar pagamento
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PaymentVO>> ProcessPayment([FromBody] PaymentVO paymentVO)
        {
            try
            {
                _logger.LogInformation("Iniciando processamento de pagamento para o pedido: {OrderId}", paymentVO.OrderId);
                
                if (paymentVO == null)
                {
                    _logger.LogWarning("Dados de pagamento inválidos");
                    return BadRequest("Dados de pagamento inválidos");
                }

                var result = await _service.ProcessPayment(paymentVO);
                
                if (result)
                {
                    _logger.LogInformation("Pagamento processado com sucesso para o pedido: {OrderId}", paymentVO.OrderId);
                    return Ok(paymentVO);
                }
                else
                {
                    _logger.LogWarning("Falha no processamento do pagamento para o pedido: {OrderId}", paymentVO.OrderId);
                    return BadRequest("Falha no processamento do pagamento");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar pagamento para o pedido: {OrderId}", paymentVO.OrderId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // PUT /api/v1/payment - Atualizar pagamento
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PaymentVO>> UpdatePayment([FromBody] PaymentVO paymentVO)
        {
            try
            {
                _logger.LogInformation("Atualizando pagamento: {PaymentId}", paymentVO.Id);
                
                if (paymentVO == null)
                {
                    _logger.LogWarning("Dados de pagamento inválidos");
                    return BadRequest("Dados de pagamento inválidos");
                }

                var result = await _repository.UpdatePayment(paymentVO);
                
                if (result == null)
                {
                    _logger.LogWarning("Pagamento não encontrado: {PaymentId}", paymentVO.Id);
                    return NotFound("Pagamento não encontrado");
                }

                _logger.LogInformation("Pagamento atualizado com sucesso: {PaymentId}", paymentVO.Id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar pagamento: {PaymentId}", paymentVO.Id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE /api/v1/payment/{id} - Excluir pagamento
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeletePayment(long id)
        {
            try
            {
                _logger.LogInformation("Excluindo pagamento: {PaymentId}", id);
                
                var result = await _repository.DeletePayment(id);
                
                if (!result)
                {
                    _logger.LogWarning("Pagamento não encontrado: {PaymentId}", id);
                    return NotFound("Pagamento não encontrado");
                }

                _logger.LogInformation("Pagamento excluído com sucesso: {PaymentId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir pagamento: {PaymentId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }
    }
}
