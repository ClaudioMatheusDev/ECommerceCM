using CMShop.MessageBus;
using CMShop.OrderAPI.Mensagens;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CMShop.OrderAPI.RabbitMQSender
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
            try
            {
                Console.WriteLine($"[RabbitMQ] Iniciando envio de mensagem para fila: {queueName}");
                
                var factory = new ConnectionFactory
                {
                    HostName = _hostName,
                    UserName = _userName,
                    Password = _passWord
                };
                
                Console.WriteLine($"[RabbitMQ] Conectando ao RabbitMQ em {_hostName}...");
                _connection = await factory.CreateConnectionAsync();
                
                Console.WriteLine($"[RabbitMQ] Conexão estabelecida. Criando canal...");
                using var channel = await _connection.CreateChannelAsync();
                
                Console.WriteLine($"[RabbitMQ] Declarando fila: {queueName}");
                await channel.QueueDeclareAsync(queue: queueName,
                                              durable: false,
                                              exclusive: false,
                                              autoDelete: false,
                                              arguments: null);

                byte[] body = GetMessageAsByteArray(message);
                Console.WriteLine($"[RabbitMQ] Mensagem serializada. Tamanho: {body.Length} bytes");
                
                await channel.BasicPublishAsync(exchange: "",
                                               routingKey: queueName,
                                               body: body);
                
                Console.WriteLine($"[RabbitMQ] ✅ Mensagem enviada com sucesso para fila '{queueName}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] ❌ Erro ao enviar mensagem: {ex.Message}");
                Console.WriteLine($"[RabbitMQ] StackTrace: {ex.StackTrace}");
                throw;
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
    }
}
