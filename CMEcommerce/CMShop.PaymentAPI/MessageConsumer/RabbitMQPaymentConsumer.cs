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
                var content = Encoding.UTF8.GetString(evt.Body.ToArray());
                PaymentMessage? vo = JsonSerializer.Deserialize<PaymentMessage>(content);
                if (vo != null)
                {
                    await ProcessPayment(vo);
                }
                await _channel!.BasicAckAsync(evt.DeliveryTag, false);
            };
            _channel!.BasicConsumeAsync("orderpaymentprocessqueue", false, consumer).GetAwaiter().GetResult();
            return Task.CompletedTask;
        }

        private Task ProcessPayment(PaymentMessage vo)
        {
            using var scope = _serviceProvider.CreateScope();
            var processPayment = scope.ServiceProvider.GetRequiredService<IProcessPayment>();
            var rabbitMQMessageSender = scope.ServiceProvider.GetRequiredService<IRabbitMQMessageSender>();
            
            var result = processPayment.PaymentProcessor();

            UpdatePaymentResultMessage paymentResult = new()
            {
                Status = result ? "Approved" : "Rejected",
                OrderId = vo.OrderId,
                Email = vo.Email
            };

            try
            {
                rabbitMQMessageSender.SendMessage(paymentResult, "orderpaymentresultqueue");
            }
            catch (Exception)
            {
                //Log
                throw;
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
