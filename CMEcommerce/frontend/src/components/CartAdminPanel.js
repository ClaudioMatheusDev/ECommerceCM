import React, { useState, useEffect } from 'react';
import * as CartService from '../services/CartService';
import '../styles/CartAdminPanel.css';

function CartAdminPanel() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);

  useEffect(() => {
    loadAllCarts();
  }, []);

  const loadAllCarts = async () => {
    try {
      setLoading(true);
      const allCarts = await CartService.getAllCarts();
      setCarts(allCarts);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar carrinhos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getCartTotal = (cartItems) => {
    return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  };

  const getCartItemsCount = (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const handleViewCart = (cart) => {
    setSelectedCart(cart);
  };

  const handleCloseModal = () => {
    setSelectedCart(null);
  };

  const handleClearCart = async (cartId, userId) => {
    if (window.confirm('Tem certeza que deseja limpar este carrinho?')) {
      try {
        await CartService.clearCart(userId);
        await loadAllCarts();
        if (selectedCart && selectedCart.id === cartId) {
          setSelectedCart(null);
        }
      } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        alert('Erro ao limpar carrinho: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="cart-admin-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando carrinhos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-admin-panel">
      <div className="panel-header">
        <h2>
          <span className="panel-icon">🛒</span>
          Gerenciamento de Carrinhos
        </h2>
        <button onClick={loadAllCarts} className="refresh-btn">
          <span>🔄</span>
          Atualizar
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={loadAllCarts} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="carts-grid">
        {carts.length === 0 ? (
          <div className="no-carts">
            <div className="no-carts-icon">🛒</div>
            <h3>Nenhum carrinho encontrado</h3>
            <p>Não há carrinhos ativos no sistema.</p>
          </div>
        ) : (
          carts.map((cart) => (
            <div key={cart.id} className="cart-card">
              <div className="cart-header">
                <h3>Carrinho #{cart.id}</h3>
                <span className="user-id">Usuário: {cart.userId}</span>
              </div>
              
              <div className="cart-stats">
                <div className="stat">
                  <span className="stat-label">Itens:</span>
                  <span className="stat-value">{getCartItemsCount(cart.items)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{formatPrice(getCartTotal(cart.items))}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Última atualização:</span>
                  <span className="stat-value">{formatDate(cart.updatedAt || cart.createdAt)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  onClick={() => handleViewCart(cart)}
                  className="view-btn"
                >
                  👁️ Ver Detalhes
                </button>
                <button 
                  onClick={() => handleClearCart(cart.id, cart.userId)}
                  className="clear-btn"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes do Carrinho */}
      {selectedCart && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Carrinho #{selectedCart.id}</h2>
              <button onClick={handleCloseModal} className="close-btn">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="cart-info">
                <p><strong>Usuário:</strong> {selectedCart.userId}</p>
                <p><strong>Total de Itens:</strong> {getCartItemsCount(selectedCart.items)}</p>
                <p><strong>Valor Total:</strong> {formatPrice(getCartTotal(selectedCart.items))}</p>
                <p><strong>Criado em:</strong> {formatDate(selectedCart.createdAt)}</p>
                {selectedCart.updatedAt && (
                  <p><strong>Atualizado em:</strong> {formatDate(selectedCart.updatedAt)}</p>
                )}
              </div>
              
              <div className="cart-items">
                <h3>Itens do Carrinho:</h3>
                {selectedCart.items.length === 0 ? (
                  <p className="no-items">Carrinho vazio</p>
                ) : (
                  <div className="items-list">
                    {selectedCart.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <strong>{item.productName}</strong>
                          <span className="item-price">{formatPrice(item.productPrice)}</span>
                        </div>
                        <div className="item-quantity">
                          Qtd: {item.quantity}
                        </div>
                        <div className="item-total">
                          {formatPrice(item.productPrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartAdminPanel;
