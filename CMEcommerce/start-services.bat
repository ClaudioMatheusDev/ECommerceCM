@echo off
REM Script para Windows - Iniciar todos os serviços do CMShop

echo 🚀 Iniciando CMShop E-Commerce com API Gateway...

REM Verificar se está na pasta correta
if not exist "CMEcommerce.sln" (
    echo ❌ Execute este script na pasta raiz do projeto CMEcommerce
    pause
    exit /b 1
)

echo 📦 Restaurando pacotes NuGet...
dotnet restore

echo 🏗️ Compilando projetos...
dotnet build

echo 🌐 Iniciando API Gateway na porta 7101...
start "API Gateway" cmd /k "cd CMShop.APIGateway && dotnet run --urls=https://localhost:7101"

timeout /t 5 /nobreak

echo 🛒 Iniciando Product API na porta 7199...
start "Product API" cmd /k "cd CMShop.ProductAPI && dotnet run --urls=https://localhost:7199"

timeout /t 5 /nobreak

echo 💻 Iniciando Frontend React na porta 3000...
start "Frontend React" cmd /k "cd frontend && npm install && npm start"

echo.
echo ✅ Todos os serviços foram iniciados!
echo.
echo 📋 URLs dos Serviços:
echo 🌐 API Gateway:    https://localhost:7101
echo 🛒 Product API:    https://localhost:7199
echo 💻 Frontend:       http://localhost:3000
echo.
echo 🔍 Monitoramento:
echo ❤️  Health Check:   https://localhost:7101/api/health
echo 🔧 Services Status: https://localhost:7101/api/health/services
echo 🗺️  Available Routes: https://localhost:7101/api/health/routes
echo.
echo Para parar todos os serviços, feche as janelas do terminal abertas.
echo.
pause
