import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { findAllProduct } from '../services/ProductService';
import '../styles/Produtos.css';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    findAllProduct()
      .then(data => setProdutos(data))
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="produtos-page">
      {/* Header Section */}
      <div className="produtos-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Nossos Produtos</h1>
              <p className="page-subtitle">Descubra nossa coleção completa</p>
            </div>
            <div className="header-actions">
              <Link to="/product-create" className="btn btn-primary">
                + Novo Produto
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container produtos-content">
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
            <h3>Ops! Algo deu errado</h3>
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
          <>
            {produtos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Nenhum produto encontrado</h3>
                <p>Que tal adicionar o primeiro produto?</p>
                <Link to="/product-create" className="btn btn-primary">
                  Criar Primeiro Produto
                </Link>
              </div>
            ) : (
              <>
                {/* Products Stats */}
                <div className="products-stats">
                  <div className="stat-card">
                    <div className="stat-number">{produtos.length}</div>
                    <div className="stat-label">Produtos</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {produtos.filter(p => p.price < 100).length}
                    </div>
                    <div className="stat-label">Até R$ 100</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {produtos.filter(p => p.price >= 100).length}
                    </div>
                    <div className="stat-label">Acima R$ 100</div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="products-grid">
                  {produtos.map((produto) => (
                    <div key={produto.id} className="product-card">
                      <div className="product-image">
                        <span className="product-icon">📱</span>
                        <div className="product-badge">
                          ID: {produto.id}
                        </div>
                      </div>
                      
                      <div className="product-content">
                        <h3 className="product-title">
                          {produto.name.length > 60 
                            ? `${produto.name.substring(0, 60)}...` 
                            : produto.name}
                        </h3>
                        
                        <p className="product-description">
                          {produto.description && produto.description.length > 100
                            ? `${produto.description.substring(0, 100)}...`
                            : produto.description || 'Sem descrição disponível'}
                        </p>
                        
                        <div className="product-info">
                          <div className="product-category">
                            📂 {produto.categoryName || 'Categoria'}
                          </div>
                          <div className="product-price">
                            {formatPrice(produto.price)}
                          </div>
                        </div>
                        
                        <div className="product-actions">
                          <Link 
                            to={`/product-update/${produto.id}`} 
                            className="btn btn-sm btn-primary"
                            title="Editar produto"
                          >
                            ✏️ Editar
                          </Link>
                          <Link 
                            to={`/product-delete/${produto.id}`} 
                            className="btn btn-sm btn-danger"
                            title="Excluir produto"
                          >
                            🗑️ Excluir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Produtos;