"""
Script de Diagnóstico para Problemas de Conexão RabbitMQ
========================================================

Este script ajuda a diagnosticar e resolver problemas de conexão
com RabbitMQ durante testes de carga, incluindo:

- Verificação de status do RabbitMQ
- Monitoramento de conexões
- Análise de logs
- Sugestões de otimização
"""

import pika
import time
import psutil
import subprocess
import json
import requests
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RabbitMQDiagnostic:
    """Classe para diagnóstico de problemas do RabbitMQ"""
    
    def __init__(self):
        self.rabbitmq_host = "localhost"
        self.rabbitmq_port = 5672
        self.management_port = 15672
        self.username = "guest"
        self.password = "guest"
    
    def check_rabbitmq_process(self):
        """Verifica se o processo RabbitMQ está rodando"""
        logger.info("🔍 Verificando processo RabbitMQ...")
        
        # Procura por processos RabbitMQ
        rabbitmq_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'cpu_percent']):
            try:
                if 'rabbitmq' in proc.info['name'].lower() or 'beam' in proc.info['name'].lower():
                    rabbitmq_processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        if rabbitmq_processes:
            logger.info("✅ RabbitMQ está rodando:")
            for proc in rabbitmq_processes:
                memory_mb = proc['memory_info'].rss / 1024 / 1024
                logger.info(f"   • PID: {proc['pid']}, Processo: {proc['name']}")
                logger.info(f"   • Memória: {memory_mb:.1f} MB, CPU: {proc['cpu_percent']:.1f}%")
            return True
        else:
            logger.warning("❌ RabbitMQ não está rodando!")
            return False
    
    def check_docker_rabbitmq(self):
        """Verifica se RabbitMQ Docker está rodando"""
        logger.info("🐳 Verificando RabbitMQ no Docker...")
        
        try:
            result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
            if result.returncode == 0:
                if 'rabbitmq' in result.stdout.lower():
                    logger.info("✅ Container RabbitMQ encontrado no Docker")
                    
                    # Verifica logs do container
                    logger.info("📋 Últimas linhas do log do RabbitMQ:")
                    log_result = subprocess.run(
                        ['docker', 'logs', '--tail', '10', 'cmshop-rabbitmq'], 
                        capture_output=True, text=True
                    )
                    if log_result.returncode == 0:
                        print(log_result.stdout)
                    
                    return True
                else:
                    logger.warning("❌ Container RabbitMQ não encontrado")
                    return False
            else:
                logger.warning("❌ Docker não está disponível")
                return False
        except FileNotFoundError:
            logger.warning("❌ Docker não está instalado")
            return False
    
    def test_connection(self):
        """Testa conexão básica com RabbitMQ"""
        logger.info("🔌 Testando conexão com RabbitMQ...")
        
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            connection_params = pika.ConnectionParameters(
                host=self.rabbitmq_host,
                port=self.rabbitmq_port,
                credentials=credentials,
                heartbeat=30,  # Aumenta heartbeat
                blocked_connection_timeout=300,  # Timeout maior
            )
            
            connection = pika.BlockingConnection(connection_params)
            channel = connection.channel()
            
            # Testa declaração de fila
            channel.queue_declare(queue='diagnostic_test', auto_delete=True)
            
            connection.close()
            logger.info("✅ Conexão com RabbitMQ bem-sucedida")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro na conexão: {e}")
            return False
    
    def check_management_api(self):
        """Verifica API de gerenciamento do RabbitMQ"""
        logger.info("🌐 Verificando API de gerenciamento...")
        
        try:
            url = f"http://{self.rabbitmq_host}:{self.management_port}/api/overview"
            response = requests.get(url, auth=(self.username, self.password), timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ API de gerenciamento acessível")
                logger.info(f"   • Versão RabbitMQ: {data.get('rabbitmq_version', 'N/A')}")
                logger.info(f"   • Mensagens em filas: {data.get('queue_totals', {}).get('messages', 'N/A')}")
                return True
            else:
                logger.warning(f"❌ API retornou status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao acessar API: {e}")
            return False
    
    def get_connection_info(self):
        """Obtém informações sobre conexões ativas"""
        logger.info("🔗 Verificando conexões ativas...")
        
        try:
            url = f"http://{self.rabbitmq_host}:{self.management_port}/api/connections"
            response = requests.get(url, auth=(self.username, self.password), timeout=5)
            
            if response.status_code == 200:
                connections = response.json()
                logger.info(f"✅ Conexões ativas: {len(connections)}")
                
                for i, conn in enumerate(connections[:5]):  # Mostra até 5 conexões
                    logger.info(f"   • Conexão {i+1}:")
                    logger.info(f"     - Cliente: {conn.get('client_properties', {}).get('connection_name', 'N/A')}")
                    logger.info(f"     - Estado: {conn.get('state', 'N/A')}")
                    logger.info(f"     - Canais: {conn.get('channels', 0)}")
                
                if len(connections) > 10:
                    logger.warning(f"⚠️  Muitas conexões ativas ({len(connections)}). Isso pode causar problemas!")
                
                return len(connections)
            else:
                logger.warning("❌ Não foi possível obter informações de conexões")
                return -1
                
        except Exception as e:
            logger.error(f"❌ Erro ao obter conexões: {e}")
            return -1
    
    def get_queue_info(self):
        """Obtém informações sobre as filas"""
        logger.info("📋 Verificando status das filas...")
        
        try:
            url = f"http://{self.rabbitmq_host}:{self.management_port}/api/queues"
            response = requests.get(url, auth=(self.username, self.password), timeout=5)
            
            if response.status_code == 200:
                queues = response.json()
                
                target_queues = ['checkoutqueue', 'orderpaymentprocessqueue', 'orderpaymentresultqueue']
                
                for queue_name in target_queues:
                    queue_info = next((q for q in queues if q['name'] == queue_name), None)
                    if queue_info:
                        messages = queue_info.get('messages', 0)
                        consumers = queue_info.get('consumers', 0)
                        state = queue_info.get('state', 'N/A')
                        
                        logger.info(f"✅ {queue_name}:")
                        logger.info(f"   • Mensagens: {messages}")
                        logger.info(f"   • Consumidores: {consumers}")
                        logger.info(f"   • Estado: {state}")
                        
                        if messages > 1000:
                            logger.warning(f"⚠️  Fila {queue_name} com muitas mensagens ({messages})!")
                        
                        if consumers == 0 and messages > 0:
                            logger.warning(f"⚠️  Fila {queue_name} sem consumidores mas com mensagens!")
                    else:
                        logger.warning(f"❌ Fila {queue_name} não encontrada")
                
                return True
            else:
                logger.warning("❌ Não foi possível obter informações das filas")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao obter filas: {e}")
            return False
    
    def suggest_solutions(self):
        """Sugere soluções para problemas comuns"""
        logger.info("\n💡 SUGESTÕES DE SOLUÇÃO:")
        logger.info("=" * 50)
        
        print("""
🔧 PROBLEMAS COMUNS E SOLUÇÕES:

1. 🐰 RabbitMQ para de responder durante testes de carga:
   • Aumentar limites de memória do RabbitMQ
   • Configurar heartbeat maior nos clientes
   • Usar connection pooling
   • Processar mensagens em lotes menores

2. 🔗 Muitas conexões ativas:
   • Reutilizar conexões existentes
   • Implementar connection pooling
   • Fechar conexões adequadamente
   • Usar menos threads concorrentes

3. 📋 Filas com muitas mensagens não processadas:
   • Verificar se consumidores estão rodando
   • Aumentar número de consumidores
   • Verificar processamento dos microserviços

4. 🐳 Container Docker com problemas:
   • Reiniciar container: docker-compose restart rabbitmq
   • Verificar recursos: docker stats
   • Aumentar limites de memória no docker-compose.yml

5. ⚡ Para testes de carga:
   • Usar menos threads concorrentes (máx 5-10)
   • Adicionar delay entre mensagens (10-50ms)
   • Processar em lotes menores (100-500 mensagens)
   • Monitorar uso de recursos
        """)
    
    def run_comprehensive_check(self):
        """Executa verificação completa"""
        logger.info("\n🔍 DIAGNÓSTICO COMPLETO DO RABBITMQ")
        logger.info("=" * 60)
        
        checks = []
        
        # Verifica processo
        process_ok = self.check_rabbitmq_process()
        checks.append(("Processo RabbitMQ", process_ok))
        
        # Verifica Docker
        docker_ok = self.check_docker_rabbitmq()
        checks.append(("Container Docker", docker_ok))
        
        # Testa conexão
        connection_ok = self.test_connection()
        checks.append(("Conexão AMQP", connection_ok))
        
        # Verifica API
        api_ok = self.check_management_api()
        checks.append(("API Management", api_ok))
        
        if api_ok:
            # Informações detalhadas
            num_connections = self.get_connection_info()
            queue_ok = self.get_queue_info()
            checks.append(("Informações de Filas", queue_ok))
        
        # Resumo
        logger.info("\n📊 RESUMO DO DIAGNÓSTICO:")
        logger.info("-" * 40)
        
        all_ok = True
        for check_name, result in checks:
            status = "✅" if result else "❌"
            logger.info(f"{status} {check_name}")
            if not result:
                all_ok = False
        
        if all_ok:
            logger.info("\n🎉 RabbitMQ está funcionando corretamente!")
        else:
            logger.info("\n⚠️  Problemas detectados no RabbitMQ")
            self.suggest_solutions()
        
        return all_ok

def restart_rabbitmq_docker():
    """Reinicia o container RabbitMQ"""
    logger.info("🔄 Reiniciando container RabbitMQ...")
    
    try:
        # Para o container
        subprocess.run(['docker-compose', '-f', 'docker-compose-rabbitmq.yml', 'down'], 
                      check=True, capture_output=True)
        
        time.sleep(2)
        
        # Inicia novamente
        subprocess.run(['docker-compose', '-f', 'docker-compose-rabbitmq.yml', 'up', '-d'], 
                      check=True, capture_output=True)
        
        logger.info("✅ Container RabbitMQ reiniciado")
        
        # Aguarda RabbitMQ ficar pronto
        logger.info("⏳ Aguardando RabbitMQ ficar pronto...")
        for i in range(30):
            try:
                credentials = pika.PlainCredentials('guest', 'guest')
                connection_params = pika.ConnectionParameters(
                    host='localhost',
                    port=5672,
                    credentials=credentials
                )
                connection = pika.BlockingConnection(connection_params)
                connection.close()
                logger.info("✅ RabbitMQ está pronto!")
                return True
            except:
                time.sleep(2)
        
        logger.warning("⚠️  RabbitMQ pode ainda não estar pronto")
        return False
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Erro ao reiniciar container: {e}")
        return False
    except FileNotFoundError:
        logger.error("❌ docker-compose não encontrado")
        return False

def main():
    """Função principal"""
    print("\n" + "=" * 70)
    print("🔧 DIAGNÓSTICO DE PROBLEMAS RABBITMQ - CMSHOP")
    print("=" * 70)
    
    diagnostic = RabbitMQDiagnostic()
    
    print("\nOpções disponíveis:")
    print("1. 🔍 Diagnóstico completo")
    print("2. 🔄 Reiniciar RabbitMQ Docker")
    print("3. 📋 Verificar apenas filas")
    print("4. 🔗 Verificar apenas conexões")
    print("5. 💡 Ver sugestões de otimização")
    print("6. Sair")
    
    while True:
        choice = input("\nEscolha uma opção (1-6): ").strip()
        
        if choice == '1':
            diagnostic.run_comprehensive_check()
            
        elif choice == '2':
            restart_rabbitmq_docker()
            
        elif choice == '3':
            diagnostic.get_queue_info()
            
        elif choice == '4':
            diagnostic.get_connection_info()
            
        elif choice == '5':
            diagnostic.suggest_solutions()
            
        elif choice == '6':
            print("👋 Saindo...")
            break
            
        else:
            print("❌ Opção inválida!")

if __name__ == "__main__":
    main()