using CMShop.OrderAPI.Data.ValueObjects;
using CMShop.OrderAPI.Model;

namespace CMShop.OrderAPI.Repository
{
    public interface IOrderRepository
    {
        Task<bool> AddOrder(OrderHeader header);
        Task<bool> UpdateOrderPaymentStatus(long orderId, bool paid);
        Task<IEnumerable<OrderVO>> FindAllOrders();
        Task<OrderVO?> FindOrderById(long id);
        Task<IEnumerable<OrderVO>> FindOrdersByUserId(string userId);
        Task<OrderVO> CreateOrder(OrderVO orderVO);
        Task<OrderVO?> UpdateOrder(OrderVO orderVO);
        Task<bool> DeleteOrder(long id);
    }
}
