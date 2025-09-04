using AutoMapper;
using CMShop.PaymentAPI.Data.ValueObjects;
using CMShop.PaymentAPI.Mensagens;
using CMShop.PaymentAPI.Repository;
using CMShop.PaymentAPI.Services;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CMShop.PaymentAPI.MessageConsumer
{
    public class RabbitMQPaymentConsumer : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;
        private const string ExchangeName = "DirectPaymentUpdateExchange";
        private const string PaymentProcessQueue = "paymentprocessqueue";

        public RabbitMQPaymentConsumer(IServiceProvider serviceProvider)
        {
            Console.WriteLine("[RabbitMQ Payment] Inicializando RabbitMQPaymentConsumer...");
            _serviceProvider = serviceProvider;
            InitializeRabbitMQ().GetAwaiter().GetResult();
        }

        private async Task InitializeRabbitMQ()
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = "localhost",
                    Port = 5672,
                    UserName = "guest",
                    Password = "guest"
                };
                
                Console.WriteLine("[RabbitMQ Payment] Criando conexão com RabbitMQ...");
                _connection = await factory.CreateConnectionAsync();
                _channel = await _connection.CreateChannelAsync();
                
                Console.WriteLine("[RabbitMQ Payment] Declarando exchange e fila...");
                await _channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Direct, durable: false);
                await _channel.QueueDeclareAsync(queue: PaymentProcessQueue, durable: false, exclusive: false, autoDelete: false, arguments: null);
                await _channel.QueueBindAsync(queue: PaymentProcessQueue, exchange: ExchangeName, routingKey: "PaymentProcessing");
                
                Console.WriteLine("[RabbitMQ Payment] ✅ RabbitMQPaymentConsumer inicializado com sucesso");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ Payment] ❌ Erro ao inicializar RabbitMQ: {ex.Message}");
                throw;
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[RabbitMQ Payment] Iniciando consumo de mensagens...");
            stoppingToken.ThrowIfCancellationRequested();

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (ch, ea) =>
            {
                try
                {
                    Console.WriteLine("[RabbitMQ Payment] 📨 Mensagem recebida");
                    var content = Encoding.UTF8.GetString(ea.Body.ToArray());
                    Console.WriteLine($"[RabbitMQ Payment] Conteúdo: {content}");

                    var paymentMessage = JsonSerializer.Deserialize<PaymentMessage>(content);
                    if (paymentMessage != null)
                    {
                        Console.WriteLine($"[RabbitMQ Payment] Processando pagamento para pedido: {paymentMessage.OrderId}");
                        
                        using (var scope = _serviceProvider.CreateScope())
                        {
                            var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();
                            var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
                            
                            var paymentVO = mapper.Map<PaymentVO>(paymentMessage);
                            paymentVO.PaymentDate = DateTime.Now;
                            paymentVO.Status = "Pendente";
                            paymentVO.Email = paymentMessage.UserId; // Usar UserId como email temporário
                            
                            var success = await paymentService.ProcessPayment(paymentVO);
                            Console.WriteLine($"[RabbitMQ Payment] Resultado: {(success ? "✅ Sucesso" : "❌ Falhou")}");
                        }
                    }

                    await _channel.BasicAckAsync(ea.DeliveryTag, false);
                    Console.WriteLine("[RabbitMQ Payment] ✅ Mensagem processada e confirmada");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RabbitMQ Payment] ❌ Erro ao processar mensagem: {ex.Message}");
                    Console.WriteLine($"[RabbitMQ Payment] StackTrace: {ex.StackTrace}");
                    await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
                }
            };

            await _channel.BasicConsumeAsync(PaymentProcessQueue, false, consumer);
            Console.WriteLine($"[RabbitMQ Payment] ✅ Consumer registrado na fila '{PaymentProcessQueue}'");

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[RabbitMQ Payment] Parando RabbitMQPaymentConsumer...");
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
                Console.WriteLine("[RabbitMQ Payment] ✅ Consumer parado com sucesso");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ Payment] ❌ Erro ao parar consumer: {ex.Message}");
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
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ Payment] ❌ Erro ao fazer dispose: {ex.Message}");
            }
            base.Dispose();
        }
    }
}
