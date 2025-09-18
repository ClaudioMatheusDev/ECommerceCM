using CMShop.MessageBus;
using System.Text.Json.Serialization;

namespace CMShop.PaymentAPI.Mensagens
{
    public class UpdatePaymentResultMessage : BaseMessage
    {
        [JsonPropertyName("orderId")]
        public long OrderId { get; set; }
        
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
        
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
    }
}
