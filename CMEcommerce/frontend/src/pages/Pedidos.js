import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrderService from '../services/OrderService';
import AuthService from '../services/AuthService';
import '../styles/Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  
  useEffect(() => {
    loadPedidos();
  }, []);
  
  const loadPedidos = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        setError("Você precisa estar logado para ver seus pedidos.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const pedidosData = await OrderService.getUserOrders();
      setPedidos(pedidosData);
      setFilteredPedidos(pedidosData);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setError(error.message || "Ocorreu um erro ao carregar seus pedidos.");
      setLoading(false);
    }
  };
  
  // Aplicar filtros
  const aplicarFiltros = () => {
    let pedidosFiltrados = [...pedidos];
    
    // Filtrar por status
    if (filtroStatus) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => {
        const statusPedido = pedido.orderHeader.paymentStatus.toString().toLowerCase();
        return statusPedido === filtroStatus.toLowerCase();
      });
    }
    
    // Filtrar por data
    if (filtroData) {
      const dataFiltro = new Date(filtroData);
      dataFiltro.setHours(0, 0, 0, 0);
      
      pedidosFiltrados = pedidosFiltrados.filter(pedido => {
        const dataPedido = new Date(pedido.orderHeader.purchaseDate);
        dataPedido.setHours(0, 0, 0, 0);
        return dataPedido.getTime() === dataFiltro.getTime();
      });
    }
    
    setFilteredPedidos(pedidosFiltrados);
  };
  
  // Limpar filtros
  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroData('');
    setFilteredPedidos(pedidos);
  };
  
  // Abrir modal de detalhes
  const abrirDetalhesPedido = (pedido) => {
    setSelectedPedido(pedido);
  };
  
  // Fechar modal de detalhes
  const fecharDetalhesPedido = () => {
    setSelectedPedido(null);
  };

  return (
    <div className="pedidos-page">
      <div className="pedidos-container">
        <div className="pedidos-card">
          <div className="pedidos-header">
            <h1 className="pedidos-title">Meus Pedidos</h1>
          </div>
          
          {/* Filtros */}
          <div className="pedidos-filtros">
            <div className="filtro-grupo">
              <label htmlFor="filtro-status">Status do Pagamento</label>
              <select 
                id="filtro-status" 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Aprovado</option>
                <option value="false">Recusado</option>
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label htmlFor="filtro-data">Data do Pedido</label>
              <input 
                type="date" 
                id="filtro-data" 
                value={filtroData} 
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
            
            <div className="filtro-grupo" style={{ justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-filtrar" onClick={aplicarFiltros}>
                  🔍 Filtrar
                </button>
                <button className="btn-filtrar btn-limpar" onClick={limparFiltros}>
                  ↺ Limpar
                </button>
              </div>
            </div>
          </div>
          
          {/* Conteúdo */}
          {loading ? (
            <div className="pedidos-loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="pedidos-erro">
              <p>{error}</p>
              <button className="btn-shop" onClick={() => loadPedidos()}>
                Tentar Novamente
              </button>
            </div>
          ) : filteredPedidos.length > 0 ? (
            <table className="lista-pedidos">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.map(pedido => (
                  <tr key={pedido.orderHeader.id} className="pedido-row">
                    <td className="pedido-id">#{pedido.orderHeader.id}</td>
                    <td className="pedido-data">
                      {OrderService.formatOrderDate(pedido.orderHeader.purchaseDate)}
                    </td>
                    <td className="pedido-total">
                      {OrderService.formatOrderPrice(pedido.orderHeader.purchaseAmount)}
                    </td>
                    <td>
                      <span className={`pedido-status ${OrderService.getPaymentStatusClass(pedido.orderHeader.paymentStatus)}`}>
                        {OrderService.getPaymentStatusText(pedido.orderHeader.paymentStatus)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-detalhes" 
                        onClick={() => abrirDetalhesPedido(pedido)}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-orders">
              <div className="empty-orders-icon">📦</div>
              <h2>Você ainda não tem pedidos</h2>
              <p>Que tal explorar nossa loja e fazer seu primeiro pedido?</p>
              <Link to="/loja" className="btn-shop">
                Ir para Loja
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Detalhes do Pedido */}
      {selectedPedido && (
        <div className="modal-overlay" onClick={fecharDetalhesPedido}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Pedido #{selectedPedido.orderHeader.id}</h2>
              <button className="modal-close" onClick={fecharDetalhesPedido}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="pedido-info">
                <div className="info-grupo">
                  <h4>Informações do Pedido</h4>
                  <div className="info-item">
                    <span className="info-label">Data do Pedido</span>
                    <span className="info-valor">
                      {OrderService.formatOrderDate(selectedPedido.orderHeader.purchaseDate)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status do Pagamento</span>
                    <span className={`pedido-status ${OrderService.getPaymentStatusClass(selectedPedido.orderHeader.paymentStatus)}`}>
                      {OrderService.getPaymentStatusText(selectedPedido.orderHeader.paymentStatus)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total de Itens</span>
                    <span className="info-valor">
                      {selectedPedido.orderHeader.totalItems}
                    </span>
                  </div>
                </div>
                
                <div className="info-grupo">
                  <h4>Cliente</h4>
                  <div className="info-item">
                    <span className="info-label">Nome</span>
                    <span className="info-valor">
                      {selectedPedido.orderHeader.firstName} {selectedPedido.orderHeader.lastName}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-valor">
                      {selectedPedido.orderHeader.email}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Telefone</span>
                    <span className="info-valor">
                      {selectedPedido.orderHeader.phone || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className="pedido-itens-titulo">Itens do Pedido</h3>
              <table className="lista-itens">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Qtd</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPedido.orderDetails.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="item-imagem">📱</div>
                          <span className="item-nome">{item.productName}</span>
                        </div>
                      </td>
                      <td className="item-preco">
                        {OrderService.formatOrderPrice(item.price)}
                      </td>
                      <td className="item-quantidade">
                        {item.count}
                      </td>
                      <td className="item-subtotal">
                        {OrderService.formatOrderPrice(item.price * item.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="pedido-resumo">
                <div className="resumo-linha">
                  <span className="resumo-label">Subtotal</span>
                  <span className="resumo-valor">
                    {OrderService.formatOrderPrice(selectedPedido.orderHeader.purchaseAmount)}
                  </span>
                </div>
                
                {selectedPedido.orderHeader.discountAmount > 0 && (
                  <div className="resumo-linha">
                    <span className="resumo-label">Desconto (Cupom: {selectedPedido.orderHeader.couponCode})</span>
                    <span className="resumo-valor">
                      -{OrderService.formatOrderPrice(selectedPedido.orderHeader.discountAmount)}
                    </span>
                  </div>
                )}
                
                <div className="resumo-linha resumo-total">
                  <span className="resumo-label">Total</span>
                  <span className="resumo-valor">
                    {OrderService.formatOrderPrice(
                      selectedPedido.orderHeader.purchaseAmount - 
                      (selectedPedido.orderHeader.discountAmount || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
