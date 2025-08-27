using CMShop.MessageBus;
namespace CMShop.CartAPI.RabbitMQSender
{
    public interface IRabbitMQMessageSender
    {
        Task SendMessage(BaseMessage message, string queueName);
    }
}
