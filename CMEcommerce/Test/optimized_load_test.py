"""
Script Otimizado para Testes de Carga - Sem Perda de Conexão
============================================================

Este script resolve problemas de conexão durante testes de carga
implementando:

- Connection pooling (reutilização de conexões)
- Heartbeat configurado adequadamente  
- Retry automático em caso de falha
- Controle de rate limiting
- Monitoramento de saúde da conexão
"""

import pika
import json
import uuid
import time
import threading
import random
import queue
from datetime import datetime
from typing import Dict, List, Optional
import logging
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ConnectionConfig:
    """Configuração otimizada para conexões RabbitMQ"""
    host: str = 'localhost'
    port: int = 5672
    username: str = 'guest'
    password: str = 'guest'
    heartbeat: int = 60  # Aumentado para 60s
    blocked_connection_timeout: int = 300  # 5 minutos
    socket_timeout: int = 10
    stack_timeout: int = 15
    retry_delay: int = 3
    max_retries: int = 5

class RobustConnectionManager:
    """Gerenciador robusto de conexões RabbitMQ com pooling"""
    
    def __init__(self, config: ConnectionConfig, pool_size: int = 10):
        self.config = config
        self.pool_size = pool_size
        self.connection_pool = queue.Queue(maxsize=pool_size)
        self.lock = threading.Lock()
        self.active_connections = 0
        self._initialize_pool()
    
    def _create_connection(self) -> Optional[pika.BlockingConnection]:
        """Cria uma nova conexão com configurações otimizadas"""
        try:
            credentials = pika.PlainCredentials(self.config.username, self.config.password)
            
            connection_params = pika.ConnectionParameters(
                host=self.config.host,
                port=self.config.port,
                credentials=credentials,
                heartbeat=self.config.heartbeat,
                blocked_connection_timeout=self.config.blocked_connection_timeout,
                socket_timeout=self.config.socket_timeout,
                stack_timeout=self.config.stack_timeout,
            )
            
            connection = pika.BlockingConnection(connection_params)
            logger.debug(f"✅ Nova conexão criada")
            return connection
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar conexão: {e}")
            return None
    
    def _initialize_pool(self):
        """Inicializa o pool de conexões"""
        logger.info(f"🔄 Inicializando pool com {self.pool_size} conexões...")
        
        for i in range(self.pool_size):
            connection = self._create_connection()
            if connection:
                self.connection_pool.put(connection)
                self.active_connections += 1
            else:
                logger.warning(f"⚠️  Falha ao criar conexão {i+1}")
        
        logger.info(f"✅ Pool inicializado com {self.active_connections} conexões")
    
    def get_connection(self, timeout: int = 30) -> Optional[pika.BlockingConnection]:
        """Obtém uma conexão do pool"""
        try:
            connection = self.connection_pool.get(timeout=timeout)
            
            # Verifica se a conexão ainda está válida
            if connection.is_closed:
                logger.warning("⚠️  Conexão fechada detectada, criando nova...")
                connection = self._create_connection()
            
            return connection
            
        except queue.Empty:
            logger.warning("⚠️  Pool de conexões vazio, criando nova conexão...")
            return self._create_connection()
        except Exception as e:
            logger.error(f"❌ Erro ao obter conexão: {e}")
            return None
    
    def return_connection(self, connection: pika.BlockingConnection):
        """Retorna uma conexão para o pool"""
        try:
            if connection and not connection.is_closed:
                self.connection_pool.put_nowait(connection)
            else:
                logger.debug("🔄 Conexão inválida descartada")
                # Cria uma nova para manter o pool
                new_connection = self._create_connection()
                if new_connection:
                    self.connection_pool.put_nowait(new_connection)
                    
        except queue.Full:
            # Pool cheio, fecha a conexão
            if connection and not connection.is_closed:
                connection.close()
        except Exception as e:
            logger.error(f"❌ Erro ao retornar conexão: {e}")
    
    def close_all(self):
        """Fecha todas as conexões do pool"""
        logger.info("🔌 Fechando todas as conexões...")
        
        while not self.connection_pool.empty():
            try:
                connection = self.connection_pool.get_nowait()
                if connection and not connection.is_closed:
                    connection.close()
            except queue.Empty:
                break
            except Exception as e:
                logger.error(f"❌ Erro ao fechar conexão: {e}")

class OptimizedMessageSender:
    """Enviador otimizado de mensagens com retry e rate limiting"""
    
    def __init__(self, connection_manager: RobustConnectionManager):
        self.connection_manager = connection_manager
        self.stats = {
            'sent': 0,
            'errors': 0,
            'retries': 0,
            'connection_errors': 0
        }
        self.rate_limiter = threading.Semaphore(50)  # Máximo 50 operações simultâneas
    
    def send_message_with_retry(self, queue_name: str, message: dict, max_retries: int = 3) -> bool:
        """Envia mensagem com retry automático"""
        
        with self.rate_limiter:  # Rate limiting
            for attempt in range(max_retries + 1):
                try:
                    connection = self.connection_manager.get_connection()
                    if not connection:
                        self.stats['connection_errors'] += 1
                        continue
                    
                    try:
                        channel = connection.channel()
                        
                        # Declara a fila (idempotente)
                        channel.queue_declare(queue=queue_name, durable=False)
                        
                        # Serializa mensagem
                        message_body = json.dumps(message, ensure_ascii=False, default=str)
                        
                        # Publica mensagem
                        channel.basic_publish(
                            exchange='',
                            routing_key=queue_name,
                            body=message_body,
                            properties=pika.BasicProperties(
                                delivery_mode=1,  # Não persistente para performance
                                content_type='application/json'
                            )
                        )
                        
                        self.stats['sent'] += 1
                        
                        return True
                        
                    finally:
                        # Retorna conexão para o pool
                        self.connection_manager.return_connection(connection)
                    
                except Exception as e:
                    logger.debug(f"Tentativa {attempt + 1} falhou: {e}")
                    self.stats['retries'] += 1
                    
                    if attempt < max_retries:
                        time.sleep(0.1 * (attempt + 1))  # Backoff exponencial
                    
            self.stats['errors'] += 1
            return False
    
    def send_bulk_optimized(self, queue_name: str, messages: List[dict], 
                           batch_size: int = 10, delay_ms: int = 0) -> Dict:
        """Envia mensagens em lotes otimizados"""
        
        start_time = time.time()
        
        # Processa em lotes
        for i in range(0, len(messages), batch_size):
            batch = messages[i:i + batch_size]
            
            # Envia lote em paralelo (limitado)
            with ThreadPoolExecutor(max_workers=min(5, len(batch))) as executor:
                futures = []
                
                for message in batch:
                    future = executor.submit(
                        self.send_message_with_retry, 
                        queue_name, 
                        message.__dict__ if hasattr(message, '__dict__') else message
                    )
                    futures.append(future)
                
                # Aguarda conclusão do lote
                for future in futures:
                    future.result()
            
            # Delay entre lotes se especificado
            if delay_ms > 0:
                time.sleep(delay_ms / 1000.0)
            
            # Log de progresso
            progress = min(i + batch_size, len(messages))
            if progress % 100 == 0 or progress == len(messages):
                logger.info(f"📊 Progresso: {progress}/{len(messages)} mensagens")
        
        end_time = time.time()
        duration = end_time - start_time
        rate = self.stats['sent'] / duration if duration > 0 else 0
        
        return {
            'sent': self.stats['sent'],
            'errors': self.stats['errors'],
            'retries': self.stats['retries'],
            'connection_errors': self.stats['connection_errors'],
            'duration': duration,
            'rate': rate
        }

# Classes de mensagem (same as before but simplified)
class BaseMessage:
    def __init__(self):
        self.message_id = str(uuid.uuid4())
        self.message_created = datetime.utcnow().isoformat()

class CheckoutHeaderVO(BaseMessage):
    def __init__(self, user_id: str, first_name: str, last_name: str, 
                 email: str, phone: str, card_number: str, cvv: str, 
                 expiry_month_year: str, purchase_amount: float, cart_details: List[Dict] = None):
        super().__init__()
        self.UserID = user_id
        self.CouponCode = ""
        self.DiscountAmount = 0.0
        self.PurchaseAmount = purchase_amount
        self.FirstName = first_name
        self.LastName = last_name
        self.DateTime = datetime.utcnow().isoformat()
        self.Phone = phone
        self.Email = email
        self.CardNumber = card_number
        self.CVV = cvv
        self.ExpiryMonthYear = expiry_month_year
        self.CartTotalItems = len(cart_details) if cart_details else 0
        self.CartDetails = cart_details or []

def create_sample_message(user_id: str = None) -> CheckoutHeaderVO:
    """Cria mensagem de exemplo otimizada"""
    
    products = [
        {"Id": 101, "Name": "Smartphone", "Price": 1200.00},
        {"Id": 102, "Name": "Headphones", "Price": 150.00},
        {"Id": 103, "Name": "Laptop", "Price": 2500.00},
        {"Id": 104, "Name": "Mouse", "Price": 80.00},
        {"Id": 105, "Name": "Keyboard", "Price": 250.00}
    ]
    
    first_names = ["João", "Maria", "Pedro", "Ana", "Carlos"]
    last_names = ["Silva", "Santos", "Oliveira", "Souza", "Costa"]
    
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    user_id = user_id or f"user{random.randint(1000, 9999)}"
    
    # Carrinho simplificado para performance
    num_items = random.randint(1, 2)  # Menos itens para performance
    selected_products = random.sample(products, num_items)
    
    cart_details = []
    total_amount = 0
    
    for i, product in enumerate(selected_products):
        quantity = 1  # Quantidade fixa para simplificar
        price = product["Price"]
        total_amount += price * quantity
        
        cart_details.append({
            "Id": i + 1,
            "ProductId": product["Id"],
            "ProductName": product["Name"],
            "Price": price,
            "Quantity": quantity
        })
    
    return CheckoutHeaderVO(
        user_id=user_id,
        first_name=first_name,
        last_name=last_name,
        email=f"{first_name.lower()}.{last_name.lower()}@email.com",
        phone=f"(11) {random.randint(90000, 99999)}-{random.randint(1000, 9999)}",
        card_number=f"411111111111{random.randint(1000, 9999)}",
        cvv=f"{random.randint(100, 999)}",
        expiry_month_year=f"{random.randint(1, 12):02d}/{random.randint(25, 30)}",
        purchase_amount=round(total_amount, 2),
        cart_details=cart_details
    )

def run_optimized_load_test():
    """Executa teste de carga otimizado"""
    
    print("\n🚀 TESTE DE CARGA OTIMIZADO - SEM PERDA DE CONEXÃO")
    print("=" * 60)
    
    # Configuração
    try:
        message_count = int(input("Quantas mensagens enviar? (padrão: 1000): ") or "1000")
        batch_size = int(input("Tamanho do lote? (padrão: 20): ") or "20")
        delay_ms = int(input("Delay entre lotes em ms? (padrão: 50): ") or "50")
        pool_size = int(input("Tamanho do pool de conexões? (padrão: 5): ") or "5")
        
    except ValueError:
        logger.error("❌ Valores inválidos, usando padrões")
        message_count = 1000
        batch_size = 20
        delay_ms = 50
        pool_size = 5
    
    print(f"\n📋 Configuração:")
    print(f"   • Mensagens: {message_count}")
    print(f"   • Lote: {batch_size}")
    print(f"   • Delay: {delay_ms}ms")
    print(f"   • Pool: {pool_size} conexões")
    
    input("\nPressione ENTER para iniciar...")
    
    # Inicializa componentes
    config = ConnectionConfig()
    connection_manager = RobustConnectionManager(config, pool_size)
    sender = OptimizedMessageSender(connection_manager)
    
    try:
        # Gera mensagens
        logger.info("📝 Gerando mensagens...")
        messages = []
        for i in range(message_count):
            message = create_sample_message(f"optimized_user_{i}")
            messages.append(message)
        
        logger.info(f"✅ {len(messages)} mensagens geradas")
        
        # Executa teste
        logger.info("🚀 Iniciando teste de carga otimizado...")
        start_time = time.time()
        
        results = sender.send_bulk_optimized(
            queue_name='checkoutqueue',
            messages=messages,
            batch_size=batch_size,
            delay_ms=delay_ms
        )
        
        end_time = time.time()
        
        # Resultados
        print(f"\n✅ TESTE CONCLUÍDO!")
        print(f"📊 Resultados:")
        print(f"   • Mensagens enviadas: {results['sent']}/{message_count}")
        print(f"   • Erros: {results['errors']}")
        print(f"   • Tentativas: {results['retries']}")
        print(f"   • Erros de conexão: {results['connection_errors']}")
        print(f"   • Duração: {results['duration']:.2f}s")
        print(f"   • Throughput: {results['rate']:.2f} msg/s")
        print(f"   • Taxa de sucesso: {(results['sent']/message_count*100):.1f}%")
        
        if results['errors'] == 0:
            print(f"\n🎉 PERFEITO! Nenhuma mensagem perdida!")
        elif results['errors'] < message_count * 0.01:  # Menos de 1% de erro
            print(f"\n✅ EXCELENTE! Taxa de erro muito baixa")
        else:
            print(f"\n⚠️  ATENÇÃO! Taxa de erro alta - verificar RabbitMQ")
        
    except KeyboardInterrupt:
        logger.info("\n⚠️  Teste interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro durante o teste: {e}")
    finally:
        # Limpeza
        logger.info("🧹 Finalizando conexões...")
        connection_manager.close_all()

def main():
    """Função principal"""
    print("\n" + "=" * 70)
    print("⚡ TESTE DE CARGA OTIMIZADO - CMSHOP MESSAGING")
    print("=" * 70)
    
    print("""
🎯 CARACTERÍSTICAS DESTE TESTE:
• Connection pooling (reutiliza conexões)
• Retry automático em caso de falha
• Rate limiting (evita sobrecarga)
• Processamento em lotes
• Heartbeat otimizado
• Monitoramento de estatísticas

💡 IDEAL PARA:
• Testes de alta carga (1000+ mensagens)
• Ambientes de produção
• Verificação de estabilidade
    """)
    
    choice = input("Executar teste de carga otimizado? (s/N): ").strip().lower()
    
    if choice == 's':
        run_optimized_load_test()
    else:
        print("👋 Saindo...")

if __name__ == "__main__":
    main()