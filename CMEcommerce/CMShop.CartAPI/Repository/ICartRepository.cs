using CMShop.CartAPI.Data.ValueObjects;

namespace CMShop.CartAPI.Repository
{
    public interface ICartRepository
    {
        Task<CartVO?> FindCartByUserID(string userId);
        Task<IEnumerable<CartVO>> FindAllCarts();
        Task<CartVO> SaveOrUpdateCart(CartVO cart);
        Task<bool> RemoveFromCart(long cartDetailsId);
        Task<bool> ApplyCoupon(string userId, string couponCode);
        Task<bool> RemoveCoupon(string userId);
        Task<bool> ClearCart(string userId);
    }
}
