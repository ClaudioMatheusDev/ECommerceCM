using AutoMapper;
using CMShop.MessageBus;
using CMShop.PaymentAPI.Config;
using CMShop.PaymentAPI.MessageConsumer;
using CMShop.PaymentAPI.Model.Context;
using CMShop.PaymentAPI.Repository;
using CMShop.PaymentAPI.Services;
using CMShop.PaymentAPI.RabbitMQSender;
using CMShop.PaymentProcessor;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Obter a string de conexão do appsettings.json
var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

// Configurar AutoMapper
IMapper mapper = MappingConfig.RegisterMaps().CreateMapper();
builder.Services.AddSingleton(mapper);

// Registrar os repositórios
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

// Registrar os serviços
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Registrar o PaymentProcessor
builder.Services.AddScoped<IProcessPayment, ProcessPayment>();

// Registrar o RabbitMQMessageSender
builder.Services.AddScoped<IRabbitMQMessageSender, RabbitMQMessageSender>();

// Registrar o MessageBus
builder.Services.AddSingleton<IMessageBus, CMShop.MessageBus.MessageBus>();

// Comentado temporariamente para permitir a criação das migrações
// Registrar o MessageConsumer
// Message Bus - RabbitMQ Consumer
builder.Services.AddHostedService<RabbitMQPaymentConsumer>();

// Registrar IHttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Configurar JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://localhost:7000"; // IdentityServer URL
        options.RequireHttpsMetadata = false; // Para desenvolvimento
        options.Audience = "https://localhost:7000/resources";
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = "https://localhost:7000",
            ValidAudience = "https://localhost:7000/resources"
        };

        // Para debug em desenvolvimento
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"Token validated for: {context.Principal?.Identity?.Name}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Client", policy => policy.RequireRole("Client"));
    options.AddPolicy("AdminOrClient", policy => policy.RequireRole("Admin", "Client"));
});

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CM Shop Payment API",
        Version = "v1",
        Description = "API de gerenciamento de pagamentos"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
