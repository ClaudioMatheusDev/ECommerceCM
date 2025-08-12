using CMShop.CouponAPI.Data.ValueObjetcs;

namespace CMShop.CouponAPI.Repository
{
    public interface ICouponRepository
    {
        Task<CouponVO> GetCouponByCouponCode(string CouponCode);
    }
}
