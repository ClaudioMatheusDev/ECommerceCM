using AutoMapper;
using CMShop.CouponAPI.Data.ValueObjetcs;
using CMShop.CouponAPI.Model;

namespace CMShop.CouponAPI.Config
{
    public class MappingConfig
    {
        public static MapperConfiguration RegisterMaps()
        {
            var mappingConfig = new MapperConfiguration(config =>
            {
                config.CreateMap<CouponVO, Coupon>().ReverseMap();
            });
            return mappingConfig;
        }
    }
}
