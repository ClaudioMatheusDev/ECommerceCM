
using CMShop.CartAPI.Mensagens;
using CMShop.MessageBus;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CMShop.CartAPI.RabbitMQSender
{
    public class RabbitMQMessageSender : IRabbitMQMessageSender
    {
        private readonly string _hostName;
        private readonly string _passWord;
        private readonly string _userName;
        private IConnection? _connection;

        public RabbitMQMessageSender()
        {
            _hostName = "localhost";
            _passWord = "guest";
            _userName = "guest";
        }

        public async Task SendMessage(BaseMessage message, string queueName)
        {
            var factory = new ConnectionFactory
            {
                HostName = _hostName,
                UserName = _userName,
                Password = _passWord
            };
            _connection = await factory.CreateConnectionAsync();
            using var channel = await _connection.CreateChannelAsync();
            await channel.QueueDeclareAsync(queue: queueName,
                                          durable: false,
                                          exclusive: false,
                                          autoDelete: false,
                                          arguments: null);

            byte[] body = GetMessageAsByteArray(message);
            await channel.BasicPublishAsync(exchange: "",
                                           routingKey: queueName,
                                           body: body);
        }

        private byte[] GetMessageAsByteArray(BaseMessage message)
        {
            var options = new JsonSerializerOptions
            {
               WriteIndented = true
            };

            var json = JsonSerializer.Serialize<CheckoutHeaderVO>((CheckoutHeaderVO)message, options);
            var body = Encoding.UTF8.GetBytes(json);
            return body;
        }
    }
}
