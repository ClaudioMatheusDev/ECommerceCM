#!/bin/bash

# Script para parar todos os serviços do CMShop

echo "🛑 Parando todos os serviços do CMShop..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para parar serviço
stop_service() {
    local service_name=$1
    local pid_file="/tmp/cmshop_${service_name,,}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Parando $service_name (PID: $pid)...${NC}"
            kill "$pid"
            rm "$pid_file"
        else
            echo -e "${RED}$service_name não está rodando${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${RED}Arquivo PID para $service_name não encontrado${NC}"
    fi
}

# Parar todos os serviços
stop_service "APIGateway"
stop_service "ProductAPI"
stop_service "Frontend"

# Parar qualquer processo dotnet restante nas portas específicas
echo -e "${YELLOW}Verificando processos nas portas 7101, 7199, 3000...${NC}"

# Para Windows (PowerShell)
if command -v powershell &> /dev/null; then
    powershell -Command "Get-NetTCPConnection -LocalPort 7101 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
    powershell -Command "Get-NetTCPConnection -LocalPort 7199 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
    powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
fi

# Para Linux/macOS
if command -v lsof &> /dev/null; then
    lsof -ti:7101 | xargs kill -9 2>/dev/null || true
    lsof -ti:7199 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

echo -e "${GREEN}✅ Todos os serviços foram parados!${NC}"
