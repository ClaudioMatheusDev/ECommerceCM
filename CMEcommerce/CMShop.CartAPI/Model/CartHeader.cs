using CMShop.CartAPI.Model.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMShop.CartAPI.Model
{
    [Table("Cart_Header")]
    public class CartHeader : BaseEntity
    {
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;
        [Column("coupon_code")]
        public string? CouponCode { get; set; }
    }
}
