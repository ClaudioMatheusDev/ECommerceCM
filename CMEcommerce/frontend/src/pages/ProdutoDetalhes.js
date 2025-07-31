import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findProductById } from '../services/ProductService';
import { useCart } from '../context/CartContext';
import '../styles/ProdutoDetalhes.css';

function ProdutoDetalhes() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    findProductById(id)
      .then(data => setProduto(data))
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (produto) {
      for (let i = 0; i < quantidade; i++) {
        addToCart(produto);
      }
      alert(`${quantidade} item(s) adicionado(s) ao carrinho!`);
    }
  };

  if (loading) {
    return (
      <div className="produto-detalhes-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="produto-detalhes-page">
        <div className="container">
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h3>Produto não encontrado</h3>
            <p>{erro || 'O produto que você procura não existe.'}</p>
            <Link to="/loja" className="btn btn-primary">
              Voltar à Loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="produto-detalhes-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/loja">Loja</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{produto.name}</span>
          </nav>
        </div>
      </div>

      <div className="container produto-content">
        <div className="produto-layout">
          {/* Imagem do Produto */}
          <div className="produto-image-section">
            <div className="produto-image-main">
              <span className="produto-icon">📱</span>
              <div className="produto-badge">
                ID: {produto.id}
              </div>
            </div>
            <div className="produto-thumbnails">
              <div className="thumbnail active">📱</div>
              <div className="thumbnail">📷</div>
              <div className="thumbnail">🔍</div>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="produto-info-section">
            <div className="produto-header">
              <h1 className="produto-title">{produto.name}</h1>
              <div className="produto-rating">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <span className="rating-text">(4.8) 156 avaliações</span>
              </div>
            </div>

            <div className="produto-price-section">
              <div className="price-current">{formatPrice(produto.price)}</div>
              <div className="price-original">{formatPrice(produto.price * 1.2)}</div>
              <div className="price-discount">20% OFF</div>
            </div>

            <div className="produto-description">
              <h3>Descrição</h3>
              <p>{produto.description || 'Este é um produto de alta qualidade com excelente custo-benefício. Ideal para quem busca performance e durabilidade.'}</p>
            </div>

            <div className="produto-details">
              <h3>Detalhes do Produto</h3>
              <ul>
                <li><strong>Categoria:</strong> {produto.categoryName || 'Eletrônicos'}</li>
                <li><strong>Código:</strong> #{produto.id}</li>
                <li><strong>Disponibilidade:</strong> <span className="in-stock">Em estoque</span></li>
                <li><strong>Garantia:</strong> 12 meses</li>
                <li><strong>Marca:</strong> Premium</li>
              </ul>
            </div>

            <div className="produto-actions">
              <div className="quantity-section">
                <label>Quantidade:</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantidade}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantidade(quantidade + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleAddToCart}
                >
                  <span className="btn-icon">🛒</span>
                  Adicionar ao Carrinho
                </button>
                <button className="btn btn-success btn-large">
                  <span className="btn-icon">⚡</span>
                  Comprar Agora
                </button>
              </div>
            </div>

            <div className="produto-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div className="feature-text">
                  <strong>Frete Grátis</strong>
                  <p>Para compras acima de R$ 99</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <div className="feature-text">
                  <strong>Troca Garantida</strong>
                  <p>30 dias para trocar</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <div className="feature-text">
                  <strong>Compra Segura</strong>
                  <p>Dados protegidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos Relacionados */}
        <div className="related-products">
          <h2 className="section-title">Produtos Relacionados</h2>
          <div className="related-grid">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="related-card">
                <div className="related-image">📱</div>
                <h4>Produto Relacionado {item}</h4>
                <div className="related-price">R$ 99,90</div>
                <button className="btn btn-sm btn-outline">Ver Produto</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProdutoDetalhes;
