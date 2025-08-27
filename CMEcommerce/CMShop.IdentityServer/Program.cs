using CMShop.IdentityServer.Configuration;
using CMShop.IdentityServer.Initializer;
using CMShop.IdentityServer.Model;
using CMShop.IdentityServer.Model.Context;
using CMShop.IdentityServer.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// Configurar CORS para permitir requisições do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "https://localhost:7101"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

// Configurar ASP.NET Core Identity para usuários reais
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<SqlContext>()
    .AddDefaultTokenProviders();

builder.Services.AddIdentityServer(options =>
{
    options.EmitStaticAudienceClaim = true;
    options.Events.RaiseErrorEvents = true;
    options.Events.RaiseInformationEvents = true;
    options.Events.RaiseFailureEvents = true;
    options.Events.RaiseSuccessEvents = true;
}).AddInMemoryIdentityResources(IdentityConfiguration.IdentityResource)
     .AddInMemoryClients(IdentityConfiguration.Clients)
     .AddInMemoryApiScopes(IdentityConfiguration.ApiScopes)
     .AddAspNetIdentity<ApplicationUser>() // Usar ASP.NET Core Identity
     .AddProfileService<ProfileService>() // Adicionar ProfileService customizado
     .AddDeveloperSigningCredential(); 

// Configurar serviço para inicializar banco e usuários
builder.Services.AddScoped<IDbInitializer, DbInitializer>();


var app = builder.Build();

// Configura��o do pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

// Usar CORS antes do IdentityServer
app.UseCors("AllowFrontend");

app.UseIdentityServer();

app.UseAuthorization();

// Inicializar banco de dados e usuários padrão
using (var scope = app.Services.CreateScope())
{
    // Primeiro, garantir que o banco e as tabelas existam
    var context = scope.ServiceProvider.GetRequiredService<SqlContext>();
    context.Database.EnsureCreated();
    
    // Depois inicializar os dados
    var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
    initializer.Initialize();
}

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();