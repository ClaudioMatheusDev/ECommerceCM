using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CMShop.MessageBus
{
    public class MessageBus : IMessageBus
    {
        private readonly string _hostName;
        private readonly string _userName;
        private readonly string _password;

        public MessageBus()
        {
            _hostName = "localhost";
            _userName = "guest";
            _password = "guest";
        }

        public async Task PublicMessage(BaseMessage message, string queueName)
        {
            IConnection? connection = null;
            try
            {
                Console.WriteLine($"[MessageBus] Enviando mensagem para fila: {queueName}");
                
                var factory = new ConnectionFactory
                {
                    HostName = _hostName,
                    UserName = _userName,
                    Password = _password
                };

                connection = factory.CreateConnection();
                Console.WriteLine($"[MessageBus] Conexão criada");

                using var channel = connection.CreateModel();
                Console.WriteLine($"[MessageBus] Canal criado");

                channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                Console.WriteLine($"[MessageBus] Fila '{queueName}' declarada");

                byte[] body = GetMessageAsByteArray(message);
                channel.BasicPublish(
                    exchange: "",
                    routingKey: queueName,
                    basicProperties: null,
                    body: body);
                
                Console.WriteLine($"[MessageBus] ✅ Mensagem enviada para fila '{queueName}'");
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MessageBus] ❌ Erro ao enviar mensagem: {ex.Message}");
                Console.WriteLine($"[MessageBus] StackTrace: {ex.StackTrace}");
                throw;
            }
            finally
            {
                connection?.Close();
            }
        }

        private byte[] GetMessageAsByteArray(BaseMessage message)
        {
            var options = new JsonSerializerOptions
            {
                WriteIndented = true
            };
            var json = JsonSerializer.Serialize<object>(message, options);
            Console.WriteLine($"[MessageBus] Mensagem serializada: {json}");
            return Encoding.UTF8.GetBytes(json);
        }
    }
}
