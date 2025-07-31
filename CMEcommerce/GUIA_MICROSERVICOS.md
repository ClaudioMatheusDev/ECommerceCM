# 🚀 Guia Completo: Adicionando Microserviços ao API Gateway

## 📋 **Índice**
1. [Criando um Novo Microserviço](#1-criando-um-novo-microserviço)
2. [Configurando o Ocelot Gateway](#2-configurando-o-ocelot-gateway)
3. [Atualizando o Frontend](#3-atualizando-o-frontend)
4. [Configurando Health Checks](#4-configurando-health-checks)
5. [Exemplo Prático](#5-exemplo-prático)
6. [Scripts de Automação](#6-scripts-de-automação)

---

## 1. **Criando um Novo Microserviço**

### 📁 **Estrutura de Pastas Recomendada**
```
CMEcommerce/
├── CMShop.APIGateway/          # API Gateway (Ocelot)
├── CMShop.ProductAPI/          # Microserviço de Produtos ✅
├── CMShop.CartAPI/             # 🆕 Microserviço de Carrinho
├── CMShop.OrderAPI/            # 🆕 Microserviço de Pedidos
├── CMShop.UserAPI/             # 🆕 Microserviço de Usuários
├── CMShop.PaymentAPI/          # 🆕 Microserviço de Pagamentos
└── frontend/                   # Frontend React
```

### ⚙️ **Configuração Padrão para Novo Microserviço**

#### **1.1. appsettings.json** do novo microserviço:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "EndPoints": {
      "Http": { "Url": "http://localhost:[PORTA_HTTP]" },
      "Https": { "Url": "https://localhost:[PORTA_HTTPS]" }
    }
  }
}
```

#### **1.2. launchSettings.json**:
```json
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "applicationUrl": "https://localhost:[PORTA_HTTPS];http://localhost:[PORTA_HTTP]"
    }
  }
}
```

#### **1.3. Controller com Roteamento Padronizado**:
```csharp
[Route("api/v1/[controller]")]
[ApiController]
public class [NomeController] : ControllerBase
{
    // Seus endpoints aqui
}
```

---

## 2. **Configurando o Ocelot Gateway**

### 🔧 **Tabela de Portas Recomendadas**
| Microserviço | Porta HTTP | Porta HTTPS | Prefixo Gateway |
|-------------|------------|-------------|-----------------|
| API Gateway | 7100 | **7101** | `/api/health`, `/gateway/*` |
| Product API | 7198 | **7199** | `/gateway/product*` |
| Cart API | 7200 | **7201** | `/gateway/cart*` |
| Order API | 7202 | **7203** | `/gateway/order*` |
| User API | 7204 | **7205** | `/gateway/user*` |
| Payment API | 7206 | **7207** | `/gateway/payment*` |

### 📝 **2.1. Adicionando Rotas no ocelot.Development.json**

```json
{
  "Routes": [
    // Produtos (existente)
    {
      "DownstreamPathTemplate": "/api/v1/product/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 7199 }
      ],
      "UpstreamPathTemplate": "/gateway/product/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "Key": "products"
    },
    
    // 🆕 NOVO MICROSERVIÇO - CARRINHO
    {
      "DownstreamPathTemplate": "/api/v1/cart/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 7201 }
      ],
      "UpstreamPathTemplate": "/gateway/cart/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "Key": "cart",
      "RateLimitOptions": {
        "ClientWhitelist": [],
        "EnableRateLimiting": true,
        "Period": "1m",
        "Limit": 50,
        "PeriodTimespan": 60
      }
    },
    
    // 🆕 NOVO MICROSERVIÇO - PEDIDOS
    {
      "DownstreamPathTemplate": "/api/v1/order/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 7203 }
      ],
      "UpstreamPathTemplate": "/gateway/order/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "Key": "orders",
      "RateLimitOptions": {
        "ClientWhitelist": [],
        "EnableRateLimiting": true,
        "Period": "1m",
        "Limit": 30,
        "PeriodTimespan": 60
      }
    }
  ],
  
  // Agregações para combinar dados de múltiplos serviços
  "Aggregates": [
    {
      "RouteKeys": [ "products", "cart" ],
      "UpstreamPathTemplate": "/gateway/aggregated/shopping",
      "UpstreamHttpMethod": [ "GET" ],
      "ReRouteKeysConfig": {
        "products": "Products",
        "cart": "Cart"
      }
    }
  ]
}
```

### 📝 **2.2. Atualizando appsettings.Development.json do Gateway**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Ocelot": "Debug"
    }
  },
  "Services": {
    "ProductAPI": "https://localhost:7199",
    "CartAPI": "https://localhost:7201",
    "OrderAPI": "https://localhost:7203",
    "UserAPI": "https://localhost:7205",
    "PaymentAPI": "https://localhost:7207",
    "IdentityServer": "https://localhost:7000"
  }
}
```

---

## 3. **Atualizando o Frontend**

### 📝 **3.1. Configuração .env**
```env
# API Gateway Configuration
REACT_APP_API_URL=https://localhost:7101/gateway

# Direct APIs (for development/debug)
REACT_APP_PRODUCT_API=https://localhost:7199/api/v1
REACT_APP_CART_API=https://localhost:7201/api/v1
REACT_APP_ORDER_API=https://localhost:7203/api/v1
REACT_APP_USER_API=https://localhost:7205/api/v1
REACT_APP_PAYMENT_API=https://localhost:7207/api/v1
REACT_APP_IDENTITY_SERVER=https://localhost:7000
REACT_APP_API_GATEWAY=https://localhost:7101

NODE_ENV=development
HTTPS=true
```

### 📝 **3.2. Atualizando config/api.js**
```javascript
// Configuração da API - agora usando API Gateway
export const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7101/gateway';

// URLs diretas dos microserviços (para desenvolvimento/debug)
export const DIRECT_APIS = {
  PRODUCT_API: process.env.REACT_APP_PRODUCT_API || 'https://localhost:7199/api/v1',
  CART_API: process.env.REACT_APP_CART_API || 'https://localhost:7201/api/v1',
  ORDER_API: process.env.REACT_APP_ORDER_API || 'https://localhost:7203/api/v1',
  USER_API: process.env.REACT_APP_USER_API || 'https://localhost:7205/api/v1',
  PAYMENT_API: process.env.REACT_APP_PAYMENT_API || 'https://localhost:7207/api/v1',
  IDENTITY_SERVER: process.env.REACT_APP_IDENTITY_SERVER || 'https://localhost:7000',
  API_GATEWAY: process.env.REACT_APP_API_GATEWAY || 'https://localhost:7101'
};

// Configuração de timeout
export const API_TIMEOUT = 10000;
```

### 📝 **3.3. Criando Novo Service (exemplo: CartService.js)**
```javascript
import axios from "axios";
import { API_URL } from "../config/api";

const API_BASE = `${API_URL}/cart`;

export async function findCartByUserId(userId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao buscar carrinho");
  }
}

export async function addToCart(cartItem) {
  try {
    const response = await axios.post(API_BASE, cartItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao adicionar ao carrinho");
  }
}

export async function updateCartItem(id, cartItem) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, cartItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao atualizar item do carrinho");
  }
}

export async function removeFromCart(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao remover item do carrinho");
  }
}
```

---

## 4. **Configurando Health Checks**

### 📝 **4.1. Atualizando HealthController.cs do Gateway**

```csharp
[HttpGet("services")]
public async Task<IActionResult> GetServicesHealth()
{
    var servicesConfig = _configuration.GetSection("Services");
    var services = new Dictionary<string, object>();
    
    // Lista de serviços para verificar
    var serviceList = new Dictionary<string, string>
    {
        { "ProductAPI", servicesConfig["ProductAPI"] },
        { "CartAPI", servicesConfig["CartAPI"] },
        { "OrderAPI", servicesConfig["OrderAPI"] },
        { "UserAPI", servicesConfig["UserAPI"] },
        { "PaymentAPI", servicesConfig["PaymentAPI"] },
        { "IdentityServer", servicesConfig["IdentityServer"] }
    };
    
    foreach (var service in serviceList)
    {
        try
        {
            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(5);
            
            var response = await client.GetAsync($"{service.Value}/health");
            services[service.Key] = new
            {
                status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                url = service.Value,
                responseTime = response.Headers.Date?.ToString() ?? "N/A"
            };
        }
        catch (Exception ex)
        {
            services[service.Key] = new
            {
                status = "Unhealthy",
                error = ex.Message,
                url = service.Value
            };
        }
    }
    
    var overallStatus = services.Values.All(s => ((dynamic)s).status == "Healthy") 
        ? "Healthy" : "Degraded";
    
    return Ok(new
    {
        overallStatus,
        timestamp = DateTime.UtcNow,
        services
    });
}
```

---

## 5. **Exemplo Prático: Adicionando Cart API**

### 🆕 **5.1. Criando CMShop.CartAPI**

#### **Pasta**: `CMShop.CartAPI`
#### **Porta**: HTTPS 7201, HTTP 7200

#### **CartController.cs**:
```csharp
[Route("api/v1/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<CartVO>> FindCartByUserId(string userId)
    {
        // Lógica do carrinho
    }
    
    [HttpPost]
    public async Task<ActionResult<CartVO>> AddToCart([FromBody] CartVO cart)
    {
        // Lógica para adicionar ao carrinho
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<CartVO>> UpdateCart(int id, [FromBody] CartVO cart)
    {
        // Lógica para atualizar carrinho
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> RemoveFromCart(int id)
    {
        // Lógica para remover do carrinho
    }
    
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "Healthy", service = "CartAPI", timestamp = DateTime.UtcNow });
    }
}
```

### 🆕 **5.2. Adicionando ao Ocelot (ocelot.Development.json)**

```json
{
  "DownstreamPathTemplate": "/api/v1/cart/{everything}",
  "DownstreamScheme": "https",
  "DownstreamHostAndPorts": [
    { "Host": "localhost", "Port": 7201 }
  ],
  "UpstreamPathTemplate": "/gateway/cart/{everything}",
  "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
  "Key": "cart",
  "RateLimitOptions": {
    "ClientWhitelist": [],
    "EnableRateLimiting": true,
    "Period": "1m",
    "Limit": 50,
    "PeriodTimespan": 60
  }
}
```

### 🆕 **5.3. Criando CartService.js no Frontend**

```javascript
import axios from "axios";
import { API_URL } from "../config/api";

const API_BASE = `${API_URL}/cart`;

export async function findCartByUserId(userId) {
  const response = await axios.get(`${API_BASE}/user/${userId}`);
  return response.data;
}

export async function addToCart(cartItem) {
  const response = await axios.post(API_BASE, cartItem);
  return response.data;
}
```

---

## 6. **Scripts de Automação**

### 📝 **6.1. Atualizando start-all-services.bat**

```batch
@echo off
echo 🚀 Iniciando CMShop E-Commerce com todos os microserviços...

echo 🔧 Configurando certificados SSL...
dotnet dev-certs https --trust

echo 📦 Restaurando e compilando projetos...
dotnet restore && dotnet build

echo 🌐 Iniciando serviços em janelas separadas...

echo 🔧 1. API Gateway (porta 7101)...
start "🌐 API Gateway" cmd /k "cd CMShop.APIGateway && dotnet run --environment Development"
timeout /t 3

echo 🛒 2. Product API (porta 7199)...
start "🛒 Product API" cmd /k "cd CMShop.ProductAPI && dotnet run --launch-profile https"
timeout /t 2

echo 🛍️  3. Cart API (porta 7201)...
start "🛍️  Cart API" cmd /k "cd CMShop.CartAPI && dotnet run --launch-profile https"
timeout /t 2

echo 📦 4. Order API (porta 7203)...
start "📦 Order API" cmd /k "cd CMShop.OrderAPI && dotnet run --launch-profile https"
timeout /t 2

echo 👤 5. User API (porta 7205)...
start "👤 User API" cmd /k "cd CMShop.UserAPI && dotnet run --launch-profile https"
timeout /t 2

echo 💳 6. Payment API (porta 7207)...
start "💳 Payment API" cmd /k "cd CMShop.PaymentAPI && dotnet run --launch-profile https"
timeout /t 2

echo 💻 7. Frontend (porta 3000)...
start "💻 Frontend" cmd /k "cd frontend && npm install && npm start"

echo ✅ Todos os serviços iniciados!
echo 📋 URLs de teste:
echo   🌐 Gateway Health: https://localhost:7101/api/health
echo   🌐 Services Health: https://localhost:7101/api/health/services
echo   💻 Frontend: http://localhost:3000
pause
```

### 📝 **6.2. Script de Teste (test-services.bat)**

```batch
@echo off
echo 🧪 Testando todos os microserviços...

echo 🔧 Gateway Health:
curl https://localhost:7101/api/health
echo.

echo 🛒 Product API:
curl https://localhost:7199/api/v1/product
echo.

echo 🛍️  Cart API:
curl https://localhost:7201/api/v1/cart/health
echo.

echo 📦 Order API:
curl https://localhost:7203/api/v1/order/health
echo.

echo 💳 Payment API:
curl https://localhost:7207/api/v1/payment/health
echo.

pause
```

---

## ✅ **Checklist para Adicionar Novo Microserviço**

- [ ] **1. Criar projeto do microserviço**
  - [ ] Configurar porta única (HTTP/HTTPS)
  - [ ] Configurar roteamento: `[Route("api/v1/[controller]")]`
  - [ ] Adicionar endpoint `/health`

- [ ] **2. Atualizar Ocelot Gateway**
  - [ ] Adicionar rota em `ocelot.Development.json`
  - [ ] Adicionar rota em `ocelot.json`
  - [ ] Configurar rate limiting adequado
  - [ ] Atualizar `appsettings.Development.json`

- [ ] **3. Atualizar Frontend**
  - [ ] Adicionar URL no `.env`
  - [ ] Atualizar `config/api.js`
  - [ ] Criar service específico
  - [ ] Testar integração

- [ ] **4. Atualizar Health Monitoring**
  - [ ] Adicionar serviço no `HealthController`
  - [ ] Verificar monitoramento via `/api/health/services`

- [ ] **5. Atualizar Scripts**
  - [ ] Adicionar no `start-all-services.bat`
  - [ ] Adicionar no `test-services.bat`
  - [ ] Documentar no README

- [ ] **6. Testar Integração**
  - [ ] API direta funciona
  - [ ] Gateway roteia corretamente
  - [ ] Frontend consome dados
  - [ ] Health checks respondem

---

## 🚀 **Dicas Importantes**

### 🔐 **Segurança**
- Use rate limiting apropriado para cada serviço
- Configure CORS adequadamente
- Considere autenticação/autorização

### ⚡ **Performance**
- Configure timeouts adequados
- Use agregações quando apropriado
- Monitore latência entre serviços

### 🛠️ **Manutenibilidade**
- Mantenha versionamento consistente (api/v1)
- Use nomes descritivos para keys no Ocelot
- Documente todas as rotas

### 🧪 **Testes**
- Teste cada microserviço isoladamente
- Teste roteamento via gateway
- Teste integração com frontend
- Monitore health checks regularmente

---

**Com esse guia, você pode adicionar quantos microserviços quiser de forma organizada e escalável! 🎉**
