using CMShop.IdentityServer.Configuration;
using CMShop.IdentityServer.Initializer;
using CMShop.IdentityServer.Model;
using CMShop.IdentityServer.Model.Context;
using CMShop.IdentityServer.Pages;
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

// Comentado - não necessário para TestUsers em desenvolvimento
// var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
// builder.Services.AddDbContext<SqlContext>(options =>
//     options.UseSqlServer(connection));

// Comentado para usar apenas TestUsers em desenvolvimento
// builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
//     .AddEntityFrameworkStores<SqlContext>()
//     .AddDefaultTokenProviders();

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
     .AddTestUsers(TestUsers.Users) // Usuários de teste em memória
     // Removido .AddAspNetIdentity<ApplicationUser>() para evitar conflito com TestUsers
     .AddDeveloperSigningCredential(); 

// Removido serviço DbInitializer - não necessário para TestUsers
// builder.Services.AddScoped<IDbInitializer, DbInitializer>();


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

// Comentado - não necessário para TestUsers
// using (var scope = app.Services.CreateScope())
// {
//     var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
//     initializer.Initialize();
// }

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();