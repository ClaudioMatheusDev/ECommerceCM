using CMShop.PaymentAPI.Data.ValueObjects;

namespace CMShop.PaymentAPI.Repository
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<PaymentVO>> FindAllPayments();
        Task<PaymentVO?> FindPaymentById(long id);
        Task<IEnumerable<PaymentVO>> FindPaymentsByOrderId(long orderId);
        Task<IEnumerable<PaymentVO>> FindPaymentsByUserId(string userId);
        Task<PaymentVO> CreatePayment(PaymentVO paymentVO);
        Task<PaymentVO?> UpdatePayment(PaymentVO paymentVO);
        Task<bool> DeletePayment(long id);
        Task<bool> ProcessPayment(PaymentVO paymentVO);
    }
}
