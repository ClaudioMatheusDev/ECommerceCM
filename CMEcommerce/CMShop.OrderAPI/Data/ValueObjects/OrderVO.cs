namespace CMShop.OrderAPI.Data.ValueObjects
{
    public class OrderVO
    {
        public OrderHeaderVO OrderHeader { get; set; } = new OrderHeaderVO();
        public ICollection<OrderDetailVO> OrderDetails { get; set; } = new List<OrderDetailVO>();
    }
}
