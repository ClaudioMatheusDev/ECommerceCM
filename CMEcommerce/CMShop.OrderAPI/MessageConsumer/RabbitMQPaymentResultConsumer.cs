using CMShop.OrderAPI.Mensagens;
using CMShop.OrderAPI.Repository;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CMShop.OrderAPI.MessageConsumer
{
    public class RabbitMQPaymentResultConsumer : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQPaymentResultConsumer(IServiceProvider serviceProvider)
        {
            Console.WriteLine("[RabbitMQ PaymentResult] Inicializando RabbitMQPaymentResultConsumer...");
            _serviceProvider = serviceProvider;
            
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = "localhost",
                    UserName = "guest",
                    Password = "guest"
                };
                
                Console.WriteLine("[RabbitMQ PaymentResult] Criando conexão com RabbitMQ...");
                _connection = factory.CreateConnectionAsync().Result;
                Console.WriteLine("[RabbitMQ PaymentResult] Conexão criada com sucesso!");
                
                Console.WriteLine("[RabbitMQ PaymentResult] Criando canal...");
                _channel = _connection.CreateChannelAsync().Result;
                Console.WriteLine("[RabbitMQ PaymentResult] Canal criado com sucesso!");
                
                Console.WriteLine("[RabbitMQ PaymentResult] Declarando fila orderpaymentresultqueue...");
                _channel.QueueDeclareAsync(queue: "orderpaymentresultqueue",
                                         durable: false,
                                         exclusive: false,
                                         autoDelete: false,
                                         arguments: null);
                Console.WriteLine("[RabbitMQ PaymentResult] Fila declarada com sucesso!");
                Console.WriteLine("[RabbitMQ PaymentResult] RabbitMQPaymentResultConsumer inicializado com sucesso!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ PaymentResult] ERRO na inicialização: {ex.Message}");
                Console.WriteLine($"[RabbitMQ PaymentResult] Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[RabbitMQ PaymentResult] ExecuteAsync iniciado!");
            stoppingToken.ThrowIfCancellationRequested();

            try
            {
                Console.WriteLine("[RabbitMQ PaymentResult] Criando consumer...");
                var consumer = new AsyncEventingBasicConsumer(_channel!);
                Console.WriteLine("[RabbitMQ PaymentResult] Consumer criado!");
                
                consumer.ReceivedAsync += async (_channel, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var message = Encoding.UTF8.GetString(body);
                        
                        Console.WriteLine($"[RabbitMQ PaymentResult] 📨 Mensagem de resultado de pagamento recebida: {message}");
                        
                        var paymentResult = JsonSerializer.Deserialize<UpdatePaymentResultMessage>(message);
                        if (paymentResult != null)
                        {
                            Console.WriteLine($"[RabbitMQ PaymentResult] Processando resultado do pagamento para pedido: {paymentResult.OrderId}");
                            Console.WriteLine($"[RabbitMQ PaymentResult] Status: {paymentResult.Status}");
                            Console.WriteLine($"[RabbitMQ PaymentResult] Email: {paymentResult.Email}");
                            
                            await ProcessPaymentResult(paymentResult);
                            Console.WriteLine($"[RabbitMQ PaymentResult] ✅ Resultado processado com sucesso!");
                        }
                        else
                        {
                            Console.WriteLine($"[RabbitMQ PaymentResult] ❌ ERRO: Não foi possível deserializar a mensagem");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[RabbitMQ PaymentResult] ❌ ERRO ao processar mensagem: {ex.Message}");
                        Console.WriteLine($"[RabbitMQ PaymentResult] StackTrace: {ex.StackTrace}");
                    }
                };

                await _channel!.BasicConsumeAsync(queue: "orderpaymentresultqueue",
                                               autoAck: true,
                                               consumer: consumer);
                
                Console.WriteLine("[RabbitMQ PaymentResult] ✅ Consumer registrado! Aguardando resultados de pagamento...");

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ PaymentResult] ❌ ERRO FATAL no ExecuteAsync: {ex.Message}");
                Console.WriteLine($"[RabbitMQ PaymentResult] StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        private async Task ProcessPaymentResult(UpdatePaymentResultMessage paymentResult)
        {
            try
            {
                Console.WriteLine($"[ProcessPaymentResult] Iniciando processamento do resultado para pedido: {paymentResult.OrderId}");
                
                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

                Console.WriteLine($"[ProcessPaymentResult] Repository obtido com sucesso");

                // Converter string para bool
                bool paymentStatus = paymentResult.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase);
                
                Console.WriteLine($"[ProcessPaymentResult] Status convertido: '{paymentResult.Status}' -> {paymentStatus}");
                
                // Atualizar o status do pagamento no pedido
                var success = await repository.UpdateOrderPaymentStatus(paymentResult.OrderId, paymentStatus);
                
                if (success)
                {
                    Console.WriteLine($"[ProcessPaymentResult] ✅ Status do pagamento atualizado com sucesso para pedido {paymentResult.OrderId}");
                    Console.WriteLine($"[ProcessPaymentResult] ✅ Pagamento {(paymentStatus ? "APROVADO" : "REJEITADO")}");
                }
                else
                {
                    Console.WriteLine($"[ProcessPaymentResult] ❌ ERRO: Falha ao atualizar status do pagamento para pedido {paymentResult.OrderId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProcessPaymentResult] ❌ EXCEÇÃO: {ex.Message}");
                Console.WriteLine($"[ProcessPaymentResult] StackTrace: {ex.StackTrace}");
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[RabbitMQ PaymentResult] Parando RabbitMQPaymentResultConsumer...");
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
                Console.WriteLine("[RabbitMQ PaymentResult] ✅ Consumer parado com sucesso");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ PaymentResult] ❌ Erro ao parar consumer: {ex.Message}");
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
                Console.WriteLine($"[RabbitMQ PaymentResult] ❌ Erro ao fazer dispose: {ex.Message}");
            }
            base.Dispose();
        }
    }
}
