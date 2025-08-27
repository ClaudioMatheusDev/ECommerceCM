using CMShop.CartAPI.Data.ValueObjects;

namespace CMShop.CartAPI.Repository
{
    public interface ICouponRepository
    {
        Task<CouponVO> GetCouponByCouponCode(string CouponCode, string token);
    }
}
