## 🚀 Como Executar

### Opção 1: Script Automatizado (Recomendado)
```bash
# Windows
./start-services.bat

# Linux/macOS
chmod +x start-services.sh
./start-services.sh
```

### Opção 2: Manual
```bash
# 1. API Gateway
cd CMShop.APIGateway
dotnet run --urls=https://localhost:7101

# 2. Product API
cd CMShop.ProductAPI
dotnet run --urls=https://localhost:7199

# 3. Frontend
cd frontend
npm install && npm start
```

### Opção 3: Docker Compose
```bash
docker-compose up -d
```

## 📚 Endpoints

### API Gateway (https://localhost:7101)

#### Monitoramento
- `GET /api/health` - Status do gateway
- `GET /api/health/services` - Status dos microserviços
- `GET /api/health/routes` - Rotas disponíveis

#### Produtos (via Gateway)
- `GET /gateway/products` - Listar produtos
- `GET /gateway/product/{id}` - Buscar produto
- `POST /gateway/product` - Criar produto
- `PUT /gateway/product/{id}` - Atualizar produto
- `DELETE /gateway/product/{id}` - Deletar produto

#### Frontend
- `GET /app/*` - Servir aplicação React

### Product API Direta (https://localhost:7199)
- `GET /api/product` - Listar produtos
- `GET /api/product/{id}` - Buscar produto
- `POST /api/product` - Criar produto
- `PUT /api/product/{id}` - Atualizar produto
- `DELETE /api/product/{id}` - Deletar produto

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)
```env
REACT_APP_API_URL=https://localhost:7101/gateway
REACT_APP_PRODUCT_API=https://localhost:7199/api
REACT_APP_IDENTITY_SERVER=https://localhost:7000
NODE_ENV=development
HTTPS=true
```

#### API Gateway (appsettings.json)
```json
{
  "Kestrel": {
    "EndPoints": {
      "Http": { "Url": "http://localhost:7100" },
      "Https": { "Url": "https://localhost:7101" }
    }
  }
}
```

## 📊 Monitoramento

### Health Checks
```bash
# Status geral
curl https://localhost:7101/api/health

# Status dos serviços
curl https://localhost:7101/api/health/services

# Rotas disponíveis
curl https://localhost:7101/api/health/routes
```

### Rate Limiting
- **Desenvolvimento**: 100 req/min por IP
- **Produção**: Configurável por rota
- **Whitelist**: IPs locais permitidos

### Logs
- **Ocelot**: Debug level habilitado
- **Requisições**: Tempo de resposta monitorado
- **Erros**: Captura e log de falhas

## 🔒 Segurança

### CORS
- Configurado para desenvolvimento local
- Permite todas as origens em dev
- Headers customizados habilitados

### SSL/TLS
- Certificados de desenvolvimento
- HTTPS obrigatório em produção
- Redirecionamento automático

### Rate Limiting
```json
{
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1m",
    "Limit": 100,
    "ClientWhitelist": ["127.0.0.1", "::1"]
  }
}
```

## 📁 Estrutura do Projeto

```
CMEcommerce/
├── CMShop.APIGateway/          # API Gateway
│   ├── Controllers/
│   │   └── HealthController.cs
│   ├── ocelot.json
│   ├── ocelot.Development.json
│   └── Program.cs
├── CMShop.ProductAPI/          # Product Microservice
├── CMShop.IdentityServer/      # Identity Microservice
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── config/api.js
│   │   ├── services/
│   │   └── pages/
│   └── .env
├── docker-compose.yml
├── start-services.bat          # Windows startup
├── start-services.sh           # Linux/macOS startup
└── CMEcommerce.sln
```

## 🐳 Docker

### Imagens
- **Gateway**: `cmshop-gateway:latest`
- **Product API**: `cmshop-product-api:latest`
- **Frontend**: `cmshop-frontend:latest`
- **Database**: `mcr.microsoft.com/mssql/server:2022-latest`

### Rede
- **Nome**: `cmshop-network`
- **Driver**: bridge
- **Comunicação**: Interna entre containers

## 🛠️ Desenvolvimento

### Pré-requisitos
- .NET 8.0 SDK
- Node.js 18+
- SQL Server (LocalDB/Docker)
- Visual Studio 2022 ou VS Code

### Comandos Úteis
```bash
# Restaurar dependências
dotnet restore

# Build completo
dotnet build

# Executar testes
dotnet test

# Publicar para produção
dotnet publish -c Release
```

## 🔄 Próximos Passos

### Funcionalidades Planejadas
1. **Autenticação JWT** - Integração completa com Identity Server
2. **Cache Redis** - Cache distribuído para performance
3. **Métricas** - Prometheus + Grafana
4. **Service Discovery** - Descoberta automática de serviços
5. **Circuit Breaker** - Resiliência para falhas
6. **API Versioning** - Versionamento de APIs
7. **Swagger Integration** - Documentação automática

### Melhorias de Infraestrutura
1. **Kubernetes** - Orquestração de containers
2. **Istio Service Mesh** - Gerenciamento de tráfego
3. **ELK Stack** - Logging centralizado
4. **Azure/AWS** - Deploy em nuvem

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de conexão SSL
```bash
# Gerar certificados de desenvolvimento
dotnet dev-certs https --trust
```

#### Porta em uso
```bash
# Windows - matar processo na porta
netstat -ano | findstr :7101
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:7101 | xargs kill -9
```

#### CORS Error
- Verificar configuração no `Program.cs`
- Confirmar URL do frontend no CORS policy

### Logs Importantes
```bash
# API Gateway logs
docker logs api-gateway

# Product API logs  
docker logs product-api

# Todos os serviços
docker-compose logs -f
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para demonstrar arquitetura de microserviços moderna com .NET e React**
