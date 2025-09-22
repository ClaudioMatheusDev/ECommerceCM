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
      
      // Verificar se recebemos um array ou um objeto com propriedades
      let processedCarts = Array.isArray(allCarts) ? allCarts : [allCarts];
      
      // Filtrar valores nulos ou undefined
      processedCarts = processedCarts.filter(cart => cart !== null && cart !== undefined);
      
      // Normalizar a estrutura para garantir compatibilidade
      processedCarts = processedCarts.map(cart => {
        // Se não tiver um ID e tiver cartHeader, use o ID do cartHeader
        if (!cart.id && cart.cartHeader?.id) {
          return {
            ...cart,
            id: cart.cartHeader.id,
            userId: cart.cartHeader.userId,
            items: cart.cartDetails || [],
            createdAt: cart.cartHeader.createdAt || new Date().toISOString(),
            updatedAt: cart.cartHeader.updatedAt
          };
        }
        return cart;
      });
      
      console.log('Carrinhos processados:', processedCarts);
      
      setCarts(processedCarts);
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

  const getCartTotal = (cartItems = []) => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      // Lidar com diferentes formatos de dados (API backend vs frontend)
      const price = item?.productPrice || item?.price || (item?.product?.price) || 0;
      const quantity = item?.quantity || item?.count || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemsCount = (cartItems = []) => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((count, item) => {
      // Lidar com diferentes formatos de dados
      const quantity = item?.quantity || item?.count || 0;
      return count + quantity;
    }, 0);
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
        // Verificar o formato correto do ID do carrinho selecionado
        const selectedCartId = selectedCart?.id || selectedCart?.cartHeader?.id;
        if (selectedCart && selectedCartId === cartId) {
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
          carts.map((cart) => {
            // Determinar a estrutura correta dos itens do carrinho
            const cartItems = cart.items || cart.cartDetails || [];
            const userId = cart.userId || cart.cartHeader?.userId;
            const cartId = cart.id || cart.cartHeader?.id;
            const lastUpdate = cart.updatedAt || cart.cartHeader?.updatedAt || cart.createdAt || cart.cartHeader?.createdAt || new Date();
            
            return (
              <div key={cartId} className="cart-card">
                <div className="cart-header">
                  <h3>Carrinho #{cartId}</h3>
                  <span className="user-id">Usuário: {userId}</span>
                </div>
                
                <div className="cart-stats">
                  <div className="stat">
                    <span className="stat-label">Itens:</span>
                    <span className="stat-value">{getCartItemsCount(cartItems)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{formatPrice(getCartTotal(cartItems))}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Última atualização:</span>
                    <span className="stat-value">{formatDate(lastUpdate)}</span>
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
                  onClick={() => handleClearCart(cartId, userId)}
                  className="clear-btn"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
          );})
        )}
      </div>

      {/* Modal de Detalhes do Carrinho */}
      {selectedCart && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Carrinho #{selectedCart.id || selectedCart.cartHeader?.id}</h2>
              <button onClick={handleCloseModal} className="close-btn">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="cart-info">
                <p><strong>Usuário:</strong> {selectedCart.userId || selectedCart.cartHeader?.userId}</p>
                {/* Usar a função normalizada para itens */}
                {(() => {
                  const cartItems = selectedCart.items || selectedCart.cartDetails || [];
                  const createdAt = selectedCart.createdAt || selectedCart.cartHeader?.createdAt;
                  const updatedAt = selectedCart.updatedAt || selectedCart.cartHeader?.updatedAt;
                  
                  return (
                    <>
                      <p><strong>Total de Itens:</strong> {getCartItemsCount(cartItems)}</p>
                      <p><strong>Valor Total:</strong> {formatPrice(getCartTotal(cartItems))}</p>
                      {createdAt && <p><strong>Criado em:</strong> {formatDate(createdAt)}</p>}
                      {updatedAt && <p><strong>Atualizado em:</strong> {formatDate(updatedAt)}</p>}
                    </>
                  );
                })()} 
              </div>
              
              <div className="cart-items">
                <h3>Itens do Carrinho:</h3>
                {(() => {
                  const cartItems = selectedCart.items || selectedCart.cartDetails || [];
                  
                  return cartItems.length === 0 ? (
                    <p className="no-items">Carrinho vazio</p>
                  ) : (
                    <div className="items-list">
                      {cartItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <strong>{item.productName || item.product?.name || 'Produto'}</strong>
                          <span className="item-price">{formatPrice(item.productPrice || item.price || item.product?.price || 0)}</span>
                        </div>
                        <div className="item-quantity">
                          Qtd: {item.quantity || item.count || 0}
                        </div>
                        <div className="item-total">
                          {formatPrice(
                            (item.productPrice || item.price || item.product?.price || 0) * 
                            (item.quantity || item.count || 0)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartAdminPanel;
