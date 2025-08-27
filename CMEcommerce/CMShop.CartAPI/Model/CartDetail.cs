using CMShop.CartAPI.Model.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMShop.CartAPI.Model
{
    [Table("cart_Detail")]
    public class CartDetail : BaseEntity
    {
        public long CartHeaderId { get; set; }

        [ForeignKey("CartHeaderId")]
        public virtual CartHeader? CartHeader { get; set; }
        public long ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [Column("count")]
        public int Count { get; set; }
    }
}
