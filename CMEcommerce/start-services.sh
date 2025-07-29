#!/bin/bash

# Script para iniciar todos os serviços do CMShop

echo "🚀 Iniciando CMShop E-Commerce com API Gateway..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para iniciar serviço em background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo -e "${BLUE}Iniciando $service_name na porta $port...${NC}"
    cd "$service_path"
    dotnet run --urls="https://localhost:$port" &
    echo $! > "/tmp/cmshop_${service_name,,}.pid"
    cd - > /dev/null
}

# Verificar se está na pasta correta
if [ ! -f "CMEcommerce.sln" ]; then
    echo -e "${RED}❌ Execute este script na pasta raiz do projeto CMEcommerce${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Restaurando pacotes NuGet...${NC}"
dotnet restore

echo -e "${YELLOW}🏗️ Compilando projetos...${NC}"
dotnet build

# Iniciar API Gateway
start_service "APIGateway" "./CMShop.APIGateway" "7101"
sleep 3

# Iniciar Product API
start_service "ProductAPI" "./CMShop.ProductAPI" "7199"
sleep 3

# Iniciar Frontend
echo -e "${BLUE}Iniciando Frontend React na porta 3000...${NC}"
cd "./frontend"
npm install
npm start &
echo $! > "/tmp/cmshop_frontend.pid"
cd - > /dev/null

echo ""
echo -e "${GREEN}✅ Todos os serviços foram iniciados!${NC}"
echo ""
echo -e "${YELLOW}📋 URLs dos Serviços:${NC}"
echo -e "🌐 API Gateway:    https://localhost:7101"
echo -e "🛒 Product API:    https://localhost:7199"
echo -e "💻 Frontend:       http://localhost:3000"
echo ""
echo -e "${YELLOW}🔍 Monitoramento:${NC}"
echo -e "❤️  Health Check:   https://localhost:7101/api/health"
echo -e "🔧 Services Status: https://localhost:7101/api/health/services"
echo -e "🗺️  Available Routes: https://localhost:7101/api/health/routes"
echo ""
echo -e "${BLUE}Para parar todos os serviços, execute: ./stop-services.sh${NC}"

# Manter o script rodando
wait
