using CMShop.MessageBus;
using CMShop.PaymentAPI.Data.ValueObjects;
using CMShop.PaymentAPI.Mensagens;
using CMShop.PaymentAPI.Repository;

namespace CMShop.PaymentAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repository;
        private readonly IMessageBus _messageBus;

        public PaymentService(IPaymentRepository repository, IMessageBus messageBus)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _messageBus = messageBus ?? throw new ArgumentNullException(nameof(messageBus));
        }

        public async Task<IEnumerable<PaymentVO>> FindAllPayments()
        {
            return await _repository.FindAllPayments();
        }

        public async Task<PaymentVO> FindPaymentById(long id)
        {
            return await _repository.FindPaymentById(id);
        }

        public async Task<PaymentVO> CreatePayment(PaymentVO paymentVO)
        {
            return await _repository.CreatePayment(paymentVO);
        }

        public async Task<bool> ProcessPayment(PaymentVO paymentVO)
        {
            try
            {
                // Simular processamento
                paymentVO.Status = "Processado";
                paymentVO.TransactionId = Guid.NewGuid().ToString();
                
                await _repository.UpdatePayment(paymentVO);

                // Publicar resultado do pagamento
                var updatePaymentResultMessage = new UpdatePaymentResultMessage
                {
                    Status = paymentVO.Status,
                    OrderId = paymentVO.OrderId,
                    Email = paymentVO.Email
                };

                const string queueName = "updatepaymentresult";
                await _messageBus.PublicMessage(updatePaymentResultMessage, queueName);

                return true;
            }
            catch (Exception)
            {
                paymentVO.Status = "Falhou";
                await _repository.UpdatePayment(paymentVO);
                
                var updatePaymentResultMessage = new UpdatePaymentResultMessage
                {
                    Status = paymentVO.Status,
                    OrderId = paymentVO.OrderId,
                    Email = paymentVO.Email
                };

                const string queueName = "updatepaymentresult";
                await _messageBus.PublicMessage(updatePaymentResultMessage, queueName);

                return false;
            }
        }
    }
}
