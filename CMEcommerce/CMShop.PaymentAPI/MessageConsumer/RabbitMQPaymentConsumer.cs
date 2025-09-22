using CMShop.PaymentAPI.Mensagens;
using CMShop.PaymentAPI.RabbitMQSender;
using CMShop.PaymentProcessor;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CMShop.PaymentAPI.MessageConsumer
{
    public class RabbitMQPaymentConsumer : BackgroundService
    {
        private IConnection? _connection;
        private IChannel? _channel;
        private readonly IServiceProvider _serviceProvider;

        public RabbitMQPaymentConsumer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;

            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                UserName = "guest",
                Password = "guest"
            };
            _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
            _channel.QueueDeclareAsync(queue: "orderpaymentprocessqueue", false, false, false, arguments: null).GetAwaiter().GetResult();
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();
            var consumer = new AsyncEventingBasicConsumer(_channel!);
            consumer.ReceivedAsync += async (chanel, evt) =>
            {
                try
                {
                    var content = Encoding.UTF8.GetString(evt.Body.ToArray());
                    Console.WriteLine($"[RabbitMQPaymentConsumer] Mensagem recebida: {content}");
                    
                    PaymentMessage? vo = JsonSerializer.Deserialize<PaymentMessage>(content, 
                        new JsonSerializerOptions { 
                            PropertyNameCaseInsensitive = true 
                        });
                    
                    if (vo != null)
                    {
                        Console.WriteLine($"[RabbitMQPaymentConsumer] Mensagem desserializada com sucesso. OrderId: {vo.OrderId}");
                        await ProcessPayment(vo);
                    }
                    else
                    {
                        Console.WriteLine($"[RabbitMQPaymentConsumer] ERRO: Falha ao desserializar mensagem!");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RabbitMQPaymentConsumer] ERRO ao processar mensagem: {ex.Message}");
                    Console.WriteLine($"[RabbitMQPaymentConsumer] StackTrace: {ex.StackTrace}");
                }
                finally
                {
                    await _channel!.BasicAckAsync(evt.DeliveryTag, false);
                }
            };
            _channel!.BasicConsumeAsync("orderpaymentprocessqueue", false, consumer).GetAwaiter().GetResult();
            return Task.CompletedTask;
        }

        private Task ProcessPayment(PaymentMessage vo)
        {
            try
            {
                Console.WriteLine($"[ProcessPayment] Iniciando processamento de pagamento para OrderId: {vo.OrderId}");
                Console.WriteLine($"[ProcessPayment] Detalhes: Email={vo.Email}, Valor={vo.Amount:C}");
                
                using var scope = _serviceProvider.CreateScope();
                var processPayment = scope.ServiceProvider.GetRequiredService<IProcessPayment>();
                var rabbitMQMessageSender = scope.ServiceProvider.GetRequiredService<IRabbitMQMessageSender>();
                
                var result = processPayment.PaymentProcessor();
                var status = result ? "Approved" : "Rejected";
                
                Console.WriteLine($"[ProcessPayment] Resultado do processamento: {status}");

                UpdatePaymentResultMessage paymentResult = new()
                {
                    Status = status,
                    OrderId = vo.OrderId,
                    Email = vo.Email,
                    MessageCreated = DateTime.Now
                };

                try
                {
                    Console.WriteLine($"[ProcessPayment] Enviando resultado para fila orderpaymentresultqueue");
                    Console.WriteLine($"[ProcessPayment] Detalhes do resultado: OrderId={paymentResult.OrderId}, Status={paymentResult.Status}");
                    rabbitMQMessageSender.SendMessage(paymentResult, "orderpaymentresultqueue");
                    Console.WriteLine($"[ProcessPayment] Resultado enviado com sucesso!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ProcessPayment] Erro ao enviar resultado: {ex.Message}");
                    Console.WriteLine($"[ProcessPayment] StackTrace: {ex.StackTrace}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProcessPayment] Erro geral no processamento: {ex.Message}");
                Console.WriteLine($"[ProcessPayment] StackTrace: {ex.StackTrace}");
            }

            return Task.CompletedTask;
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            try
            {
                if (_channel != null)
                {
                    await _channel.CloseAsync();
                }
                if (_connection != null)
                {
                    await _connection.CloseAsync();
                }
            }
            catch (Exception)
            {
                // Log error
            }
            await base.StopAsync(stoppingToken);
        }

        public override void Dispose()
        {
            try
            {
                _channel?.Dispose();
                _connection?.Dispose();
            }
            catch (Exception)
            {
                // Log error
            }
            base.Dispose();
        }
    }
}
