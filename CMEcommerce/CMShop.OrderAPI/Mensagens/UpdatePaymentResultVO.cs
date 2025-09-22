namespace CMShop.OrderAPI.Mensagens
{
    public class UpdatePaymentResultVO
    {
        public long OrderID { get; set; }
        public bool Status { get; set; }
        public string Email { get; set; }
    }
}
