using CMShop.PaymentAPI.Model.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMShop.PaymentAPI.Model
{
    [Table("payment")]
    public class Payment : BaseEntity
    {
        [Column("order_id")]
        public long OrderId { get; set; }

        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("card_number")]
        public string CardNumber { get; set; } = string.Empty;

        [Column("card_expiry_month")]
        public int CardExpiryMonth { get; set; }

        [Column("card_expiry_year")]
        public int CardExpiryYear { get; set; }

        [Column("card_security_code")]
        public string CardSecurityCode { get; set; } = string.Empty;

        [Column("card_holder_name")]
        public string CardHolderName { get; set; } = string.Empty;

        [Column("amount")]
        public decimal Amount { get; set; }

        [Column("payment_date")]
        public DateTime PaymentDate { get; set; }

        [Column("status")]
        public string Status { get; set; } = string.Empty;

        [Column("transaction_id")]
        public string? TransactionId { get; set; }
    }
}
