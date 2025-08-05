# start-all-services.ps1
# Script para iniciar todos os serviços do CMEcommerce

Write-Host "=== Iniciando CMEcommerce Microservices ===" -ForegroundColor Green
Write-Host ""

# Diretório base
$baseDir = "c:\Users\claud\OneDrive\Desktop\PROJETOS\PROJETOS\CMEcommerce\CMEcommerce\ECommerceCM\CMEcommerce"
$frontendDir = "c:\Users\claud\OneDrive\Desktop\PROJETOS\PROJETOS\CMEcommerce\CMEcommerce\ECommerceCM\CMEcommerce\frontend"

# Função para iniciar um serviço em nova janela PowerShell
function Start-Service {
    param($Name, $Directory, $Command, $Port)
    
    Write-Host "Iniciando $Name na porta $Port..." -ForegroundColor Yellow
    
    $scriptBlock = @"
cd '$Directory'
Write-Host '=== $Name iniciado ===' -ForegroundColor Green
Write-Host 'Porta: $Port' -ForegroundColor Cyan
Write-Host 'Diretório: $Directory' -ForegroundColor Gray
Write-Host ''
$Command
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    Start-Sleep -Seconds 2
}

# 1. IdentityServer (porta 7000)
Write-Host "1. Iniciando IdentityServer..." -ForegroundColor Cyan
Start-Service -Name "IdentityServer" -Directory "$baseDir\CMShop.IdentityServer" -Command "dotnet run" -Port "7000"

# 2. ProductAPI (porta 7199)  
Write-Host "2. Iniciando ProductAPI..." -ForegroundColor Cyan
Start-Service -Name "ProductAPI" -Directory "$baseDir\CMShop.ProductAPI" -Command "dotnet run" -Port "7199"

# 3. API Gateway (porta 7101)
Write-Host "3. Iniciando API Gateway..." -ForegroundColor Cyan
Start-Service -Name "APIGateway" -Directory "$baseDir\CMShop.APIGateway" -Command "dotnet run" -Port "7101"

# 4. Frontend React (porta 3000)
Write-Host "4. Iniciando Frontend React..." -ForegroundColor Cyan
Start-Service -Name "Frontend React" -Directory "$frontendDir" -Command "npm start" -Port "3000"

Write-Host ""
Write-Host "=== Todos os serviços foram iniciados! ===" -ForegroundColor Green
Write-Host ""
Write-Host "URLs dos serviços:" -ForegroundColor White
Write-Host "• IdentityServer: https://localhost:7000" -ForegroundColor Yellow
Write-Host "• ProductAPI: https://localhost:7199" -ForegroundColor Yellow  
Write-Host "• API Gateway: https://localhost:7101" -ForegroundColor Yellow
Write-Host "• Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Usuários de teste:" -ForegroundColor White
Write-Host "• Admin: usuario=admin, senha=admin123" -ForegroundColor Cyan
Write-Host "• Cliente: usuario=cliente, senha=cliente123" -ForegroundColor Cyan
Write-Host "• Cliente: usuario=maria, senha=maria123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguarde cerca de 30-60 segundos para todos os serviços iniciarem completamente." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o navegador..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Write-Host "Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3000"
