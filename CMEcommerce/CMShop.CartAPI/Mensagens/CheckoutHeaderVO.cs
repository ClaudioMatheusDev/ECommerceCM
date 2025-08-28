using CMShop.CartAPI.Data.ValueObjects;
using CMShop.MessageBus;
using System.ComponentModel.DataAnnotations;

namespace CMShop.CartAPI.Mensagens
{
    public class CheckoutHeaderVO : BaseMessage
    {
        [Required]
        public required string UserID { get; set; }
        public string? CouponCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PurchaseAmount { get; set; }
        [Required]
        public required string FirstName { get; set; }
        [Required]
        public required string LastName { get; set; }
        public DateTime DateTime { get; set; }
        [Required]
        public required string Phone { get; set; }
        [Required]
        public required string Email { get; set; }
        [Required]
        public required string CardNumber { get; set; }
        [Required]
        public required string CVV { get; set; }
        [Required]
        public required string ExpiryMonthYear { get; set; }
        public int CartTotalItems { get; set; }
        
        public IEnumerable<CartDetailVO>? CartDetails { get; set; }
    }
}
