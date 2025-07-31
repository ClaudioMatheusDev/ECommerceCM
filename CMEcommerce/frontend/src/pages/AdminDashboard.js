import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { findAllProduct } from '../services/ProductService';
import CartAdminPanel from '../components/CartAdminPanel';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products' ou 'carts'
  const [stats, setStats] = useState({
    total: 0,
    lowPrice: 0,
    highPrice: 0,
    avgPrice: 0
  });

  useEffect(() => {
    findAllProduct()
      .then(data => {
        setProdutos(data);
        calculateStats(data);
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const calculateStats = (products) => {
    if (products.length === 0) return;
    
    const total = products.length;
    const lowPrice = products.filter(p => p.price < 100).length;
    const highPrice = products.filter(p => p.price >= 100).length;
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / total;
    
    setStats({ total, lowPrice, highPrice, avgPrice });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="admin-title-section">
            <h1 className="admin-title">
              <span className="admin-icon">🛠️</span>
              Painel Administrativo
            </h1>
            <p className="admin-subtitle">Gerencie seus produtos e monitore vendas</p>
          </div>
          <div className="admin-actions">
            <Link to="/product-create" className="btn btn-success">
              <span className="btn-icon">➕</span>
              Novo Produto
            </Link>
            <Link to="/loja" className="btn btn-secondary">
              <span className="btn-icon">🛍️</span>
              Ver Loja
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <div className="container">
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <span className="tab-icon">📦</span>
              Produtos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'carts' ? 'active' : ''}`}
              onClick={() => setActiveTab('carts')}
            >
              <span className="tab-icon">🛒</span>
              Carrinhos
            </button>
          </div>
        </div>
      </div>

      <div className="container admin-content">
        {/* Stats Dashboard */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total de Produtos</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-number">{formatPrice(stats.avgPrice)}</div>
              <div className="stat-label">Preço Médio</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <div className="stat-number">{stats.lowPrice}</div>
              <div className="stat-label">Até R$ 100</div>
            </div>
          </div>
          
          <div className="stat-card danger">
            <div className="stat-icon">💎</div>
            <div className="stat-info">
              <div className="stat-number">{stats.highPrice}</div>
              <div className="stat-label">Acima R$ 100</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Carregando produtos...</p>
          </div>
        )}

        {erro && (
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h3>Erro ao carregar produtos</h3>
            <p>{erro}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!loading && !erro && (
          <div className="products-management">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📋</span>
                Gerenciar Produtos
              </h2>
              <div className="section-actions">
                <input 
                  type="search" 
                  placeholder="Buscar produtos..." 
                  className="search-input"
                />
              </div>
            </div>

            {produtos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Nenhum produto cadastrado</h3>
                <p>Comece criando seu primeiro produto</p>
                <Link to="/product-create" className="btn btn-primary">
                  Criar Primeiro Produto
                </Link>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Status</th>
                      <th className="actions-col">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id} className="product-row">
                        <td>
                          <span className="product-id">#{produto.id}</span>
                        </td>
                        <td>
                          <div className="product-info">
                            <div className="product-name">{produto.name}</div>
                            <div className="product-description">
                              {produto.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {produto.categoryName || 'Sem categoria'}
                          </span>
                        </td>
                        <td>
                          <span className="price-value">
                            {formatPrice(produto.price)}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge active">
                            Ativo
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/product-update/${produto.id}`} 
                              className="btn btn-sm btn-primary"
                              title="Editar produto"
                            >
                              <span className="btn-icon">✏️</span>
                            </Link>
                            <Link 
                              to={`/product-delete/${produto.id}`} 
                              className="btn btn-sm btn-danger"
                              title="Excluir produto"
                            >
                              <span className="btn-icon">🗑️</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
