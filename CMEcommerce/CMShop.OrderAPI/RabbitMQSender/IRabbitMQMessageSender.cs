using CMShop.MessageBus;
namespace CMShop.OrderAPI.RabbitMQSender
{
    public interface IRabbitMQMessageSender
    {
        Task SendMessage(BaseMessage message, string queueName);
    }
}
