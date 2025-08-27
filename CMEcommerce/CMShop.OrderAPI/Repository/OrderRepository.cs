using AutoMapper;
using CMShop.OrderAPI.Data.ValueObjects;
using CMShop.OrderAPI.Model;
using CMShop.OrderAPI.Model.Context;
using Microsoft.EntityFrameworkCore;

namespace CMShop.OrderAPI.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly SqlContext _context;
        private readonly IMapper _mapper;

        public OrderRepository(SqlContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<bool> AddOrder(OrderHeader header)
        {
            if (header == null) return false;
            _context.OrderHeaders.Add(header);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateOrderPaymentStatus(long orderHeaderId, bool status)
        {
            var header = await _context.OrderHeaders.FirstOrDefaultAsync(o => o.Id == orderHeaderId);
            if (header != null)
            {
                header.PaymentStatus = status;
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<OrderVO>> FindAllOrders()
        {
            var orderHeaders = await _context.OrderHeaders
                .Include(oh => oh.OrderDetails)
                .ToListAsync();

            return orderHeaders.Select(ConvertOrderHeaderToOrderVO);
        }

        public async Task<OrderVO?> FindOrderById(long id)
        {
            var orderHeader = await _context.OrderHeaders
                .Include(oh => oh.OrderDetails)
                .FirstOrDefaultAsync(oh => oh.Id == id);

            return orderHeader != null ? ConvertOrderHeaderToOrderVO(orderHeader) : null;
        }

        public async Task<IEnumerable<OrderVO>> FindOrdersByUserId(string userId)
        {
            var orderHeaders = await _context.OrderHeaders
                .Include(oh => oh.OrderDetails)
                .Where(oh => oh.UserId == userId)
                .ToListAsync();

            return orderHeaders.Select(ConvertOrderHeaderToOrderVO);
        }

        public async Task<OrderVO> CreateOrder(OrderVO orderVO)
        {
            try
            {
                var orderHeader = _mapper.Map<OrderHeader>(orderVO.OrderHeader);
                orderHeader.OrderTime = DateTime.UtcNow;
                orderHeader.PaymentStatus = false;

                // Adicionar o OrderHeader primeiro
                _context.OrderHeaders.Add(orderHeader);
                await _context.SaveChangesAsync();

                // Mapear os OrderDetails com o ID correto do OrderHeader
                foreach (var detailVO in orderVO.OrderDetails)
                {
                    var orderDetail = _mapper.Map<OrderDetail>(detailVO);
                    orderDetail.OrderHeaderId = orderHeader.Id;
                    _context.OrderDetails.Add(orderDetail);
                }

                await _context.SaveChangesAsync();

                // Retornar o pedido criado com todos os dados atualizados
                return await FindOrderById(orderHeader.Id) ?? orderVO;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao criar pedido: {ex.Message}", ex);
            }
        }

        public async Task<OrderVO?> UpdateOrder(OrderVO orderVO)
        {
            var existingOrder = await _context.OrderHeaders
                .Include(oh => oh.OrderDetails)
                .FirstOrDefaultAsync(oh => oh.Id == orderVO.OrderHeader.Id);

            if (existingOrder == null)
                return null;

            // Atualizar o header
            _mapper.Map(orderVO.OrderHeader, existingOrder);

            // Remover detalhes existentes
            _context.OrderDetails.RemoveRange(existingOrder.OrderDetails);

            // Adicionar novos detalhes
            foreach (var detailVO in orderVO.OrderDetails)
            {
                var orderDetail = _mapper.Map<OrderDetail>(detailVO);
                orderDetail.OrderHeaderId = existingOrder.Id;
                _context.OrderDetails.Add(orderDetail);
            }

            await _context.SaveChangesAsync();

            return await FindOrderById(existingOrder.Id);
        }

        public async Task<bool> DeleteOrder(long id)
        {
            var orderHeader = await _context.OrderHeaders
                .Include(oh => oh.OrderDetails)
                .FirstOrDefaultAsync(oh => oh.Id == id);

            if (orderHeader == null)
                return false;

            _context.OrderHeaders.Remove(orderHeader);
            await _context.SaveChangesAsync();
            return true;
        }

        private OrderVO ConvertOrderHeaderToOrderVO(OrderHeader orderHeader)
        {
            var orderHeaderVO = _mapper.Map<OrderHeaderVO>(orderHeader);
            var orderDetailsVO = _mapper.Map<ICollection<OrderDetailVO>>(orderHeader.OrderDetails);

            return new OrderVO
            {
                OrderHeader = orderHeaderVO,
                OrderDetails = orderDetailsVO
            };
        }
    }
}
