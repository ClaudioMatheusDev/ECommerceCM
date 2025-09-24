"""
Script de Benchmark e Performance para Mensagerias CMShop
========================================================

Este script executa testes de performance automatizados com diferentes
configurações para medir o throughput e comportamento das filas sob carga.

Cenários testados:
- Teste de throughput máximo
- Teste de concorrência
- Teste de stress (muitas mensagens)
- Teste de latência
- Benchmark comparativo
"""

import time
import statistics
import json
from datetime import datetime
from Test.test_messaging import CMShopMessageTester, Queues
import logging

# Configuração de logging mais limpa para benchmark
logging.basicConfig(
    level=logging.WARNING,  # Menos verbose para focar nos resultados
    format='%(levelname)s - %(message)s'
)

class PerformanceBenchmark:
    """Classe para executar benchmarks de performance"""
    
    def __init__(self):
        self.tester = CMShopMessageTester()
        self.results = []
        
    def run_throughput_test(self, message_counts: list, queue_name: str = Queues.CHECKOUT):
        """Testa throughput com diferentes quantidades de mensagens"""
        print("\n🚀 TESTE DE THROUGHPUT")
        print("=" * 50)
        
        results = []
        
        for count in message_counts:
            print(f"\n📊 Testando {count} mensagens...")
            
            if not self.tester.connect():
                continue
                
            if not self.tester.setup_queues():
                continue
            
            # Limpa a fila antes do teste
            try:
                self.tester.channel.queue_purge(queue_name)
            except:
                pass
            
            # Executa o teste
            sent, errors, duration, rate = self.tester.send_bulk_messages(queue_name, count, 0)
            
            result = {
                'test': 'throughput',
                'messages': count,
                'sent': sent,
                'errors': errors,
                'duration': duration,
                'rate': rate,
                'queue': queue_name,
                'timestamp': datetime.now().isoformat()
            }
            
            results.append(result)
            
            print(f"✅ Resultado: {rate:.2f} msg/s")
            
            self.tester.close_connection()
            time.sleep(2)  # Pausa entre testes
        
        self.results.extend(results)
        return results
    
    def run_concurrency_test(self, message_count: int, thread_counts: list, queue_name: str = Queues.CHECKOUT):
        """Testa performance com diferentes números de threads"""
        print("\n🔥 TESTE DE CONCORRÊNCIA")
        print("=" * 50)
        
        results = []
        
        for threads in thread_counts:
            print(f"\n🧵 Testando com {threads} threads...")
            
            if not self.tester.connect():
                continue
                
            if not self.tester.setup_queues():
                continue
            
            # Limpa a fila antes do teste
            try:
                self.tester.channel.queue_purge(queue_name)
            except:
                pass
            
            self.tester.close_connection()
            
            # Executa o teste concorrente
            sent, errors, duration, rate = self.tester.run_concurrent_load_test(
                queue_name, message_count, threads
            )
            
            result = {
                'test': 'concurrency',
                'messages': message_count,
                'threads': threads,
                'sent': sent,
                'errors': errors,
                'duration': duration,
                'rate': rate,
                'queue': queue_name,
                'timestamp': datetime.now().isoformat()
            }
            
            results.append(result)
            
            print(f"✅ Resultado: {rate:.2f} msg/s com {threads} threads")
            
            time.sleep(3)  # Pausa entre testes
        
        self.results.extend(results)
        return results
    
    def run_stress_test(self, queue_name: str = Queues.CHECKOUT):
        """Executa teste de stress com alta carga"""
        print("\n💥 TESTE DE STRESS")
        print("=" * 50)
        
        # Configurações de stress
        stress_configs = [
            {'messages': 1000, 'threads': 10, 'name': 'Stress Médio'},
            {'messages': 5000, 'threads': 15, 'name': 'Stress Alto'},
            {'messages': 10000, 'threads': 20, 'name': 'Stress Extremo'}
        ]
        
        results = []
        
        for config in stress_configs:
            print(f"\n⚡ {config['name']}: {config['messages']} mensagens, {config['threads']} threads")
            
            start_time = time.time()
            
            sent, errors, duration, rate = self.tester.run_concurrent_load_test(
                queue_name, config['messages'], config['threads']
            )
            
            # Verifica estado das filas após o teste
            if self.tester.connect():
                try:
                    method = self.tester.channel.queue_declare(queue=queue_name, passive=True)
                    queue_size = method.method.message_count
                except:
                    queue_size = -1
                    
                self.tester.close_connection()
            else:
                queue_size = -1
            
            result = {
                'test': 'stress',
                'config': config['name'],
                'messages': config['messages'],
                'threads': config['threads'],
                'sent': sent,
                'errors': errors,
                'duration': duration,
                'rate': rate,
                'queue_size_after': queue_size,
                'queue': queue_name,
                'timestamp': datetime.now().isoformat()
            }
            
            results.append(result)
            
            print(f"✅ {config['name']} concluído:")
            print(f"   • Taxa: {rate:.2f} msg/s")
            print(f"   • Mensagens na fila: {queue_size}")
            print(f"   • Errors: {errors}")
            
            time.sleep(5)  # Pausa maior entre testes de stress
        
        self.results.extend(results)
        return results
    
    def run_latency_test(self, message_count: int = 100):
        """Testa latência de envio individual de mensagens"""
        print("\n⏱️  TESTE DE LATÊNCIA")
        print("=" * 50)
        
        if not self.tester.connect():
            return []
            
        if not self.tester.setup_queues():
            return []
        
        latencies = []
        
        print(f"📊 Testando latência com {message_count} mensagens individuais...")
        
        for i in range(message_count):
            message = self.tester.create_sample_checkout_message(f"latency_test_{i}")
            
            start_time = time.time()
            success = self.tester.publish_message(Queues.CHECKOUT, message)
            end_time = time.time()
            
            if success:
                latency = (end_time - start_time) * 1000  # em milissegundos
                latencies.append(latency)
            
            if (i + 1) % 20 == 0:
                print(f"   Progresso: {i + 1}/{message_count}")
        
        if latencies:
            avg_latency = statistics.mean(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            p95_latency = statistics.quantiles(latencies, n=20)[18]  # 95º percentil
            
            result = {
                'test': 'latency',
                'messages': len(latencies),
                'avg_latency_ms': avg_latency,
                'min_latency_ms': min_latency,
                'max_latency_ms': max_latency,
                'p95_latency_ms': p95_latency,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"✅ Resultados de Latência:")
            print(f"   • Média: {avg_latency:.2f}ms")
            print(f"   • Mínima: {min_latency:.2f}ms")
            print(f"   • Máxima: {max_latency:.2f}ms")
            print(f"   • 95º percentil: {p95_latency:.2f}ms")
            
            self.results.append(result)
            self.tester.close_connection()
            return [result]
        
        self.tester.close_connection()
        return []
    
    def generate_report(self):
        """Gera relatório completo dos benchmarks"""
        if not self.results:
            print("❌ Nenhum resultado de benchmark disponível")
            return
        
        print("\n" + "=" * 80)
        print("📈 RELATÓRIO COMPLETO DE PERFORMANCE")
        print("=" * 80)
        
        # Agrupa resultados por tipo de teste
        tests_by_type = {}
        for result in self.results:
            test_type = result['test']
            if test_type not in tests_by_type:
                tests_by_type[test_type] = []
            tests_by_type[test_type].append(result)
        
        # Relatório por tipo de teste
        for test_type, test_results in tests_by_type.items():
            print(f"\n🎯 {test_type.upper()}")
            print("-" * 40)
            
            if test_type == 'throughput':
                print("Mensagens    Enviadas    Taxa (msg/s)    Duração")
                print("-" * 50)
                for result in test_results:
                    print(f"{result['messages']:>8}    {result['sent']:>8}    {result['rate']:>10.2f}    {result['duration']:>7.2f}s")
            
            elif test_type == 'concurrency':
                print("Threads    Mensagens    Enviadas    Taxa (msg/s)    Duração")
                print("-" * 60)
                for result in test_results:
                    print(f"{result['threads']:>7}    {result['messages']:>9}    {result['sent']:>8}    {result['rate']:>10.2f}    {result['duration']:>7.2f}s")
            
            elif test_type == 'stress':
                print("Configuração         Mensagens    Taxa (msg/s)    Erros    Fila Final")
                print("-" * 70)
                for result in test_results:
                    print(f"{result['config']:<18}    {result['messages']:>9}    {result['rate']:>10.2f}    {result['errors']:>5}    {result['queue_size_after']:>10}")
            
            elif test_type == 'latency':
                for result in test_results:
                    print(f"Mensagens testadas: {result['messages']}")
                    print(f"Latência média: {result['avg_latency_ms']:.2f}ms")
                    print(f"Latência mínima: {result['min_latency_ms']:.2f}ms")
                    print(f"Latência máxima: {result['max_latency_ms']:.2f}ms")
                    print(f"95º percentil: {result['p95_latency_ms']:.2f}ms")
        
        # Salva relatório em arquivo JSON
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"benchmark_report_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo em: {filename}")
        
        # Resumo final
        print(f"\n📊 RESUMO EXECUTIVO")
        print(f"-" * 30)
        
        # Melhor throughput
        throughput_results = [r for r in self.results if r['test'] == 'throughput']
        if throughput_results:
            best_throughput = max(throughput_results, key=lambda x: x['rate'])
            print(f"🚀 Melhor throughput: {best_throughput['rate']:.2f} msg/s ({best_throughput['messages']} mensagens)")
        
        # Melhor concorrência
        concurrency_results = [r for r in self.results if r['test'] == 'concurrency']
        if concurrency_results:
            best_concurrency = max(concurrency_results, key=lambda x: x['rate'])
            print(f"🔥 Melhor concorrência: {best_concurrency['rate']:.2f} msg/s ({best_concurrency['threads']} threads)")
        
        # Latência média
        latency_results = [r for r in self.results if r['test'] == 'latency']
        if latency_results:
            avg_latency = latency_results[0]['avg_latency_ms']
            print(f"⏱️  Latência média: {avg_latency:.2f}ms")

def main():
    """Executa suite completa de benchmarks"""
    print("\n" + "=" * 80)
    print("⚡ BENCHMARK DE PERFORMANCE - CMSHOP MESSAGING")
    print("=" * 80)
    
    benchmark = PerformanceBenchmark()
    
    print("\n🎯 SUITE DE TESTES DISPONÍVEIS:")
    print("1. 🚀 Teste de Throughput (diferentes quantidades)")
    print("2. 🔥 Teste de Concorrência (diferentes threads)")
    print("3. 💥 Teste de Stress (alta carga)")
    print("4. ⏱️  Teste de Latência")
    print("5. 🎪 SUITE COMPLETA (todos os testes)")
    
    choice = input("\nEscolha uma opção (1-5): ").strip()
    
    start_time = time.time()
    
    try:
        if choice == '1':
            # Teste de throughput
            message_counts = [10, 50, 100, 500, 1000]
            benchmark.run_throughput_test(message_counts)
            
        elif choice == '2':
            # Teste de concorrência
            thread_counts = [1, 2, 5, 10, 15]
            benchmark.run_concurrency_test(500, thread_counts)
            
        elif choice == '3':
            # Teste de stress
            benchmark.run_stress_test()
            
        elif choice == '4':
            # Teste de latência
            benchmark.run_latency_test(100)
            
        elif choice == '5':
            # Suite completa
            print("\n🎪 Executando SUITE COMPLETA de benchmarks...")
            print("⚠️  Isto pode levar vários minutos...")
            
            confirm = input("Continuar? (s/N): ").strip().lower()
            if confirm != 's':
                print("Cancelado pelo usuário")
                return
            
            # Throughput
            print("\n" + "🚀" * 20 + " THROUGHPUT " + "🚀" * 20)
            benchmark.run_throughput_test([50, 100, 500, 1000])
            
            # Concorrência
            print("\n" + "🔥" * 20 + " CONCORRÊNCIA " + "🔥" * 20)
            benchmark.run_concurrency_test(500, [1, 3, 5, 10])
            
            # Latência
            print("\n" + "⏱️ " * 20 + " LATÊNCIA " + "⏱️ " * 20)
            benchmark.run_latency_test(50)
            
            # Stress (versão reduzida para suite completa)
            print("\n" + "💥" * 20 + " STRESS " + "💥" * 20)
            stress_configs = [
                {'messages': 500, 'threads': 8, 'name': 'Stress Médio'},
                {'messages': 2000, 'threads': 12, 'name': 'Stress Alto'}
            ]
            
            for config in stress_configs:
                print(f"\n⚡ {config['name']}: {config['messages']} mensagens, {config['threads']} threads")
                sent, errors, duration, rate = benchmark.tester.run_concurrent_load_test(
                    Queues.CHECKOUT, config['messages'], config['threads']
                )
                
                result = {
                    'test': 'stress',
                    'config': config['name'],
                    'messages': config['messages'],
                    'threads': config['threads'],
                    'sent': sent,
                    'errors': errors,
                    'duration': duration,
                    'rate': rate,
                    'queue': Queues.CHECKOUT,
                    'timestamp': datetime.now().isoformat()
                }
                
                benchmark.results.append(result)
                time.sleep(3)
        
        else:
            print("❌ Opção inválida")
            return
        
        # Gera relatório final
        total_time = time.time() - start_time
        print(f"\n⏰ Tempo total de execução: {total_time:.2f} segundos")
        benchmark.generate_report()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Benchmark interrompido pelo usuário")
        if benchmark.results:
            print("📊 Gerando relatório dos testes concluídos...")
            benchmark.generate_report()
    except Exception as e:
        print(f"\n❌ Erro durante benchmark: {e}")

if __name__ == "__main__":
    main()