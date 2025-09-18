using AutoMapper;
using CMShop.OrderAPI.Config;
using CMShop.OrderAPI.Model.Context;
using CMShop.OrderAPI.Repository;
using CMShop.OrderAPI.MessageConsumer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CMShop.OrderAPI.RabbitMQSender;

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

// Registrar o repositório de pedidos
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// Registrar o MessageBus
builder.Services.AddSingleton<CMShop.MessageBus.IMessageBus, CMShop.MessageBus.MessageBus>();

builder.Services.AddSingleton<IRabbitMQMessageSender, RabbitMQMessageSender>();

// Registrar o MessageConsumer
builder.Services.AddHostedService<CMShop.OrderAPI.MessageConsumer.RabbitMQCheckoutConsumer>();
//builder.Services.AddHostedService<CMShop.OrderAPI.MessageConsumer.RabbitMQPaymentConsumer>();

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
        Title = "CM Shop Order API",
        Version = "v1",
        Description = "API de gerenciamento de pedidos"
    });
    
    // Configurar autenticação JWT no Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
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
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Aplicar migrations automaticamente em desenvolvimento
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<SqlContext>();
        context.Database.EnsureCreated();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CM Shop Order API v1");
        c.RoutePrefix = string.Empty; // Define swagger na raiz
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

// Adicionar autenticação e autorização
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
