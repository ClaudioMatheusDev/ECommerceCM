namespace CMShop.OrderAPI.Data.ValueObjects
{
    public class OrderDetailVO
    {
        public long Id { get; set; }
        public long OrderHeaderId { get; set; }
        public long ProductId { get; set; }
        public int Count { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
