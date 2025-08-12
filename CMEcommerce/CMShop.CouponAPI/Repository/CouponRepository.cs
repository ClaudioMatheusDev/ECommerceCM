using AutoMapper;
using CMShop.CouponAPI.Data.ValueObjetcs;
using CMShop.CouponAPI.Model.Context;
using Microsoft.EntityFrameworkCore;

namespace CMShop.CouponAPI.Repository
{
    public class CouponRepository : ICouponRepository
    {
        private readonly SqlContext _context;
        private IMapper _mapper;

        public CouponRepository(SqlContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<CouponVO> GetCouponByCouponCode(string CouponCode)
        {
            var coupon = await _context.Coupons
                  .FirstOrDefaultAsync(c => c.CouponCode == CouponCode);

            return _mapper.Map<CouponVO>(coupon);

        }
    }
}
