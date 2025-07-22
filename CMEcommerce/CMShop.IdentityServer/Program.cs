using CMShop.IdentityServer.Configuration;
using CMShop.IdentityServer.Model;
using CMShop.IdentityServer.Model.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

var connection = builder.Configuration["SqlContext:SqlConnectionString"];

// Configurar o DbContext com SQL Server
builder.Services.AddDbContext<SqlContext>(options =>
    options.UseSqlServer(connection));

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
     .AddAspNetIdentity<ApplicationUser>()
     .AddDeveloperSigningCredential(); 


var app = builder.Build();

// Configuração do pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseIdentityServer();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();