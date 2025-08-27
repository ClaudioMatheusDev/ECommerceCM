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
            _serviceProvider = serviceProvider;
            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                UserName = "guest",
                Password = "guest"
            };
            _connection = factory.CreateConnectionAsync().Result;
            _channel = _connection.CreateChannelAsync().Result;
            _channel.QueueDeclareAsync(queue: "checkoutqueue",
                                     durable: false,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (_channel, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                CheckoutHeaderVO? vo = JsonSerializer.Deserialize<CheckoutHeaderVO>(message);
                if (vo != null)
                {
                    await ProcessorOrder(vo);
                }
                await Task.CompletedTask;
            };

            await _channel.BasicConsumeAsync(queue: "checkoutqueue",
                                           autoAck: true,
                                           consumer: consumer);

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task ProcessorOrder(CheckoutHeaderVO vo)
        {
            using var scope = _serviceProvider.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

            OrderHeader order = new()
            {
                UserId = vo.UserID,
                FirstName = vo.FirstName,
                LastName = vo.LastName,
                OrderDetails = new List<OrderDetail>(),
                CardNumber = vo.CardNumber,
                CouponCode = vo.CouponCode,
                CVV = vo.CVV,
                DiscountAmount = vo.DiscountAmount,
                Email = vo.Email,
                ExpiryMonthYear = vo.ExpiryMonthYear,
                OrderTime = DateTime.Now,
                PaymentStatus = false,
                Phone = vo.Phone
            };

            foreach (var detail in vo.CartDetails)
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
            }
            await repository.AddOrder(order);
        }

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
