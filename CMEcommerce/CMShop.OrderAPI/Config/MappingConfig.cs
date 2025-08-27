using AutoMapper;
using CMShop.OrderAPI.Data.ValueObjects;
using CMShop.OrderAPI.Model;

namespace CMShop.OrderAPI.Config
{
    public class MappingConfig
    {
        public static MapperConfiguration RegisterMaps()
        {
            var mappingConfig = new MapperConfiguration(config =>
            {
                config.CreateMap<OrderHeaderVO, OrderHeader>().ReverseMap();
                config.CreateMap<OrderDetailVO, OrderDetail>().ReverseMap();
                config.CreateMap<OrderVO, OrderHeader>()
                    .ForMember(dest => dest.OrderDetails, opt => opt.MapFrom(src => src.OrderDetails))
                    .ReverseMap()
                    .ForMember(dest => dest.OrderDetails, opt => opt.MapFrom(src => src.OrderDetails));
            });
            return mappingConfig;
        }
    }
}
