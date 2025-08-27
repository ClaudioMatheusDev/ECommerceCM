# 📦 CMShop Order API

## 🎯 Visão Geral

O **Order API** é responsável pelo gerenciamento de pedidos no sistema CMShop. Este microsserviço permite criar, consultar, atualizar e gerenciar pedidos dos usuários.

## 🚀 Configuração

### Portas
- **HTTP**: 7202
- **HTTPS**: 7203

### Base de Dados
- **Database**: `CMShopping_order_api`
- **Conexão**: SQL Server local

## 📊 Estrutura de Dados

### OrderHeader
- `Id`: Identificador único do pedido
- `UserId`: ID do usuário que fez o pedido
- `CouponCode`: Código do cupom aplicado (opcional)
- `DiscountAmount`: Valor do desconto
- `PurchaseAmount`: Valor total da compra
- `FirstName`, `LastName`: Nome do cliente
- `OrderTime`: Data/hora do pedido
- `Phone`, `Email`: Contato do cliente
- `CardNumber`, `CVV`, `ExpiryMonthYear`: Dados do cartão
- `CartTotalItems`: Total de itens
- `PaymentStatus`: Status do pagamento

### OrderDetail
- `Id`: Identificador único do item
- `OrderHeaderId`: Referência ao cabeçalho do pedido
- `ProductId`: ID do produto
- `Count`: Quantidade
- `ProductName`: Nome do produto
- `Price`: Preço unitário

## 🔐 Autenticação

O OrderAPI utiliza JWT Bearer tokens para autenticação:
- **Identity Server**: `https://localhost:7000`
- Roles suportadas: `Admin`, `Client`

## 📡 Endpoints

### Público (sem autenticação)
- `GET /api/v1/orders/{id}` - Buscar pedido por ID
- `GET /api/v1/orders/user/{userId}` - Listar pedidos por usuário
- `POST /api/v1/orders` - Criar novo pedido

### Admin apenas
- `GET /api/v1/orders` - Listar todos os pedidos
- `PUT /api/v1/orders/{id}` - Atualizar pedido
- `PATCH /api/v1/orders/{id}/payment-status` - Atualizar status de pagamento
- `DELETE /api/v1/orders/{id}` - Deletar pedido

## 🧪 Como Testar

### 1. Via Swagger
```
https://localhost:7203/swagger
```

### 2. Via arquivo .http
Use o arquivo `CMShop.OrderAPI.http` para testes rápidos.

### 3. Exemplo de Criação de Pedido
```json
POST /api/v1/orders
{
  "orderHeader": {
    "userId": "user-123",
    "firstName": "João",
    "lastName": "Silva",
    "purchaseAmount": 150.00,
    "email": "joao@email.com",
    "phone": "(11) 99999-9999"
  },
  "orderDetails": [
    {
      "productId": 1,
      "count": 2,
      "productName": "Produto Teste",
      "price": 75.00
    }
  ]
}
```

## 🔧 Configurações Importantes

### AutoMapper
Configurado para mapear entre entities e value objects:
- `OrderHeader` ↔ `OrderHeaderVO`
- `OrderDetail` ↔ `OrderDetailVO`
- `OrderVO` (combinação header + details)

### Entity Framework
- Code First com migrations automáticas
- Relacionamento 1:N entre OrderHeader e OrderDetails
- Cascade delete configurado

### CORS
Configurado para aceitar requisições de qualquer origem (desenvolvimento).

## 🔄 Integração com outros serviços

### Dependencies
- **IdentityServer** (autenticação)
- **SQL Server** (persistência)
- **MessageBus** (comunicação assíncrona)

### Futura integração
- **CartAPI**: Para conversão carrinho → pedido
- **PaymentAPI**: Para processamento de pagamentos
- **InventoryAPI**: Para controle de estoque

## ⚠️ Notas de Desenvolvimento

1. **Migrations**: São criadas automaticamente em desenvolvimento
2. **Logs**: Configurados para debug detalhado
3. **Validações**: Implementadas no controller e repository
4. **Error Handling**: Try-catch com logs estruturados

## 🔧 Scripts de Build e Run

```bash
# Build
dotnet build

# Run (HTTPS)
dotnet run --launch-profile https

# Run (HTTP)
dotnet run --launch-profile http
```
