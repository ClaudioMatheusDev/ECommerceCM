using CMShop.CartAPI.Model.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMShop.CartAPI.Data.ValueObjects
{
    public class CartHeaderVO 
    {
        public long Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? CouponCode { get; set; }
    }
}
