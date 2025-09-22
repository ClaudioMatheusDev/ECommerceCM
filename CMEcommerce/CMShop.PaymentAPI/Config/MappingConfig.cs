using AutoMapper;
using CMShop.PaymentAPI.Data.ValueObjects;
using CMShop.PaymentAPI.Model;
using CMShop.PaymentAPI.Mensagens;

namespace CMShop.PaymentAPI.Config
{
    public static class MappingConfig
    {
        public static MapperConfiguration RegisterMaps()
        {
            var mappingConfig = new MapperConfiguration(config => 
            {
                config.CreateMap<PaymentVO, Payment>().ReverseMap();
                config.CreateMap<PaymentMessage, PaymentVO>();
            });
            return mappingConfig;
        }
    }
}
