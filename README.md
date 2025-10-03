# E-commerce Microservices com ASP.NET

Este repositório contém um projeto de E-commerce desenvolvido em **ASP.NET Core**, utilizando uma arquitetura baseada em **microservices**. O projeto implementa autenticação segura com **IdentityServer** e **JWT**, e segue boas práticas como **DTOs**, **migrations**, e comunicação entre serviços.

## Tecnologias Utilizadas
- **ASP.NET Core**  
- **Entity Framework Core** (com Migrations)  
- **IdentityServer4** (para autenticação e autorização)  
- **JWT (JSON Web Token)** (para autenticação segura)  
- **DTO (Data Transfer Object)** (para transferência de dados)  
- **Docker** (para conteinerização)  
- **RabbitMQ** (para comunicação entre microservices)  
- **Swagger** (para documentação da API)  

## Estrutura do Projeto
O sistema é composto por vários microservices, cada um responsável por uma funcionalidade específica:

```plaintext
EcommerceMS/
└── src/                     # Código dos microsserviços
    ├── IdentityServer/      # Autenticação e gestão de usuários (JWT + IdentityServer)
    ├── CMShop.ProductAPI/   # Gestão de produtos, categorias, estoque e preços
    ├── CMShop.CartAPI/      # Carrinho de compras
    ├── CMShop.DescontAPI/   # Cupons e regras de desconto
    ├── CMShop.OrderAPI/     # Processamento e status dos pedidos
    ├── CMShop.PaymentAPI/   # Processamento de pagamentos (Pix, Cartão, Boleto)

├── docker/                  # Configurações dos containers
│   ├── sqlserver/           # Scripts e configs do banco
│   └── rabbitmq/            # Configurações do RabbitMQ
│
├── tests/                   # Testes unitários e de integração
├── docs/                    # Documentação do sistema
├── .gitignore               # Arquivos/dirs ignorados pelo Git
├── docker-compose.yml       # Orquestração de serviços com Docker
├── README.md                # Documentação inicial do projeto
└── CHANGELOG.md             # Histórico de mudanças
```
Para rodar todos os microserviços 
utilizar 
```
.\start-all-services.bat
```
