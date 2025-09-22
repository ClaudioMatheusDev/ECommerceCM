using CMShop.PaymentAPI.Data.ValueObjects;

namespace CMShop.PaymentAPI.Services
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentVO>> FindAllPayments();
        Task<PaymentVO> FindPaymentById(long id);
        Task<PaymentVO> CreatePayment(PaymentVO paymentVO);
        Task<bool> ProcessPayment(PaymentVO paymentVO);
    }
}
