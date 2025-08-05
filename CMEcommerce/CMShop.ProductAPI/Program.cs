using AutoMapper;
using CMShop.ProductAPI.Config;
using CMShop.ProductAPI.Model.Context;
using CMShop.ProductAPI.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Obter a string de conexão do appsettings.json
var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

// Configurar AutoMapper
IMapper mapper = MappingConfig.RegisterMaps().CreateMapper();
builder.Services.AddSingleton(mapper);
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Registrar o repositório de produtos
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Configurar autenticação JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://localhost:7000"; // URL do IdentityServer
        options.RequireHttpsMetadata = false; // Para desenvolvimento
        options.Audience = "product"; // Nome do escopo/audiência configurado no IdentityServer
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Configurar autorização
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Client", policy => policy.RequireRole("Client"));
    options.AddPolicy("AdminOrClient", policy => policy.RequireRole("Admin", "Client"));
});

// Configurar CORS para aceitar requisições do frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000", // React
            "https://localhost:7101", // API Gateway
            "http://localhost:5155"  // Swagger
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Adicionar controllers
builder.Services.AddControllers();

// Configurar Swagger (opcional, para documentação)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configuração do pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Usar CORS com a política definida
app.UseCors("AllowFrontend");

// Usar autenticação e autorização
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
