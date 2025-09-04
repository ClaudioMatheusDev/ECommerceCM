using CMShop.MessageBus;

namespace CMShop.PaymentAPI.Mensagens
{
    public class UpdatePaymentResultMessage : BaseMessage
    {
        public long OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
