using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace CMShop.APIGateway.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase, IDisposable
    {
        private readonly ILogger<HealthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private bool _disposed = false;

        public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        [HttpGet]
        public IActionResult Get()
        {
            var healthCheck = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Gateway = "CMShop API Gateway",
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
            };

            return Ok(healthCheck);
        }

        [HttpGet("services")]
        public async Task<IActionResult> CheckServices()
        {
            var services = new Dictionary<string, object>();

            // Verificar ProductAPI
            try
            {
                var productApiUrl = "https://localhost:7199/api/product";
                var response = await _httpClient.GetAsync(productApiUrl);
                services.Add("ProductAPI", new
                {
                    Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                    Url = productApiUrl,
                    StatusCode = response.StatusCode,
                    ResponseTime = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                services.Add("ProductAPI", new
                {
                    Status = "Unhealthy",
                    Error = ex.Message,
                    Url = "https://localhost:7199/api/product"
                });
            }

            // Verificar IdentityServer (se disponível)
            try
            {
                var identityUrl = "https://localhost:7000/.well-known/openid_configuration";
                var response = await _httpClient.GetAsync(identityUrl);
                services.Add("IdentityServer", new
                {
                    Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                    Url = identityUrl,
                    StatusCode = response.StatusCode,
                    ResponseTime = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                services.Add("IdentityServer", new
                {
                    Status = "Unhealthy",
                    Error = ex.Message,
                    Url = "https://localhost:7000"
                });
            }

            var overallStatus = services.Values.All(s => 
                ((dynamic)s).Status.ToString() == "Healthy") ? "Healthy" : "Degraded";

            var result = new
            {
                OverallStatus = overallStatus,
                Timestamp = DateTime.UtcNow,
                Services = services
            };

            return Ok(result);
        }

        [HttpGet("routes")]
        public IActionResult GetRoutes()
        {
            var routes = new
            {
                Gateway = "CMShop API Gateway",
                AvailableRoutes = new[]
                {
                    new { Route = "/gateway/products", Method = "GET", Target = "ProductAPI", Description = "Lista todos os produtos" },
                    new { Route = "/gateway/product/{id}", Method = "GET", Target = "ProductAPI", Description = "Busca produto por ID" },
                    new { Route = "/gateway/product", Method = "POST", Target = "ProductAPI", Description = "Cria novo produto" },
                    new { Route = "/gateway/product/{id}", Method = "PUT", Target = "ProductAPI", Description = "Atualiza produto" },
                    new { Route = "/gateway/product/{id}", Method = "DELETE", Target = "ProductAPI", Description = "Remove produto" },
                    new { Route = "/gateway/connect/token", Method = "POST", Target = "IdentityServer", Description = "Autenticação" },
                    new { Route = "/gateway/identity/*", Method = "GET", Target = "IdentityServer", Description = "Páginas de identidade" },
                    new { Route = "/app/*", Method = "ALL", Target = "Frontend", Description = "Aplicação React" }
                }
            };

            return Ok(routes);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                _httpClient?.Dispose();
                _disposed = true;
            }
        }
    }
}
