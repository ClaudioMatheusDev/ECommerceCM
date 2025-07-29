# 🔧 Correções Aplicadas - Configuração de Portas

## ❌ Problemas Identificados

1. **Product API** estava configurado para porta `5155` em vez de `7199`
2. **Certificados SSL** podem não estar configurados corretamente
3. **API Gateway** pode ter problemas de inicialização

## ✅ Correções Realizadas

### 1. **Product API - Portas Corrigidas**
- `launchSettings.json`: Configurado para portas `7199` (HTTPS) e `7198` (HTTP)
- `appsettings.json`: Adicionada configuração Kestrel com portas corretas

### 2. **Script de Inicialização Melhorado**
- Adicionado comando para confiar nos certificados SSL
- Verificação de erros de compilação
- Tempos de espera aumentados
- Instruções mais claras

### 3. **Configuração Verificada**

#### API Gateway (Port 7101)
```json
"Kestrel": {
  "EndPoints": {
    "Http": { "Url": "http://localhost:7100" },
    "Https": { "Url": "https://localhost:7101" }
  }
}
```

#### Product API (Port 7199)
```json
"Kestrel": {
  "EndPoints": {
    "Http": { "Url": "http://localhost:7198" },
    "Https": { "Url": "https://localhost:7199" }
  }
}
```

#### Ocelot Configuration (Development)
```json
"DownstreamHostAndPorts": [
  {
    "Host": "localhost",
    "Port": 7199
  }
]
```

## 🚀 Como Testar

### Opção 1: Script Automatizado
```bash
cd CMEcommerce
.\start-all-services.bat
```

### Opção 2: Manual
```bash
# 1. Configurar certificados
dotnet dev-certs https --trust

# 2. API Gateway
cd CMShop.APIGateway
dotnet run --environment Development

# 3. Product API (nova janela)
cd CMShop.ProductAPI  
dotnet run --launch-profile https

# 4. Frontend (nova janela)
cd frontend
npm start
```

## 🧪 Endpoints para Teste

| Serviço | URL | Status |
|---------|-----|--------|
| API Gateway Health | https://localhost:7101/api/health | ✅ |
| Services Health | https://localhost:7101/api/health/services | ✅ |
| Routes Info | https://localhost:7101/api/health/routes | ✅ |
| Products via Gateway | https://localhost:7101/gateway/products | 🔄 |
| Product API Direct | https://localhost:7199/api/product | 🔄 |
| Frontend via Gateway | https://localhost:7101/app/ | 🔄 |

## ⚠️ Troubleshooting

### Se o API Gateway falhar (-1):
1. Verificar se a porta 7101 está livre
2. Reconfigurar certificados SSL: `dotnet dev-certs https --clean && dotnet dev-certs https --trust`
3. Verificar logs no Visual Studio para erros específicos

### Se o Product API não conectar:
1. Verificar se o SQL Server está rodando
2. Testar connection string no `appsettings.json`
3. Verificar se a porta 7199 está livre

### Se o Frontend não carregar:
1. Verificar se Node.js está instalado
2. Executar `npm install` na pasta frontend
3. Verificar se a porta 3000 está livre
