using CMShop.MessageBus;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CMShop.PaymentAPI.RabbitMQSender
{
    public class RabbitMQMessageSender : IRabbitMQMessageSender
    {
        private readonly string _hostName;
        private readonly string _password;
        private readonly string _userName;
        private IConnection? _connection;

        public RabbitMQMessageSender()
        {
            _hostName = "localhost";
            _password = "guest";
            _userName = "guest";
        }

        public void SendMessage(BaseMessage message, string queueName)
        {
            if (ConnectionExists())
            {
                using var channel = _connection!.CreateChannelAsync().GetAwaiter().GetResult();
                channel.QueueDeclareAsync(queue: queueName, false, false, false, arguments: null).GetAwaiter().GetResult();
                byte[] body = GetMessageAsByteArray(message);
                channel.BasicPublishAsync(exchange: "", routingKey: queueName, body: body).GetAwaiter().GetResult();
            }
        }

        private byte[] GetMessageAsByteArray(BaseMessage message)
        {
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };
            
            Console.WriteLine($"[RabbitMQSender] Serializando mensagem tipo: {message.GetType().Name}");
            var json = JsonSerializer.Serialize(message, message.GetType(), options);
            Console.WriteLine($"[RabbitMQSender] JSON: {json}");
            
            var body = Encoding.UTF8.GetBytes(json);
            return body;
        }

        private bool ConnectionExists()
        {
            if (_connection != null) return true;
            CreateConnection();
            return _connection != null;
        }

        private void CreateConnection()
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _hostName,
                    UserName = _userName,
                    Password = _password
                };
                _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            }
            catch (Exception)
            {
                //Log exception
                throw;
            }
        }

        public void Dispose()
        {
            if (_connection?.IsOpen == true)
            {
                _connection.CloseAsync().GetAwaiter().GetResult();
                _connection.Dispose();
            }
        }
    }
}
