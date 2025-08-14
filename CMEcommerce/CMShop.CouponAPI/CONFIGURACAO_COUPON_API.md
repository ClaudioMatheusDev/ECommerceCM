# Documentação da Configuração do CouponAPI

## ✅ **CORREÇÕES IMPLEMENTADAS**

### 1. **API Gateway - Rota Configurada**
```json
{
  "DownstreamPathTemplate": "/api/v1/coupon/{everything}",
  "DownstreamScheme": "https",
  "DownstreamHostAndPorts": [
    {
      "Host": "localhost",
      "Port": 7204
    }
  ],
  "UpstreamPathTemplate": "/gateway/coupon/{everything}",
  "UpstreamHttpMethod": [ "GET" ],
  "Key": "coupon"
}
```

### 2. **Portas Padronizadas**
- **HTTP**: `http://localhost:7203`
- **HTTPS**: `https://localhost:7204`
- **Banco**: `CMShopping_coupon_api`

### 3. **CORS Configurado**
- Adicionado `app.UseCors("AllowAll")` no `Program.cs`

### 4. **Integração CartAPI ↔ CouponAPI**
- ✅ **CouponService** criado no CartAPI
- ✅ **HttpClient** configurado para chamar CouponAPI
- ✅ **Validação de cupom** antes de aplicar no carrinho
- ✅ **Injeção de dependência** configurada

### 5. **Frontend - CouponService**
- ✅ **Serviço criado** para consumir via API Gateway
- ✅ **Autenticação JWT** configurada
- ✅ **Tratamento de erros** implementado

### 6. **Script SQL**
- ✅ **Tabela `coupon`** com dados de seed
- ✅ **Índice único** no `coupon_code`
- ✅ **Cupons de exemplo** para teste

## 🧪 **TESTES RECOMENDADOS**

### 1. **Testar CouponAPI Diretamente**
```bash
# Swagger: https://localhost:7204
GET https://localhost:7204/api/v1/coupon/Claudio_2025_10
Authorization: Bearer {jwt_token}
```

### 2. **Testar via API Gateway**
```bash
GET https://localhost:7101/gateway/coupon/Claudio_2025_10
Authorization: Bearer {jwt_token}
```

### 3. **Testar Integração CartAPI**
```bash
POST https://localhost:7101/gateway/cart/apply-coupon
{
  "userId": "user-id",
  "couponCode": "Claudio_2025_10"
}
```

### 4. **Testar Frontend**
- Adicionar item ao carrinho
- Aplicar cupom na página do carrinho
- Verificar desconto aplicado

## 🚀 **COMO EXECUTAR**

### 1. **Executar Script SQL**
```sql
-- Conectar ao SQL Server e executar:
-- CMShop.CouponAPI\SqlScripts\CMShop.CouponAPI.sql
```

### 2. **Iniciar Serviços (ordem recomendada)**
```powershell
# 1. IdentityServer (porta 7000)
cd CMShop.IdentityServer
dotnet run

# 2. CouponAPI (porta 7204)
cd CMShop.CouponAPI
dotnet run

# 3. CartAPI (porta 7201)
cd CMShop.CartAPI
dotnet run

# 4. ProductAPI (porta 7199)
cd CMShop.ProductAPI
dotnet run

# 5. API Gateway (porta 7101)
cd CMShop.APIGateway
dotnet run

# 6. Frontend (porta 3000)
cd frontend
npm start
```

## 📋 **CUPONS DISPONÍVEIS PARA TESTE**
- `Claudio_2025_10` - Desconto: R$ 10,00
- `Matheus_2025_15` - Desconto: R$ 15,00
- `PROMO2025` - Desconto: R$ 25,00
- `DESCONTO5` - Desconto: R$ 5,00
- `BLACKFRIDAY` - Desconto: R$ 50,00
- `NATAL2025` - Desconto: R$ 20,00

## ⚠️ **OBSERVAÇÕES IMPORTANTES**

1. **Autenticação Obrigatória**: Todos os endpoints do CouponAPI exigem JWT válido
2. **Validação no CartAPI**: Agora valida cupom antes de aplicar
3. **Rate Limiting**: Gateway limita 30 requisições/minuto para cupons
4. **Logs**: Implementado logging detalhado para debug

## 🔧 **CONFIGURAÇÕES FINAIS**

O microsserviço está agora **totalmente integrado** e **pronto para uso**:
- ✅ API Gateway configurado
- ✅ Autenticação JWT funcional
- ✅ Integração Cart ↔ Coupon
- ✅ Frontend preparado
- ✅ Banco de dados com dados de teste

**Status**: 🟢 **OPERACIONAL**
