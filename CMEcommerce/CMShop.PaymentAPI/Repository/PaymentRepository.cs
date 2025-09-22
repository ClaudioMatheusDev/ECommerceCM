using AutoMapper;
using CMShop.PaymentAPI.Data.ValueObjects;
using CMShop.PaymentAPI.Model;
using CMShop.PaymentAPI.Model.Context;
using Microsoft.EntityFrameworkCore;

namespace CMShop.PaymentAPI.Repository
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly SqlContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<PaymentRepository> _logger;

        public PaymentRepository(SqlContext context, IMapper mapper, ILogger<PaymentRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<PaymentVO>> FindAllPayments()
        {
            _logger.LogInformation("Buscando todos os pagamentos");

            var payments = await _context.Payments.ToListAsync();
            return _mapper.Map<IEnumerable<PaymentVO>>(payments);
        }

        public async Task<PaymentVO?> FindPaymentById(long id)
        {
            _logger.LogInformation("Buscando pagamento pelo ID: {PaymentId}", id);

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == id);
            if (payment == null)
            {
                _logger.LogWarning("Pagamento não encontrado pelo ID: {PaymentId}", id);
                return null;
            }

            return _mapper.Map<PaymentVO>(payment);
        }

        public async Task<IEnumerable<PaymentVO>> FindPaymentsByOrderId(long orderId)
        {
            _logger.LogInformation("Buscando pagamentos pelo OrderId: {OrderId}", orderId);

            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PaymentVO>>(payments);
        }

        public async Task<IEnumerable<PaymentVO>> FindPaymentsByUserId(string userId)
        {
            _logger.LogInformation("Buscando pagamentos pelo UserId: {UserId}", userId);

            var payments = await _context.Payments
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PaymentVO>>(payments);
        }

        public async Task<PaymentVO> CreatePayment(PaymentVO paymentVO)
        {
            _logger.LogInformation("Criando novo pagamento para o pedido: {OrderId}", paymentVO.OrderId);

            var payment = _mapper.Map<Payment>(paymentVO);

            // Configurar data do pagamento
            payment.PaymentDate = DateTime.Now;

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Pagamento criado com sucesso. ID: {PaymentId}", payment.Id);

            return _mapper.Map<PaymentVO>(payment);
        }

        public async Task<PaymentVO?> UpdatePayment(PaymentVO paymentVO)
        {
            _logger.LogInformation("Atualizando pagamento. ID: {PaymentId}", paymentVO.Id);

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == paymentVO.Id);
            if (payment == null)
            {
                _logger.LogWarning("Pagamento não encontrado para atualização. ID: {PaymentId}", paymentVO.Id);
                return null;
            }

            // Atualizar propriedades
            _mapper.Map(paymentVO, payment);

            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Pagamento atualizado com sucesso. ID: {PaymentId}", payment.Id);

            return _mapper.Map<PaymentVO>(payment);
        }

        public async Task<bool> DeletePayment(long id)
        {
            _logger.LogInformation("Excluindo pagamento. ID: {PaymentId}", id);

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == id);
            if (payment == null)
            {
                _logger.LogWarning("Pagamento não encontrado para exclusão. ID: {PaymentId}", id);
                return false;
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Pagamento excluído com sucesso. ID: {PaymentId}", id);

            return true;
        }

        public async Task<bool> ProcessPayment(PaymentVO paymentVO)
        {
            _logger.LogInformation("Processando pagamento para o pedido: {OrderId}", paymentVO.OrderId);

            try
            {
                // Simulando o processamento do pagamento
                paymentVO.Status = "Approved";
                paymentVO.TransactionId = Guid.NewGuid().ToString();

                // Criar o registro de pagamento
                await CreatePayment(paymentVO);

                _logger.LogInformation("Pagamento processado com sucesso para o pedido: {OrderId}", paymentVO.OrderId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar pagamento para o pedido: {OrderId}", paymentVO.OrderId);
                return false;
            }
        }
    }
}
