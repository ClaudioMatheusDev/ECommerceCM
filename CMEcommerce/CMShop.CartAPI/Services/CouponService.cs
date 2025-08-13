using System.Text.Json;

namespace CMShop.CartAPI.Services
{
    public interface ICouponService
    {
        Task<CouponValidationResult> ValidateCouponAsync(string couponCode);
    }

    public class CouponService : ICouponService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CouponService> _logger;
        private readonly string _couponApiUrl;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CouponService(HttpClient httpClient, ILogger<CouponService> logger, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _logger = logger;
            _couponApiUrl = configuration["Services:CouponAPI"] ?? "https://localhost:7204";
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<CouponValidationResult> ValidateCouponAsync(string couponCode)
        {
            try
            {
                _logger.LogInformation("Validando cupom: {CouponCode}", couponCode);
                
                // Obter o token JWT do contexto HTTP atual
                var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
                
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }
                
                var response = await _httpClient.GetAsync($"{_couponApiUrl}/api/v1/coupon/{couponCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonContent = await response.Content.ReadAsStringAsync();
                    var coupon = JsonSerializer.Deserialize<CouponDto>(jsonContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (coupon != null)
                    {
                        _logger.LogInformation("Cupom válido: {CouponCode}, Desconto: {Discount}", couponCode, coupon.DiscountAmount);
                        return new CouponValidationResult
                        {
                            IsValid = true,
                            DiscountAmount = coupon.DiscountAmount,
                            CouponCode = coupon.CouponCode
                        };
                    }
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Cupom não encontrado: {CouponCode}", couponCode);
                    return new CouponValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Cupom não encontrado"
                    };
                }
                else
                {
                    _logger.LogError("Erro ao validar cupom. Status: {StatusCode}", response.StatusCode);
                    return new CouponValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Erro ao validar cupom"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exceção ao validar cupom: {CouponCode}", couponCode);
                return new CouponValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Erro interno ao validar cupom"
                };
            }

            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Cupom inválido"
            };
        }
    }

    public class CouponDto
    {
        public long Id { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
    }

    public class CouponValidationResult
    {
        public bool IsValid { get; set; }
        public decimal DiscountAmount { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
