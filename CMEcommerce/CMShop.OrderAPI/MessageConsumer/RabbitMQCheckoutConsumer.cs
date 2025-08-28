using CMShop.OrderAPI.Mensagens;
using CMShop.OrderAPI.Model;
using CMShop.OrderAPI.Repository;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CMShop.OrderAPI.MessageConsumer
{
    public class RabbitMQCheckoutConsumer : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private IConnection _connection;
        private IChannel _channel;

        public RabbitMQCheckoutConsumer(IServiceProvider serviceProvider)
        {
            Console.WriteLine("[RabbitMQ] Inicializando RabbitMQCheckoutConsumer...");
            _serviceProvider = serviceProvider;
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = "localhost",
                    UserName = "guest",
                    Password = "guest"
                };
                Console.WriteLine("[RabbitMQ] Criando conexão com RabbitMQ...");
                _connection = factory.CreateConnectionAsync().Result;
                Console.WriteLine("[RabbitMQ] Conexão criada com sucesso!");
                
                Console.WriteLine("[RabbitMQ] Criando canal...");
                _channel = _connection.CreateChannelAsync().Result;
                Console.WriteLine("[RabbitMQ] Canal criado com sucesso!");
                
                Console.WriteLine("[RabbitMQ] Declarando fila checkoutqueue...");
                _channel.QueueDeclareAsync(queue: "checkoutqueue",
                                         durable: false,
                                         exclusive: false,
                                         autoDelete: false,
                                         arguments: null);
                Console.WriteLine("[RabbitMQ] Fila declarada com sucesso!");
                Console.WriteLine("[RabbitMQ] RabbitMQCheckoutConsumer inicializado com sucesso!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] ERRO na inicialização: {ex.Message}");
                Console.WriteLine($"[RabbitMQ] Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[RabbitMQ] ExecuteAsync iniciado!");
            stoppingToken.ThrowIfCancellationRequested();

            try
            {
                Console.WriteLine("[RabbitMQ] Criando consumer...");
                var consumer = new AsyncEventingBasicConsumer(_channel);
                Console.WriteLine("[RabbitMQ] Consumer criado!");
                
                consumer.ReceivedAsync += async (_channel, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    
                    Console.WriteLine($"[RabbitMQ] Mensagem recebida: {message}");
                    
                    CheckoutHeaderVO? vo = JsonSerializer.Deserialize<CheckoutHeaderVO>(message);
                    if (vo != null)
                    {
                        Console.WriteLine($"[RabbitMQ] Processando pedido para usuário: {vo.UserID}");
                        Console.WriteLine($"[RabbitMQ] ExpiryMonthYear recebido: '{vo.ExpiryMonthYear ?? "NULL"}'");
                        Console.WriteLine($"[RabbitMQ] CardNumber recebido: '{vo.CardNumber ?? "NULL"}'");
                        Console.WriteLine($"[RabbitMQ] CVV recebido: '{vo.CVV ?? "NULL"}'");
                        await ProcessorOrder(vo);
                        Console.WriteLine($"[RabbitMQ] Pedido processado com sucesso!");
                    }
                    else
                    {
                        Console.WriteLine($"[RabbitMQ] ERRO: Não foi possível deserializar a mensagem");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RabbitMQ] ERRO ao processar mensagem: {ex.Message}");
                    Console.WriteLine($"[RabbitMQ] StackTrace: {ex.StackTrace}");
                }
                await Task.CompletedTask;
            };

                await _channel.BasicConsumeAsync(queue: "checkoutqueue",
                                               autoAck: true,
                                               consumer: consumer);
                
                Console.WriteLine("[RabbitMQ] Consumer registrado! Aguardando mensagens...");

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] ERRO FATAL no ExecuteAsync: {ex.Message}");
                Console.WriteLine($"[RabbitMQ] StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        private async Task ProcessorOrder(CheckoutHeaderVO vo)
        {
            try
            {
                Console.WriteLine($"[ProcessorOrder] Iniciando processamento para usuário: {vo.UserID}");
                
                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

                Console.WriteLine($"[ProcessorOrder] Repository obtido com sucesso");

                OrderHeader order = new()
                {
                    UserId = vo.UserID,
                    FirstName = vo.FirstName ?? "Cliente",
                    LastName = vo.LastName ?? "",
                    OrderDetails = new List<OrderDetail>(),
                    CardNumber = vo.CardNumber ?? "****-****-****-****",
                    CouponCode = vo.CouponCode ?? "",
                    CVV = vo.CVV ?? "***",
                    DiscountAmount = vo.DiscountAmount,
                    Email = vo.Email ?? "cliente@email.com",
                    ExpiryMonthYear = vo.ExpiryMonthYear ?? "12/25",
                    OrderTime = DateTime.Now,
                    PaymentStatus = false,
                    Phone = vo.Phone ?? "000-000-0000",
                    PurchaseAmount = vo.PurchaseAmount,
                    CartTotalItems = vo.CartTotalItems
                };

                Console.WriteLine($"[ProcessorOrder] OrderHeader criado. CartDetails count: {vo.CartDetails?.Count() ?? 0}");

                foreach (var detail in vo.CartDetails ?? new List<CartDetailVO>())
                {
                    OrderDetail orderDetail = new()
                    {
                        ProductId = detail.ProductId,
                        ProductName = detail.Product?.Name ?? "Produto",
                        Price = detail.Product?.Price ?? 0,
                        Count = detail.Count
                    };
                    order.CartTotalItems += detail.Count;
                    order.OrderDetails.Add(orderDetail);
                    
                    Console.WriteLine($"[ProcessorOrder] Adicionado item: {orderDetail.ProductName}, Quantidade: {orderDetail.Count}");
                }
                
                Console.WriteLine($"[ProcessorOrder] Total de itens: {order.CartTotalItems}");
                Console.WriteLine($"[ProcessorOrder] Chamando repository.AddOrder...");
                
                var result = await repository.AddOrder(order);
                
                Console.WriteLine($"[ProcessorOrder] Resultado AddOrder: {result}");
                
                if (result)
                {
                    Console.WriteLine($"[ProcessorOrder] ✅ Pedido salvo com sucesso no banco de dados!");
                }
                else
                {
                    Console.WriteLine($"[ProcessorOrder] ❌ ERRO: AddOrder retornou false");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProcessorOrder] ❌ EXCEÇÃO: {ex.Message}");
                Console.WriteLine($"[ProcessorOrder] StackTrace: {ex.StackTrace}");
            }
        }

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
