"""
Script de Configuração e Validação do Ambiente para Teste de Mensagerias
========================================================================

Este script verifica se o ambiente está corretamente configurado para executar
os testes de mensageria dos microserviços CMShop.

Executa verificações de:
- RabbitMQ Server
- Dependências Python
- Conectividade
- Configuração das filas
"""

import sys
import subprocess
import socket
import json
from typing import Dict, List, Tuple

def check_python_version() -> Tuple[bool, str]:
    """Verifica se a versão do Python é compatível"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        return True, f"Python {version.major}.{version.minor}.{version.micro} ✅"
    else:
        return False, f"Python {version.major}.{version.minor}.{version.micro} ❌ (Requer Python 3.8+)"

def check_pip_packages() -> Tuple[bool, List[str]]:
    """Verifica se os pacotes necessários estão instalados"""
    required_packages = ['pika', 'colorama', 'python-dotenv']
    results = []
    all_installed = True
    
    for package in required_packages:
        try:
            __import__(package)
            results.append(f"{package} ✅")
        except ImportError:
            results.append(f"{package} ❌ (Não instalado)")
            all_installed = False
    
    return all_installed, results

def check_rabbitmq_connection() -> Tuple[bool, str]:
    """Verifica se o RabbitMQ está acessível"""
    try:
        import pika
        
        connection_params = pika.ConnectionParameters(
            host='localhost',
            port=5672,
            credentials=pika.PlainCredentials('guest', 'guest')
        )
        
        connection = pika.BlockingConnection(connection_params)
        connection.close()
        
        return True, "RabbitMQ Server ✅ (Conectado com sucesso)"
        
    except ImportError:
        return False, "RabbitMQ ❌ (Biblioteca pika não instalada)"
    except Exception as e:
        return False, f"RabbitMQ ❌ (Erro de conexão: {str(e)})"

def check_port_availability(host: str, port: int) -> Tuple[bool, str]:
    """Verifica se uma porta está acessível"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            return True, f"Porta {port} ✅ (Acessível)"
        else:
            return False, f"Porta {port} ❌ (Não acessível)"
            
    except Exception as e:
        return False, f"Porta {port} ❌ (Erro: {str(e)})"

def install_requirements():
    """Instala as dependências necessárias"""
    print("📦 Instalando dependências...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "-r", "requirements_messaging_test.txt"
        ])
        print("✅ Dependências instaladas com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False
    except FileNotFoundError:
        print("❌ Arquivo requirements_messaging_test.txt não encontrado")
        return False

def create_rabbitmq_docker_compose():
    """Cria um docker-compose.yml para subir o RabbitMQ localmente"""
    docker_compose_content = """version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: cmshop-rabbitmq
    ports:
      - "5672:5672"     # AMQP port
      - "15672:15672"   # Management UI port
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - cmshop-network

volumes:
  rabbitmq_data:

networks:
  cmshop-network:
    driver: bridge
"""
    
    try:
        with open('docker-compose-rabbitmq.yml', 'w', encoding='utf-8') as f:
            f.write(docker_compose_content)
        
        print("✅ Arquivo docker-compose-rabbitmq.yml criado!")
        print("\n📋 Para iniciar o RabbitMQ, execute:")
        print("   docker-compose -f docker-compose-rabbitmq.yml up -d")
        print("\n🌐 Interface de gerenciamento:")
        print("   http://localhost:15672 (guest/guest)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar docker-compose: {e}")
        return False

def display_microservices_info():
    """Exibe informações sobre os microserviços"""
    info = """
🏗️  ARQUITETURA DOS MICROSERVIÇOS CMSHOP
==========================================

🔄 FLUXO DE MENSAGERIAS:
------------------------
1. CartAPI         → checkoutqueue              (CheckoutHeaderVO)
2. OrderAPI        → orderpaymentprocessqueue   (PaymentMessage)
3. PaymentAPI      → orderpaymentresultqueue   (UpdatePaymentResultMessage)
4. OrderAPI        ← orderpaymentresultqueue   (Processa resultado)

📋 FILAS UTILIZADAS:
-------------------
• checkoutqueue              → Processar checkout do carrinho
• orderpaymentprocessqueue   → Processar pagamentos
• orderpaymentresultqueue    → Resultado dos pagamentos

🚀 PORTAS DOS SERVIÇOS:
----------------------
• API Gateway:    7100 (HTTP) / 7101 (HTTPS)
• Product API:    7199 (HTTPS)
• Cart API:       7190 (HTTPS)
• Order API:      7180 (HTTPS)
• Payment API:    7170 (HTTPS)
• Identity Server: 7000 (HTTPS)

🔧 CONFIGURAÇÃO RABBITMQ:
------------------------
• Host: localhost
• Port: 5672 (AMQP)
• Management: 15672 (HTTP)
• Usuário: guest
• Senha: guest
"""
    print(info)

def main():
    """Função principal de validação do ambiente"""
    print("\n" + "="*70)
    print("🔧 VALIDAÇÃO DO AMBIENTE - TESTE DE MENSAGERIAS CMSHOP")
    print("="*70)
    
    # Verificações
    checks = []
    
    # Python
    python_ok, python_msg = check_python_version()
    checks.append(("Python", python_ok, python_msg))
    
    # Pacotes
    packages_ok, package_results = check_pip_packages()
    checks.append(("Pacotes Python", packages_ok, "\n    ".join(package_results)))
    
    # RabbitMQ
    rabbitmq_ok, rabbitmq_msg = check_rabbitmq_connection()
    checks.append(("RabbitMQ", rabbitmq_ok, rabbitmq_msg))
    
    # Porta RabbitMQ
    port_ok, port_msg = check_port_availability('localhost', 5672)
    checks.append(("Porta RabbitMQ", port_ok, port_msg))
    
    # Exibe resultados
    print("\n📊 RESULTADOS DA VERIFICAÇÃO:")
    print("-" * 50)
    
    all_ok = True
    for check_name, is_ok, message in checks:
        status = "✅" if is_ok else "❌"
        print(f"{status} {check_name:15} - {message}")
        if not is_ok:
            all_ok = False
    
    print("\n" + "="*70)
    
    if all_ok:
        print("🎉 AMBIENTE CONFIGURADO CORRETAMENTE!")
        print("\n🚀 Você pode executar o teste de mensagerias:")
        print("   python test_messaging.py")
    else:
        print("⚠️  PROBLEMAS DETECTADOS NO AMBIENTE")
        print("\n🔧 SOLUÇÕES RECOMENDADAS:")
        
        if not packages_ok:
            print("\n📦 Para instalar dependências Python:")
            choice = input("   Deseja instalar automaticamente? (s/N): ").strip().lower()
            if choice == 's':
                install_requirements()
        
        if not rabbitmq_ok:
            print("\n🐰 Para configurar RabbitMQ:")
            print("   Opção 1: Instalar localmente")
            print("   Opção 2: Usar Docker")
            
            choice = input("   Deseja criar docker-compose para RabbitMQ? (s/N): ").strip().lower()
            if choice == 's':
                create_rabbitmq_docker_compose()
    
    # Sempre exibe informações dos microserviços
    print("\n" + "="*70)
    display_microservices_info()

if __name__ == "__main__":
    main()