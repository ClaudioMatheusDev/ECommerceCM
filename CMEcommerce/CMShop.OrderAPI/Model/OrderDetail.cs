using CMShop.OrderAPI.Model.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMShop.OrderAPI.Model
{
    [Table("order_detail")]
    public class OrderDetail : BaseEntity
    {
        [Column("order_header_id")]
        public long OrderHeaderId { get; set; }

        [ForeignKey("OrderHeaderId")]
        public virtual OrderHeader? OrderHeader { get; set; }

        [Column("product_id")]
        public long ProductId { get; set; }

        [Column("count")]
        public int Count { get; set; }

        [Column("product_name")]
        public string ProductName { get; set; } = string.Empty;

        [Column("price")]
        public decimal Price { get; set; }
    }
}
