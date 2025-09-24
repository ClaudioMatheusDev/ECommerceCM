"""
Script Python para Testar Mensagerias dos Microserviços CMShop
=============================================================

Este script simula e testa o fluxo completo de mensagens entre os microserviços:
1. CartAPI -> checkoutqueue
2. OrderAPI -> orderpaymentprocessqueue
3. PaymentAPI -> orderpaymentresultqueue
4. OrderAPI (consume resultado)
"""

import pika
import json
import uuid
import time
import threading
from datetime import datetime
from typing import Dict, List, Optional
import logging
import random
from concurrent.futures import ThreadPoolExecutor
import queue

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RabbitMQConfig:
    """Configurações do RabbitMQ"""
    HOST = 'localhost'
    USERNAME = 'guest'
    PASSWORD = 'guest'
    PORT = 5672

class Queues:
    """Nomes das filas utilizadas"""
    CHECKOUT = 'checkoutqueue'
    PAYMENT_PROCESS = 'orderpaymentprocessqueue'
    PAYMENT_RESULT = 'orderpaymentresultqueue'

class BaseMessage:
    """Classe base para mensagens"""
    def __init__(self):
        self.message_id = str(uuid.uuid4())
        self.message_created = datetime.utcnow().isoformat()

class CheckoutHeaderVO(BaseMessage):
    """Mensagem de checkout do carrinho"""
    def __init__(self, user_id: str, first_name: str, last_name: str, 
                 email: str, phone: str, card_number: str, cvv: str, 
                 expiry_month_year: str, purchase_amount: float,
                 cart_details: List[Dict] = None):
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

class PaymentMessage(BaseMessage):
    """Mensagem de pagamento"""
    def __init__(self, order_id: int, user_id: str, email: str, 
                 card_number: str, card_expiry_month: int, 
                 card_expiry_year: int, card_security_code: str,
                 card_holder_name: str, amount: float):
        super().__init__()
        self.OrderId = order_id
        self.UserId = user_id
        self.Email = email
        self.CardNumber = card_number
        self.CardExpiryMonth = card_expiry_month
        self.CardExpiryYear = card_expiry_year
        self.CardSecurityCode = card_security_code
        self.CardHolderName = card_holder_name
        self.Amount = amount

class UpdatePaymentResultMessage(BaseMessage):
    """Mensagem de resultado do pagamento"""
    def __init__(self, order_id: int, status: str, email: str):
        super().__init__()
        self.orderId = order_id
        self.status = status
        self.email = email

class CMShopMessageTester:
    """Classe principal para testar as mensagerias"""
    
    def __init__(self):
        self.connection = None
        self.channel = None
        self.test_results = []
        self.received_messages = {}
        self.load_test_stats = {
            'sent': 0,
            'received': 0,
            'errors': 0,
            'start_time': None,
            'end_time': None
        }
        self.message_queue = queue.Queue()
        
    def connect(self):
        """Conecta ao RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(
                RabbitMQConfig.USERNAME, 
                RabbitMQConfig.PASSWORD
            )
            
            connection_params = pika.ConnectionParameters(
                host=RabbitMQConfig.HOST,
                port=RabbitMQConfig.PORT,
                credentials=credentials
            )
            
            self.connection = pika.BlockingConnection(connection_params)
            self.channel = self.connection.channel()
            
            logger.info(f"✅ Conectado ao RabbitMQ em {RabbitMQConfig.HOST}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao conectar ao RabbitMQ: {e}")
            return False
    
    def setup_queues(self):
        """Declara todas as filas necessárias"""
        try:
            queues = [Queues.CHECKOUT, Queues.PAYMENT_PROCESS, Queues.PAYMENT_RESULT]
            
            for queue in queues:
                self.channel.queue_declare(
                    queue=queue,
                    durable=False,
                    exclusive=False,
                    auto_delete=False
                )
                logger.info(f"📋 Fila '{queue}' declarada")
                
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao declarar filas: {e}")
            return False
    
    def publish_message(self, queue_name: str, message: object) -> bool:
        """Publica uma mensagem na fila especificada"""
        try:
            message_body = json.dumps(message.__dict__, ensure_ascii=False, indent=2)
            
            self.channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Torna a mensagem persistente
                    content_type='application/json'
                )
            )
            
            logger.info(f"📤 Mensagem enviada para fila '{queue_name}'")
            logger.debug(f"Conteúdo: {message_body}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem para '{queue_name}': {e}")
            return False
    
    def setup_consumer(self, queue_name: str, callback_function):
        """Configura um consumer para uma fila"""
        try:
            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback_function,
                auto_ack=True
            )
            logger.info(f"👂 Consumer configurado para fila '{queue_name}'")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao configurar consumer para '{queue_name}': {e}")
            return False
    
    def consume_checkout_message(self, ch, method, properties, body):
        """Callback para processar mensagens da fila checkoutqueue"""
        try:
            message_data = json.loads(body.decode('utf-8'))
            logger.info(f"📥 Mensagem recebida na fila '{Queues.CHECKOUT}'")
            logger.info(f"User ID: {message_data.get('UserID')}")
            logger.info(f"Email: {message_data.get('Email')}")
            logger.info(f"Valor: R$ {message_data.get('PurchaseAmount', 0):.2f}")
            
            self.received_messages[Queues.CHECKOUT] = message_data
            
            # Simula processamento e envia para fila de pagamento
            self.simulate_order_processing(message_data)
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar mensagem do checkout: {e}")
    
    def consume_payment_message(self, ch, method, properties, body):
        """Callback para processar mensagens da fila orderpaymentprocessqueue"""
        try:
            message_data = json.loads(body.decode('utf-8'))
            logger.info(f"📥 Mensagem recebida na fila '{Queues.PAYMENT_PROCESS}'")
            logger.info(f"Order ID: {message_data.get('OrderId')}")
            logger.info(f"Valor: R$ {message_data.get('Amount', 0):.2f}")
            
            self.received_messages[Queues.PAYMENT_PROCESS] = message_data
            
            # Simula processamento do pagamento
            self.simulate_payment_processing(message_data)
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar mensagem de pagamento: {e}")
    
    def consume_payment_result_message(self, ch, method, properties, body):
        """Callback para processar mensagens da fila orderpaymentresultqueue"""
        try:
            message_data = json.loads(body.decode('utf-8'))
            logger.info(f"📥 Mensagem recebida na fila '{Queues.PAYMENT_RESULT}'")
            logger.info(f"Order ID: {message_data.get('orderId')}")
            logger.info(f"Status: {message_data.get('status')}")
            
            self.received_messages[Queues.PAYMENT_RESULT] = message_data
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar resultado do pagamento: {e}")
    
    def simulate_order_processing(self, checkout_data):
        """Simula o processamento do pedido (OrderAPI)"""
        try:
            # Simula criação de pedido
            order_id = 12345
            logger.info(f"🔄 Simulando criação do pedido #{order_id}")
            
            # Cria mensagem de pagamento
            payment_message = PaymentMessage(
                order_id=order_id,
                user_id=checkout_data.get('UserID', ''),
                email=checkout_data.get('Email', ''),
                card_number=checkout_data.get('CardNumber', ''),
                card_expiry_month=int(checkout_data.get('ExpiryMonthYear', '12/25')[:2]),
                card_expiry_year=int('20' + checkout_data.get('ExpiryMonthYear', '12/25')[3:]),
                card_security_code=checkout_data.get('CVV', ''),
                card_holder_name=f"{checkout_data.get('FirstName', '')} {checkout_data.get('LastName', '')}",
                amount=checkout_data.get('PurchaseAmount', 0)
            )
            
            # Envia para fila de processamento de pagamento
            time.sleep(1)  # Simula tempo de processamento
            self.publish_message(Queues.PAYMENT_PROCESS, payment_message)
            
        except Exception as e:
            logger.error(f"❌ Erro na simulação do processamento do pedido: {e}")
    
    def simulate_payment_processing(self, payment_data):
        """Simula o processamento do pagamento (PaymentAPI)"""
        try:
            order_id = payment_data.get('OrderId')
            amount = payment_data.get('Amount', 0)
            
            logger.info(f"💳 Simulando processamento do pagamento para pedido #{order_id}")
            logger.info(f"Valor: R$ {amount:.2f}")
            
            # Simula resultado do pagamento (90% sucesso)
            import random
            is_success = random.random() > 0.1
            status = "Sucesso" if is_success else "Recusado"
            
            # Cria mensagem de resultado
            payment_result = UpdatePaymentResultMessage(
                order_id=order_id,
                status=status,
                email=payment_data.get('Email', '')
            )
            
            # Envia resultado
            time.sleep(2)  # Simula tempo de processamento
            self.publish_message(Queues.PAYMENT_RESULT, payment_result)
            
            logger.info(f"💳 Pagamento processado: {status}")
            
        except Exception as e:
            logger.error(f"❌ Erro na simulação do processamento do pagamento: {e}")
    
    def create_sample_checkout_message(self, user_id: str = None) -> CheckoutHeaderVO:
        """Cria uma mensagem de checkout de exemplo"""
        # Lista de produtos variados para testes
        products = [
            {"Id": 101, "Name": "Smartphone Samsung Galaxy", "Price": 1200.00},
            {"Id": 102, "Name": "Fone de Ouvido Bluetooth", "Price": 150.00},
            {"Id": 103, "Name": "Notebook Dell Inspiron", "Price": 2500.00},
            {"Id": 104, "Name": "Mouse Gamer RGB", "Price": 80.00},
            {"Id": 105, "Name": "Teclado Mecânico", "Price": 250.00},
            {"Id": 106, "Name": "Monitor 24 polegadas", "Price": 800.00},
            {"Id": 107, "Name": "Cadeira Gamer", "Price": 450.00},
            {"Id": 108, "Name": "Webcam HD", "Price": 120.00},
            {"Id": 109, "Name": "SSD 500GB", "Price": 300.00},
            {"Id": 110, "Name": "Placa de Vídeo", "Price": 1800.00}
        ]
        
        # Nomes e dados variados para simular usuários diferentes
        first_names = ["João", "Maria", "Pedro", "Ana", "Carlos", "Lucia", "Rafael", "Fernanda", "Ricardo", "Camila"]
        last_names = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Rodrigues", "Almeida", "Lima", "Ferreira"]
        
        # Seleciona dados aleatórios
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        user_id = user_id or f"user{random.randint(1000, 9999)}"
        
        # Cria carrinho com 1-4 produtos aleatórios
        num_items = random.randint(1, 4)
        selected_products = random.sample(products, num_items)
        
        cart_details = []
        total_amount = 0
        
        for i, product in enumerate(selected_products):
            quantity = random.randint(1, 3)
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
    
    def run_complete_flow_test(self):
        """Executa o teste completo do fluxo de mensagerias"""
        logger.info("🚀 Iniciando teste completo do fluxo de mensagerias")
        
        if not self.connect():
            return False
        
        if not self.setup_queues():
            return False
        
        # Configura consumers
        self.setup_consumer(Queues.CHECKOUT, self.consume_checkout_message)
        self.setup_consumer(Queues.PAYMENT_PROCESS, self.consume_payment_message)
        self.setup_consumer(Queues.PAYMENT_RESULT, self.consume_payment_result_message)
        
        # Inicia consumo em thread separada
        consumer_thread = threading.Thread(target=self.start_consuming)
        consumer_thread.daemon = True
        consumer_thread.start()
        
        # Aguarda um pouco para os consumers iniciarem
        time.sleep(2)
        
        # Cria e envia mensagem de checkout
        checkout_message = self.create_sample_checkout_message()
        success = self.publish_message(Queues.CHECKOUT, checkout_message)
        
        if success:
            logger.info("⏳ Aguardando processamento completo do fluxo...")
            time.sleep(10)  # Aguarda processamento
            
            # Verifica resultados
            self.display_test_results()
        
        return success
    
    def start_consuming(self):
        """Inicia o consumo de mensagens"""
        try:
            logger.info("👂 Iniciando consumo de mensagens...")
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f"❌ Erro no consumo de mensagens: {e}")
    
    def display_test_results(self):
        """Exibe os resultados dos testes"""
        logger.info("\n" + "="*60)
        logger.info("📊 RESULTADOS DO TESTE DE MENSAGERIAS")
        logger.info("="*60)
        
        queues_expected = [Queues.CHECKOUT, Queues.PAYMENT_PROCESS, Queues.PAYMENT_RESULT]
        
        for queue in queues_expected:
            if queue in self.received_messages:
                logger.info(f"✅ {queue}: Mensagem processada com sucesso")
                message = self.received_messages[queue]
                
                if queue == Queues.CHECKOUT:
                    logger.info(f"   User: {message.get('UserID')}")
                    logger.info(f"   Email: {message.get('Email')}")
                    logger.info(f"   Valor: R$ {message.get('PurchaseAmount', 0):.2f}")
                    
                elif queue == Queues.PAYMENT_PROCESS:
                    logger.info(f"   Order ID: {message.get('OrderId')}")
                    logger.info(f"   Valor: R$ {message.get('Amount', 0):.2f}")
                    
                elif queue == Queues.PAYMENT_RESULT:
                    logger.info(f"   Order ID: {message.get('orderId')}")
                    logger.info(f"   Status: {message.get('status')}")
            else:
                logger.warning(f"⚠️  {queue}: Nenhuma mensagem recebida")
        
        # Resumo final
        processed_count = len(self.received_messages)
        total_expected = len(queues_expected)
        
        logger.info(f"\n📈 RESUMO: {processed_count}/{total_expected} filas processadas")
        
        if processed_count == total_expected:
            logger.info("🎉 TESTE COMPLETO: Fluxo de mensagerias funcionando perfeitamente!")
        else:
            logger.warning("⚠️  TESTE PARCIAL: Algumas mensagens não foram processadas")
    
    def run_individual_queue_test(self, queue_name: str):
        """Executa teste em uma fila específica"""
        logger.info(f"🔍 Testando fila individual: {queue_name}")
        
        if not self.connect():
            return False
        
        if not self.setup_queues():
            return False
        
        # Testa cada fila individualmente
        if queue_name == Queues.CHECKOUT:
            message = self.create_sample_checkout_message()
            return self.publish_message(queue_name, message)
        
        # Adicionar outros testes individuais conforme necessário
        return True
    
    def check_queue_status(self):
        """Verifica o status das filas"""
        logger.info("📋 Verificando status das filas...")
        
        if not self.connect():
            return False
        
        queues = [Queues.CHECKOUT, Queues.PAYMENT_PROCESS, Queues.PAYMENT_RESULT]
        
        for queue in queues:
            try:
                method = self.channel.queue_declare(queue=queue, passive=True)
                message_count = method.method.message_count
                logger.info(f"📊 {queue}: {message_count} mensagens na fila")
            except Exception as e:
                logger.warning(f"⚠️  {queue}: Fila não existe ou erro ao acessar")
    
    def purge_all_queues(self):
        """Limpa todas as filas"""
        logger.info("🧹 Limpando todas as filas...")
        
        if not self.connect():
            return False
        
        queues = [Queues.CHECKOUT, Queues.PAYMENT_PROCESS, Queues.PAYMENT_RESULT]
        
        for queue in queues:
            try:
                self.channel.queue_purge(queue)
                logger.info(f"🧹 Fila '{queue}' limpa")
            except Exception as e:
                logger.warning(f"⚠️  Erro ao limpar fila '{queue}': {e}")
    
    def send_bulk_messages(self, queue_name: str, message_count: int, delay_ms: int = 0):
        """Envia múltiplas mensagens para teste de carga"""
        logger.info(f"🚀 Iniciando envio de {message_count} mensagens para '{queue_name}'")
        
        self.load_test_stats['sent'] = 0
        self.load_test_stats['errors'] = 0
        self.load_test_stats['start_time'] = time.time()
        
        success_count = 0
        error_count = 0
        
        for i in range(message_count):
            try:
                if queue_name == Queues.CHECKOUT:
                    message = self.create_sample_checkout_message(f"loadtest_user_{i}")
                elif queue_name == Queues.PAYMENT_PROCESS:
                    message = PaymentMessage(
                        order_id=10000 + i,
                        user_id=f"loadtest_user_{i}",
                        email=f"user{i}@email.com",
                        card_number=f"411111111111{i:04d}",
                        card_expiry_month=random.randint(1, 12),
                        card_expiry_year=random.randint(2025, 2030),
                        card_security_code=f"{random.randint(100, 999)}",
                        card_holder_name=f"User {i}",
                        amount=round(random.uniform(50, 2000), 2)
                    )
                else:
                    message = UpdatePaymentResultMessage(
                        order_id=10000 + i,
                        status="Sucesso" if random.random() > 0.1 else "Recusado",
                        email=f"user{i}@email.com"
                    )
                
                if self.publish_message(queue_name, message):
                    success_count += 1
                else:
                    error_count += 1
                
                # Progress indicator
                if (i + 1) % 10 == 0 or i == message_count - 1:
                    progress = (i + 1) / message_count * 100
                    logger.info(f"📊 Progresso: {i + 1}/{message_count} ({progress:.1f}%) - Sucessos: {success_count}, Erros: {error_count}")
                
                # Delay entre mensagens se especificado
                if delay_ms > 0:
                    time.sleep(delay_ms / 1000.0)
                    
            except Exception as e:
                error_count += 1
                logger.error(f"❌ Erro ao enviar mensagem {i}: {e}")
        
        self.load_test_stats['sent'] = success_count
        self.load_test_stats['errors'] = error_count
        self.load_test_stats['end_time'] = time.time()
        
        duration = self.load_test_stats['end_time'] - self.load_test_stats['start_time']
        rate = success_count / duration if duration > 0 else 0
        
        logger.info(f"✅ Teste de carga concluído!")
        logger.info(f"📊 Estatísticas:")
        logger.info(f"   • Mensagens enviadas: {success_count}/{message_count}")
        logger.info(f"   • Erros: {error_count}")
        logger.info(f"   • Duração: {duration:.2f}s")
        logger.info(f"   • Taxa: {rate:.2f} msg/s")
        
        return success_count, error_count, duration, rate
    
    def run_concurrent_load_test(self, queue_name: str, message_count: int, num_threads: int = 5):
        """Executa teste de carga com múltiplas threads"""
        logger.info(f"🔥 Iniciando teste de carga concorrente:")
        logger.info(f"   • Fila: {queue_name}")
        logger.info(f"   • Total de mensagens: {message_count}")
        logger.info(f"   • Threads: {num_threads}")
        logger.info(f"   • Mensagens por thread: {message_count // num_threads}")
        
        if not self.connect():
            return False
        
        if not self.setup_queues():
            return False
        
        self.load_test_stats['start_time'] = time.time()
        self.load_test_stats['sent'] = 0
        self.load_test_stats['errors'] = 0
        
        def worker_thread(thread_id: int, messages_per_thread: int):
            """Função executada por cada thread"""
            thread_connection = None
            thread_channel = None
            thread_success = 0
            thread_errors = 0
            
            try:
                # Cada thread precisa de sua própria conexão
                credentials = pika.PlainCredentials(RabbitMQConfig.USERNAME, RabbitMQConfig.PASSWORD)
                connection_params = pika.ConnectionParameters(
                    host=RabbitMQConfig.HOST,
                    port=RabbitMQConfig.PORT,
                    credentials=credentials
                )
                thread_connection = pika.BlockingConnection(connection_params)
                thread_channel = thread_connection.channel()
                
                logger.info(f"🧵 Thread {thread_id} iniciada - {messages_per_thread} mensagens")
                
                for i in range(messages_per_thread):
                    try:
                        msg_id = thread_id * messages_per_thread + i
                        
                        if queue_name == Queues.CHECKOUT:
                            message = self.create_sample_checkout_message(f"concurrent_user_{msg_id}")
                        elif queue_name == Queues.PAYMENT_PROCESS:
                            message = PaymentMessage(
                                order_id=20000 + msg_id,
                                user_id=f"concurrent_user_{msg_id}",
                                email=f"concurrent{msg_id}@email.com",
                                card_number=f"411111111111{msg_id:04d}",
                                card_expiry_month=random.randint(1, 12),
                                card_expiry_year=random.randint(2025, 2030),
                                card_security_code=f"{random.randint(100, 999)}",
                                card_holder_name=f"Concurrent User {msg_id}",
                                amount=round(random.uniform(50, 2000), 2)
                            )
                        else:
                            message = UpdatePaymentResultMessage(
                                order_id=20000 + msg_id,
                                status="Sucesso" if random.random() > 0.1 else "Recusado",
                                email=f"concurrent{msg_id}@email.com"
                            )
                        
                        message_body = json.dumps(message.__dict__, ensure_ascii=False)
                        
                        thread_channel.basic_publish(
                            exchange='',
                            routing_key=queue_name,
                            body=message_body,
                            properties=pika.BasicProperties(
                                delivery_mode=2,
                                content_type='application/json'
                            )
                        )
                        
                        thread_success += 1
                        
                        # Mini delay para não sobrecarregar
                        if i % 50 == 0:
                            time.sleep(0.01)
                            
                    except Exception as e:
                        thread_errors += 1
                        logger.debug(f"❌ Thread {thread_id} - Erro na mensagem {i}: {e}")
                
                logger.info(f"✅ Thread {thread_id} concluída - Sucessos: {thread_success}, Erros: {thread_errors}")
                
            except Exception as e:
                logger.error(f"❌ Erro na thread {thread_id}: {e}")
            finally:
                if thread_connection and not thread_connection.is_closed:
                    thread_connection.close()
                    
                self.load_test_stats['sent'] += thread_success
                self.load_test_stats['errors'] += thread_errors
        
        # Executa threads concorrentes
        messages_per_thread = message_count // num_threads
        remainder = message_count % num_threads
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = []
            
            for thread_id in range(num_threads):
                thread_messages = messages_per_thread + (1 if thread_id < remainder else 0)
                future = executor.submit(worker_thread, thread_id, thread_messages)
                futures.append(future)
            
            # Aguarda todas as threads terminarem
            for future in futures:
                future.result()
        
        self.load_test_stats['end_time'] = time.time()
        
        # Calcula estatísticas finais
        duration = self.load_test_stats['end_time'] - self.load_test_stats['start_time']
        total_sent = self.load_test_stats['sent']
        total_errors = self.load_test_stats['errors']
        rate = total_sent / duration if duration > 0 else 0
        
        logger.info(f"\n🎯 RESULTADO DO TESTE DE CARGA CONCORRENTE:")
        logger.info(f"📊 Estatísticas Finais:")
        logger.info(f"   • Total processado: {total_sent + total_errors}/{message_count}")
        logger.info(f"   • Sucessos: {total_sent}")
        logger.info(f"   • Erros: {total_errors}")
        logger.info(f"   • Taxa de sucesso: {(total_sent/(total_sent + total_errors)*100):.1f}%")
        logger.info(f"   • Duração total: {duration:.2f}s")
        logger.info(f"   • Throughput: {rate:.2f} mensagens/segundo")
        logger.info(f"   • Threads utilizadas: {num_threads}")
        
        return total_sent, total_errors, duration, rate
    
    def monitor_queue_realtime(self, duration_seconds: int = 30):
        """Monitora as filas em tempo real durante um período"""
        logger.info(f"📡 Iniciando monitoramento em tempo real por {duration_seconds} segundos...")
        
        if not self.connect():
            return False
        
        start_time = time.time()
        queues = [Queues.CHECKOUT, Queues.PAYMENT_PROCESS, Queues.PAYMENT_RESULT]
        
        print(f"\n{'='*80}")
        print(f"{'MONITORAMENTO EM TEMPO REAL DAS FILAS':^80}")
        print(f"{'='*80}")
        print(f"{'Tempo':<10} {'checkoutqueue':<20} {'paymentprocess':<20} {'paymentresult':<20}")
        print(f"{'-'*80}")
        
        try:
            while time.time() - start_time < duration_seconds:
                timestamp = time.strftime("%H:%M:%S")
                queue_counts = []
                
                for queue in queues:
                    try:
                        method = self.channel.queue_declare(queue=queue, passive=True)
                        count = method.method.message_count
                        queue_counts.append(f"{count:>6}")
                    except:
                        queue_counts.append("  N/A")
                
                print(f"{timestamp:<10} {queue_counts[0]:<20} {queue_counts[1]:<20} {queue_counts[2]:<20}")
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("\n⚠️  Monitoramento interrompido pelo usuário")
        
        print(f"{'='*80}")
        logger.info("📡 Monitoramento concluído")
        return True
    
    def close_connection(self):
        """Fecha a conexão com o RabbitMQ"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("🔌 Conexão com RabbitMQ fechada")
        except Exception as e:
            logger.error(f"❌ Erro ao fechar conexão: {e}")

def get_load_test_parameters():
    """Solicita parâmetros para teste de carga"""
    try:
        print("\n📊 CONFIGURAÇÃO DO TESTE DE CARGA")
        print("-" * 40)
        
        # Número de mensagens
        while True:
            try:
                msg_count = int(input("Quantas mensagens enviar? (padrão: 100): ") or "100")
                if msg_count > 0:
                    break
                print("❌ Digite um número maior que 0")
            except ValueError:
                print("❌ Digite um número válido")
        
        # Tipo de teste
        print("\nTipo de teste:")
        print("1. Sequencial (uma mensagem por vez)")
        print("2. Concorrente (múltiplas threads)")
        
        while True:
            test_type = input("Escolha o tipo (1-2, padrão: 1): ").strip() or "1"
            if test_type in ["1", "2"]:
                break
            print("❌ Escolha 1 ou 2")
        
        num_threads = 1
        delay_ms = 0
        
        if test_type == "2":
            # Número de threads
            while True:
                try:
                    num_threads = int(input("Quantas threads usar? (padrão: 5): ") or "5")
                    if 1 <= num_threads <= 20:
                        break
                    print("❌ Use entre 1 e 20 threads")
                except ValueError:
                    print("❌ Digite um número válido")
        else:
            # Delay para teste sequencial
            while True:
                try:
                    delay_ms = int(input("Delay entre mensagens em ms? (padrão: 0): ") or "0")
                    if delay_ms >= 0:
                        break
                    print("❌ Digite um número >= 0")
                except ValueError:
                    print("❌ Digite um número válido")
        
        # Fila de destino
        print("\nFila de destino:")
        print("1. checkoutqueue")
        print("2. orderpaymentprocessqueue")
        print("3. orderpaymentresultqueue")
        
        while True:
            queue_choice = input("Escolha a fila (1-3, padrão: 1): ").strip() or "1"
            if queue_choice in ["1", "2", "3"]:
                break
            print("❌ Escolha 1, 2 ou 3")
        
        queue_map = {
            "1": Queues.CHECKOUT,
            "2": Queues.PAYMENT_PROCESS,
            "3": Queues.PAYMENT_RESULT
        }
        
        target_queue = queue_map[queue_choice]
        
        return msg_count, test_type == "2", num_threads, delay_ms, target_queue
        
    except KeyboardInterrupt:
        print("\n⚠️  Configuração cancelada")
        return None

def main():
    """Função principal"""
    print("\n" + "="*70)
    print("🛒 TESTE DE MENSAGERIAS - CMSHOP MICROSERVICES")
    print("="*70)
    print("\nOpções disponíveis:")
    print("1. Teste completo do fluxo de mensagerias")
    print("2. Verificar status das filas")
    print("3. Limpar todas as filas")
    print("4. Teste individual da fila de checkout")
    print("5. 🚀 TESTE DE CARGA - Múltiplas mensagens")
    print("6. 📡 Monitoramento em tempo real das filas")
    print("7. Sair")
    
    tester = CMShopMessageTester()
    
    try:
        while True:
            print("\n" + "-"*50)
            choice = input("Escolha uma opção (1-7): ").strip()
            
            if choice == '1':
                tester.run_complete_flow_test()
                
            elif choice == '2':
                tester.check_queue_status()
                
            elif choice == '3':
                confirm = input("Confirma limpeza de todas as filas? (s/N): ").strip().lower()
                if confirm == 's':
                    tester.purge_all_queues()
                else:
                    print("Operação cancelada")
                    
            elif choice == '4':
                tester.run_individual_queue_test(Queues.CHECKOUT)
                
            elif choice == '5':
                # Teste de carga
                params = get_load_test_parameters()
                if params:
                    msg_count, is_concurrent, num_threads, delay_ms, target_queue = params
                    
                    print(f"\n🚀 Iniciando teste de carga...")
                    print(f"   • Mensagens: {msg_count}")
                    print(f"   • Fila: {target_queue}")
                    print(f"   • Modo: {'Concorrente' if is_concurrent else 'Sequencial'}")
                    if is_concurrent:
                        print(f"   • Threads: {num_threads}")
                    else:
                        print(f"   • Delay: {delay_ms}ms")
                    
                    input("\nPressione ENTER para continuar...")
                    
                    if not tester.connect() or not tester.setup_queues():
                        continue
                    
                    if is_concurrent:
                        tester.run_concurrent_load_test(target_queue, msg_count, num_threads)
                    else:
                        tester.send_bulk_messages(target_queue, msg_count, delay_ms)
                    
                    # Verifica status após o teste
                    print(f"\n📊 Status das filas após o teste:")
                    tester.check_queue_status()
                
            elif choice == '6':
                # Monitoramento em tempo real
                try:
                    duration = int(input("Duração do monitoramento em segundos (padrão: 30): ") or "30")
                    if duration > 0:
                        print(f"\n📡 Iniciando monitoramento por {duration} segundos...")
                        print("💡 Dica: Execute testes de carga em outro terminal para ver o movimento!")
                        print("⚠️  Pressione Ctrl+C para parar o monitoramento")
                        input("\nPressione ENTER para começar...")
                        tester.monitor_queue_realtime(duration)
                    else:
                        print("❌ Duração deve ser maior que 0")
                except ValueError:
                    print("❌ Digite um número válido")
                
            elif choice == '7':
                print("👋 Encerrando...")
                break
                
            else:
                print("❌ Opção inválida!")
                
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro na execução principal: {e}")
    finally:
        tester.close_connection()
        print("🏁 Programa finalizado")

if __name__ == "__main__":
    main()