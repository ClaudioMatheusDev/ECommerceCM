namespace CMShop.OrderAPI.Data.ValueObjects
{
    public class OrderHeaderVO
    {
        public long Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? CouponCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PurchaseAmount { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime OrderTime { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public string ExpiryMonthYear { get; set; } = string.Empty;
        public int CartTotalItems { get; set; }
        public bool PaymentStatus { get; set; }
        public List<OrderDetailVO> OrderDetails { get; set; } = new List<OrderDetailVO>();
    }
}
