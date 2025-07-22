@echo off
echo 🚀 Iniciando CMShop E-Commerce com API Gateway...

REM Verificar se está na pasta correta
if not exist "CMEcommerce.sln" (
    echo ❌ Execute este script na pasta raiz do projeto CMEcommerce
    pause
    exit /b 1
)

echo � Configurando certificados SSL para desenvolvimento...
dotnet dev-certs https --trust

echo �📦 Restaurando pacotes NuGet...
dotnet restore

echo 🏗️ Compilando projetos...
dotnet build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro na compilação. Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo 🌐 Iniciando serviços em janelas separadas...
echo.

echo 🔧 1. Iniciando API Gateway na porta 7101...
start "🌐 API Gateway" cmd /k "cd CMShop.APIGateway && dotnet run --environment Development"

timeout /t 5

echo 🛒 2. Iniciando Product API na porta 7199...
start "🛒 Product API" cmd /k "cd CMShop.ProductAPI && dotnet run --launch-profile https"

timeout /t 5

echo 💻 3. Iniciando Frontend na porta 3000...
start "💻 Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo ✅ Todos os serviços foram iniciados!
echo.
echo 📋 URLs disponíveis:
echo   🌐 API Gateway:     https://localhost:7101
echo   🛒 Product API:     https://localhost:7199  
echo   💻 Frontend:        http://localhost:3000
echo.
echo 🧪 Endpoints de teste:
echo   📊 Health Gateway:  https://localhost:7101/api/health
echo   📊 Health Services: https://localhost:7101/api/health/services
echo   📊 Routes Info:     https://localhost:7101/api/health/routes
echo   🛒 Products:        https://localhost:7101/gateway/products
echo   💻 Frontend App:    https://localhost:7101/app/
echo.
echo ⚠️  Aguarde alguns segundos para que todos os serviços sejam iniciados.
echo ⚠️  Para parar todos os serviços, feche as janelas ou pressione Ctrl+C em cada uma.
echo.
pause
