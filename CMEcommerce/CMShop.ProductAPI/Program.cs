using AutoMapper;
using CMShop.ProductAPI.Config;
using CMShop.ProductAPI.Model.Context;
using CMShop.ProductAPI.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Obter a string de conex�o do appsettings.json
var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

// Configurar AutoMapper
IMapper mapper = MappingConfig.RegisterMaps().CreateMapper();
builder.Services.AddSingleton(mapper);
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Registrar o reposit�rio de produtos
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Configurar CORS para aceitar requisi��es do frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000", // React
            "http://localhost:5155"  // Swagger
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// Adicionar controllers
builder.Services.AddControllers();

// Configurar Swagger (opcional, para documenta��o)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configura��o do pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Usar CORS com a pol�tica definida
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
