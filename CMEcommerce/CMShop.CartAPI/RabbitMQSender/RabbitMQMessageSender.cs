
using CMShop.CartAPI.Mensagens;
using CMShop.MessageBus;
using RabbitMQ.Client;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace CMShop.CartAPI.RabbitMQSender
{
    public class RabbitMQMessageSender : IRabbitMQMessageSender
    {
        private readonly string _hostName;
        private readonly string _passWord;
        private readonly string _userName;
        private IConnection _connection;

        public RabbitMQMessageSender()
        {
            _hostName = "localhost";
            _passWord = "guest";
            _userName = "guest";
        }

        public void SendMessage(BaseMessage message, string queueName)
        {
            var factory = new ConnectionFactory
            {
                HostName = _hostName,
                UserName = _userName,
                Password = _passWord
            };
            _connection = factory.CreateConnection();
            using var channel = _connection.CreateModel();
            channel.QueueDeclare(queue: queueName,
                                false,
                                false,
                                false,
                                arguments: null);

            byte[] body = GetMessageAsByteArray(message);
            channel.BasicPublish(exchange: "",
                                 routingKey: queueName,
                                 basicProperties: null,
                                 body: body);
        }

        private byte[] GetMessageAsByteArray(object baseMessage, BaseMessage message)
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
