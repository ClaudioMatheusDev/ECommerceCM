# 🛒 Teste de Mensagerias - CMShop Microservices

Este conjunto de scripts Python permite testar o fluxo completo de mensagerias entre os microserviços do sistema CMShop, simulando o processo desde o checkout do carrinho até o processamento do pagamento.

## 📋 Arquivos

- **`test_messaging.py`** - Script principal para teste das mensagerias
- **`benchmark_messaging.py`** - Script para testes de performance e benchmark
- **`setup_messaging_test.py`** - Script de configuração e validação do ambiente
- **`requirements_messaging_test.txt`** - Dependências Python necessárias
- **`README_MESSAGING_TEST.md`** - Este arquivo de documentação

## 🔄 Fluxo de Mensagerias Testado

```
1. CartAPI → checkoutqueue 
   ├─ Mensagem: CheckoutHeaderVO
   └─ Dados: Informações do usuário, carrinho e pagamento

2. OrderAPI → orderpaymentprocessqueue
   ├─ Consome: checkoutqueue
   ├─ Cria: Pedido no sistema
   ├─ Envia: PaymentMessage
   └─ Para: Processamento de pagamento

3. PaymentAPI → orderpaymentresultqueue
   ├─ Consome: orderpaymentprocessqueue
   ├─ Processa: Pagamento (simulado)
   ├─ Envia: UpdatePaymentResultMessage
   └─ Para: Confirmação do resultado

4. OrderAPI ← orderpaymentresultqueue
   ├─ Recebe: Resultado do pagamento
   └─ Atualiza: Status do pedido
```

## 🚀 Como Usar

### 1. Configuração Inicial

```powershell
# Execute o script de configuração
python setup_messaging_test.py
```

Este script irá:
- ✅ Verificar versão do Python (3.8+)
- ✅ Verificar dependências instaladas
- ✅ Testar conectividade com RabbitMQ
- ✅ Criar docker-compose para RabbitMQ (se necessário)

### 2. Instalar Dependências

```powershell
# Instalar dependências Python
pip install -r requirements_messaging_test.txt
```

### 3. Configurar RabbitMQ

#### Opção 1: Docker (Recomendado)
```powershell
# Usar o docker-compose criado pelo script de setup
docker-compose -f docker-compose-rabbitmq.yml up -d

# Verificar se está funcionando
docker ps
```

#### Opção 2: Instalação Local
- Baixar e instalar RabbitMQ Server
- Configurar usuário: guest/guest
- Porta padrão: 5672

### 4. Executar os Testes

```powershell
# Executar o script principal (testes funcionais)
python test_messaging.py

# Executar benchmark de performance
python benchmark_messaging.py
```

## 🎮 Opções do Menu

### Script Principal (`test_messaging.py`)

```
🛒 TESTE DE MENSAGERIAS - CMSHOP MICROSERVICES
================================================

Opções disponíveis:
1. Teste completo do fluxo de mensagerias
2. Verificar status das filas
3. Limpar todas as filas
4. Teste individual da fila de checkout
5. 🚀 TESTE DE CARGA - Múltiplas mensagens
6. 📡 Monitoramento em tempo real das filas
7. Sair
```

### Script de Benchmark (`benchmark_messaging.py`)

```
⚡ BENCHMARK DE PERFORMANCE - CMSHOP MESSAGING
=============================================

1. 🚀 Teste de Throughput (diferentes quantidades)
2. 🔥 Teste de Concorrência (diferentes threads)
3. 💥 Teste de Stress (alta carga)
4. ⏱️  Teste de Latência
5. 🎪 SUITE COMPLETA (todos os testes)
```

### Opção 1: Teste Completo
- Executa o fluxo completo de mensagerias
- Simula checkout → processamento → pagamento → resultado
- Exibe relatório detalhado dos resultados

### Opção 2: Verificar Status
- Mostra quantas mensagens estão em cada fila
- Útil para monitoramento e debug

### Opção 3: Limpar Filas
- Remove todas as mensagens das filas
- Útil para reiniciar testes limpos

### Opção 4: Teste Individual
- Testa apenas a fila de checkout
- Útil para debug específico

### Opção 5: Teste de Carga 🚀
- **Sequencial:** Envia mensagens uma por vez (configurável delay)
- **Concorrente:** Usa múltiplas threads para envio simultâneo
- **Configurável:** Quantidade de mensagens, threads, delay, fila de destino
- **Relatórios:** Estatísticas de throughput, taxa de sucesso, tempo

#### Exemplo de Configuração:
```
📊 CONFIGURAÇÃO DO TESTE DE CARGA
Quantas mensagens enviar? (padrão: 100): 1000
Tipo de teste:
1. Sequencial (uma mensagem por vez)
2. Concorrente (múltiplas threads)
Escolha o tipo (1-2, padrão: 1): 2
Quantas threads usar? (padrão: 5): 10
```

### Opção 6: Monitoramento em Tempo Real 📡
- Monitora todas as filas simultaneamente
- Atualização a cada segundo
- Interface tabular em tempo real
- Útil para observar o comportamento durante testes de carga

## 📊 Interpretando os Resultados

### Teste Bem-sucedido ✅
```
📊 RESULTADOS DO TESTE DE MENSAGERIAS
====================================
✅ checkoutqueue: Mensagem processada com sucesso
   User: user123
   Email: joao.silva@email.com
   Valor: R$ 1500.00

✅ orderpaymentprocessqueue: Mensagem processada com sucesso
   Order ID: 12345
   Valor: R$ 1500.00

✅ orderpaymentresultqueue: Mensagem processada com sucesso
   Order ID: 12345
   Status: Sucesso

📈 RESUMO: 3/3 filas processadas
🎉 TESTE COMPLETO: Fluxo de mensagerias funcionando perfeitamente!
```

### Problemas Comuns ⚠️

#### RabbitMQ não conecta
```
❌ Erro ao conectar ao RabbitMQ: [Errno 10061] No connection could be made
```
**Solução:** Verificar se RabbitMQ está rodando e acessível na porta 5672

#### Mensagens não processadas
```
⚠️ orderpaymentprocessqueue: Nenhuma mensagem recebida
```
**Solução:** Verificar se o fluxo anterior foi processado corretamente

## 🔧 Configurações

### Configurações do RabbitMQ
```python
class RabbitMQConfig:
    HOST = 'localhost'      # Alterar se RabbitMQ estiver em outro servidor
    USERNAME = 'guest'      # Usuário padrão
    PASSWORD = 'guest'      # Senha padrão
    PORT = 5672            # Porta AMQP padrão
```

### Filas Utilizadas
```python
class Queues:
    CHECKOUT = 'checkoutqueue'                  # CartAPI → OrderAPI
    PAYMENT_PROCESS = 'orderpaymentprocessqueue'  # OrderAPI → PaymentAPI
    PAYMENT_RESULT = 'orderpaymentresultqueue'   # PaymentAPI → OrderAPI
```

## 🎯 Cenários de Teste

### Dados de Exemplo Utilizados
```json
{
  "UserID": "user123",
  "FirstName": "João",
  "LastName": "Silva",
  "Email": "joao.silva@email.com",
  "Phone": "(11) 99999-9999",
  "CardNumber": "4111111111111111",
  "CVV": "123",
  "ExpiryMonthYear": "12/25",
  "PurchaseAmount": 1500.00,
  "CartDetails": [
    {
      "ProductName": "Smartphone Samsung Galaxy",
      "Price": 1200.00,
      "Quantity": 1
    },
    {
      "ProductName": "Fone de Ouvido Bluetooth", 
      "Price": 150.00,
      "Quantity": 2
    }
  ]
}
```

### Simulação de Pagamento
- **Taxa de Sucesso:** 90% (configurável)
- **Tempo de Processamento:** 2-3 segundos por etapa
- **Statuses Possíveis:** "Sucesso" ou "Recusado"

## 🐛 Troubleshooting

### Logs Detalhados
Para ver mais detalhes, modifique o nível de log:
```python
logging.basicConfig(level=logging.DEBUG)  # Mais detalhado
```

### Verificar Filas no RabbitMQ Management
- Acesse: http://localhost:15672
- Login: guest/guest
- Vá em "Queues" para ver as filas e mensagens

### Resetar Ambiente
```powershell
# Parar RabbitMQ
docker-compose -f docker-compose-rabbitmq.yml down

# Remover volumes (limpa dados)
docker-compose -f docker-compose-rabbitmq.yml down -v

# Reiniciar
docker-compose -f docker-compose-rabbitmq.yml up -d
```

## � Testes de Carga e Performance

### Funcionalidades de Teste de Carga

#### 📊 Teste Sequencial
- Envia mensagens uma por vez
- Configurável delay entre mensagens
- Ideal para testar comportamento controlado
- Mede throughput e taxa de sucesso

#### 🔥 Teste Concorrente
- Múltiplas threads enviando simultâneamente
- Configura número de threads (1-20)
- Distribui mensagens entre threads
- Testa capacidade de processamento paralelo

#### 📡 Monitoramento em Tempo Real
```
================================================================================
                    MONITORAMENTO EM TEMPO REAL DAS FILAS
================================================================================
Tempo      checkoutqueue        paymentprocess       paymentresult       
--------------------------------------------------------------------------------
14:30:15           0                    0                    0            
14:30:16          45                   12                    8            
14:30:17          89                   34                   21            
14:30:18         120                   67                   45            
```

### Cenários de Benchmark

#### 🎯 Teste de Throughput
- Diferentes quantidades: 10, 50, 100, 500, 1000 mensagens
- Mede taxa máxima de mensagens/segundo
- Identifica gargalos de performance

#### 🔥 Teste de Concorrência
- Mesmo número de mensagens, diferentes threads
- Compara performance: 1, 2, 5, 10, 15 threads
- Encontra número ideal de threads

#### 💥 Teste de Stress
- Alta carga: 1k-10k mensagens
- Múltiplas threads simultâneas
- Verifica comportamento sob pressão
- Monitora erros e degradação

#### ⏱️ Teste de Latência
- Mensagens individuais cronometradas
- Estatísticas: média, mín, máx, 95º percentil
- Identifica variações de performance

### Exemplo de Resultados

```
🎯 THROUGHPUT
Mensagens    Enviadas    Taxa (msg/s)    Duração
      100         100       285.71        0.35s
      500         500       312.50        1.60s
     1000        1000       333.33        3.00s

🔥 CONCORRÊNCIA
Threads    Mensagens    Taxa (msg/s)    Duração
      1          500       285.71        1.75s
      5          500       625.00        0.80s
     10          500       833.33        0.60s

💥 STRESS
Configuração         Taxa (msg/s)    Erros    Fila Final
Stress Médio              450.5        0           0
Stress Alto               380.2        2         134
Stress Extremo            295.8       15         890
```

## 🔍 Validação com Microserviços Reais

### Teste com Sistema Completo

1. **Inicie os microserviços:**
   ```powershell
   # Use os scripts existentes
   .\start-all-services.bat
   ```

2. **Execute monitoramento paralelo:**
   ```powershell
   # Terminal 1: Monitoramento
   python test_messaging.py
   # Escolha opção 6 (Monitoramento em tempo real)
   
   # Terminal 2: Teste de carga
   python test_messaging.py
   # Escolha opção 5 (Teste de carga)
   ```

3. **Monitoramento completo:**
   - Logs dos containers Docker
   - Interface do RabbitMQ Management (http://localhost:15672)
   - Banco de dados (verificar criação de pedidos)
   - Monitoramento em tempo real dos scripts

### Cenários Recomendados

#### 🏃 Teste Rápido (Desenvolvimento)
```powershell
python test_messaging.py
# Opção 5: 100 mensagens, 5 threads, fila checkout
```

#### 🏋️ Teste de Capacidade
```powershell
python benchmark_messaging.py
# Opção 2: Teste de concorrência completo
```

#### 🔥 Teste de Stress Completo
```powershell
python benchmark_messaging.py
# Opção 5: Suite completa (pode demorar 10-15 min)
```

## 📈 Extensões Possíveis

### Adicionar Novos Testes
- Testes de carga (múltiplas mensagens)
- Testes de falha (mensagens inválidas)
- Testes de timeout
- Integração com banco de dados

### Métricas e Monitoramento
- Tempo de processamento por fila
- Taxa de sucesso/erro
- Throughput de mensagens
- Alertas por email/slack

## 🤝 Contribuindo

Para adicionar novos cenários de teste:

1. Extend a classe `CMShopMessageTester`
2. Adicione novos tipos de mensagem
3. Implemente callbacks específicos
4. Atualize o menu principal

---

**Desenvolvido para o projeto CMShop Microservices**  
*GitHub Copilot - Setembro 2025*