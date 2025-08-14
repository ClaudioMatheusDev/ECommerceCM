import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { findAllProduct } from '../services/ProductService';
import { useCart } from '../context/CartContext';
import '../styles/Loja.css';

function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const { addToCart, getCartItemsCount } = useCart();

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

  const handleAddToCart = (produto) => {
    addToCart(produto);
    // Pequena animação visual
    const button = document.querySelector(`[data-product-id="${produto.id}"]`);
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.name.toLowerCase().includes(busca.toLowerCase()) ||
                      produto.description?.toLowerCase().includes(busca.toLowerCase());
    
    if (filtro === 'todos') return matchBusca;
    if (filtro === 'baratos') return matchBusca && produto.price < 100;
    if (filtro === 'caros') return matchBusca && produto.price >= 100;
    
    return matchBusca;
  });

  return (
    <div className="loja-page">
      {/* Header da Loja */}
      <div className="loja-header">
        <div className="container">
          <div className="loja-title-section">
            <h1 className="loja-title">
              <span className="loja-icon">🛍️</span>
              Nossa Loja
            </h1>
            <p className="loja-subtitle">Descubra produtos incríveis com os melhores preços</p>
          </div>
          
          <div className="loja-actions">
            <Link to="/carrinho" className="cart-button">
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Carrinho</span>
              {getCartItemsCount() > 0 && (
                <span className="cart-badge">{getCartItemsCount()}</span>
              )}
            </Link>
            <Link to="/admin" className="admin-link">
              <span className="admin-icon">⚙️</span>
              Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="container loja-content">
        {/* Filtros e Busca */}
        <div className="filters-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos ({produtos.length})
            </button>
            <button 
              className={`filter-btn ${filtro === 'baratos' ? 'active' : ''}`}
              onClick={() => setFiltro('baratos')}
            >
              Até R$ 100 ({produtos.filter(p => p.price < 100).length})
            </button>
            <button 
              className={`filter-btn ${filtro === 'caros' ? 'active' : ''}`}
              onClick={() => setFiltro('caros')}
            >
              Acima R$ 100 ({produtos.filter(p => p.price >= 100).length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Carregando produtos...</p>
          </div>
        )}

        {/* Error State */}
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

        {/* Products Grid */}
        {!loading && !erro && (
          <>
            {produtosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar sua busca ou filtros</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setBusca('');
                    setFiltro('todos');
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="results-info">
                  <span className="results-count">
                    {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="products-grid">
                  {produtosFiltrados.map((produto) => (
                    <div key={produto.id} className="product-card">
                      <div className="product-image">
                        {produto.imageURL && produto.imageURL.trim() !== '' ? (
                          <img 
                            src={produto.imageURL} 
                            alt={produto.name}
                            className="product-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="product-icon-fallback"
                          style={{
                            display: !produto.imageURL || produto.imageURL.trim() === '' ? 'flex' : 'none'
                          }}
                        >
                          📱
                        </div>
                        <div className="product-badge">
                          ID: {produto.id}
                        </div>
                      </div>
                      
                      <div className="product-content">
                        <h3 className="product-title">
                          {produto.name}
                        </h3>
                        
                        <p className="product-description">
                          {produto.description && produto.description.length > 100
                            ? `${produto.description.substring(0, 100)}...`
                            : produto.description || 'Produto de qualidade com excelente custo-benefício'}
                        </p>
                        
                        <div className="product-info">
                          <div className="product-category">
                            📂 {produto.categoryName || 'Categoria'}
                          </div>
                        </div>
                        
                        <div className="product-footer">
                          <div className="product-price">
                            {formatPrice(produto.price)}
                          </div>
                          
                          <div className="product-actions">
                            <Link 
                              to={`/produto/${produto.id}`} 
                              className="btn btn-outline"
                            >
                              Ver Detalhes
                            </Link>
                            <button 
                              className="btn btn-primary add-to-cart-btn"
                              data-product-id={produto.id}
                              onClick={() => handleAddToCart(produto)}
                            >
                              <span className="btn-icon">🛒</span>
                              Adicionar
                            </button>
                          </div>
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

export default Loja;
