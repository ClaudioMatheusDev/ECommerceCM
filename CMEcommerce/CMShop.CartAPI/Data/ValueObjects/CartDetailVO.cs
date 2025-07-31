namespace CMShop.CartAPI.Data.ValueObjects
{
    public class CartDetailVO 
    {
        public long Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public long CartHeaderId { get; set; }
        public CartHeaderVO? CartHeader { get; set; }
        public long ProductId { get; set; }
        public ProductVO? Product { get; set; }
        public int Count { get; set; }
        
        // Propriedades para compatibilidade com frontend
        public string ProductName => Product?.Name ?? string.Empty;
        public decimal ProductPrice => Product?.Price ?? 0;
        public string? ProductImage => Product?.ImageURL;
        public int Quantity => Count;
    }
}
