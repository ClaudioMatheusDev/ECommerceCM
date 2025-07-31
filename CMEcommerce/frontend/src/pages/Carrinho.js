import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Carrinho.css';

function Carrinho() {
  const { 
    items, 
    loading,
    error,
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    refreshCart
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    alert('Funcionalidade de checkout será implementada em breve!');
  };

  const handleRefresh = () => {
    refreshCart();
  };

  if (loading) {
    return (
      <div className="carrinho-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrinho-page">
      {/* Header */}
      <div className="carrinho-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="page-icon">🛒</span>
                Seu Carrinho
              </h1>
              <p className="page-subtitle">
                {items.length === 0 
                  ? 'Seu carrinho está vazio' 
                  : `${items.length} item${items.length !== 1 ? 's' : ''} no carrinho`
                }
              </p>
              {error && (
                <div className="error-message">
                  <span>⚠️ {error}</span>
                  <button onClick={handleRefresh} className="refresh-btn">
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
            <div className="header-actions">
              <Link to="/loja" className="btn btn-secondary">
                <span className="btn-icon">🛍️</span>
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container carrinho-content">
        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h3>Seu carrinho está vazio</h3>
            <p>Que tal dar uma olhada em nossos produtos?</p>
            <Link to="/loja" className="btn btn-primary">
              <span className="btn-icon">🛍️</span>
              Ir às Compras
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items do Carrinho */}
            <div className="cart-items">
              <div className="cart-header">
                <h2>Itens do Carrinho</h2>
                <button 
                  className="clear-cart-btn"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
                      clearCart();
                    }
                  }}
                >
                  <span className="btn-icon">🗑️</span>
                  Limpar Carrinho
                </button>
              </div>

              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} />
                      ) : (
                        <span className="item-icon">📱</span>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.productName}</h4>
                      <p className="item-category">
                        📂 Produto
                      </p>
                      <p className="item-description">
                        Item adicionado ao carrinho
                      </p>
                    </div>
                    
                    <div className="item-price">
                      <span className="price-label">Preço Unitário</span>
                      <span className="price-value">{formatPrice(item.productPrice)}</span>
                    </div>
                    
                    <div className="item-quantity">
                      <span className="quantity-label">Quantidade</span>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="item-total">
                      <span className="total-label">Subtotal</span>
                      <span className="total-value">
                        {formatPrice(item.productPrice * item.quantity)}
                      </span>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remover item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="cart-summary">
              <div className="summary-card">
                <h3 className="summary-title">
                  <span className="summary-icon">📋</span>
                  Resumo do Pedido
                </h3>
                
                <div className="summary-details">
                  <div className="summary-line">
                    <span>Itens ({items.length})</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="summary-line">
                    <span>Frete</span>
                    <span className="free-shipping">Grátis</span>
                  </div>
                  <div className="summary-line">
                    <span>Desconto</span>
                    <span>-</span>
                  </div>
                  <hr className="summary-divider" />
                  <div className="summary-total">
                    <span>Total</span>
                    <span className="total-amount">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
                
                <div className="summary-actions">
                  <button 
                    className="btn btn-primary btn-full"
                    onClick={handleCheckout}
                  >
                    <span className="btn-icon">💳</span>
                    Finalizar Compra
                  </button>
                  
                  <div className="payment-info">
                    <p>🔒 Pagamento 100% seguro</p>
                    <p>📦 Entrega em até 7 dias úteis</p>
                  </div>
                </div>
              </div>
              
              {/* Cupom de Desconto */}
              <div className="coupon-card">
                <h4 className="coupon-title">
                  <span className="coupon-icon">🎫</span>
                  Cupom de Desconto
                </h4>
                <div className="coupon-form">
                  <input 
                    type="text" 
                    placeholder="Digite seu cupom"
                    className="coupon-input"
                  />
                  <button className="coupon-btn">Aplicar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carrinho;
