using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configurar Ocelot com arquivos específicos do ambiente
/// <summary>
/// Recupera o nome do ambiente de hospedagem atual da aplicação (por exemplo, "Development", "Staging", "Production").
/// Útil para configurar definições e comportamentos específicos de cada ambiente.
/// </summary>
var environment = builder.Environment.EnvironmentName;
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"ocelot.{environment}.json", optional: true, reloadOnChange: true);

builder.Services.AddOcelot(builder.Configuration);

// Adicionar Controllers
builder.Services.AddControllers();

// Adicionar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Adicionar serviços básicos
builder.Services.AddLogging();

var app = builder.Build();

// Configurar pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseCors("AllowAllOrigins");

// Mapear controllers para rotas específicas (como /api/health)
app.MapControllers();

// Usar Ocelot apenas para rotas que começam com /gateway ou outras específicas
app.UseWhen(context => 
    context.Request.Path.StartsWithSegments("/gateway") ||
    context.Request.Path.StartsWithSegments("/app") ||
    context.Request.Path.StartsWithSegments("/connect") ||
    context.Request.Path.StartsWithSegments("/identity"),
    appBuilder =>
    {
        appBuilder.UseOcelot().Wait();
    });

app.Run();
