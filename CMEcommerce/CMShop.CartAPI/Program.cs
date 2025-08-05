using AutoMapper;
using CMShop.CartAPI.Config;
using CMShop.CartAPI.Model.Context;
using CMShop.CartAPI.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Obter a string de conexão do appsettings.json
var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

IMapper mapper = MappingConfig.RegisterMaps().CreateMapper();
builder.Services.AddSingleton(mapper);
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Registrar o repositório de produtos
builder.Services.AddScoped<ICartRepository, CartRepository>();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
