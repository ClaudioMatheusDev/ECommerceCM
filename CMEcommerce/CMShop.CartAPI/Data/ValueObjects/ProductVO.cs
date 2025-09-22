namespace CMShop.CartAPI.Data.ValueObjects

{
    public class ProductVO
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string ImageURL { get; set; } = string.Empty;
        public int Stock { get; set; }
    }
}
