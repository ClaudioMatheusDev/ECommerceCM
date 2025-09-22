namespace CMShop.PaymentAPI.Data.ValueObjects
{
    public class PaymentVO
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public int CardExpiryMonth { get; set; }
        public int CardExpiryYear { get; set; }
        public string CardSecurityCode { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
    }
}
