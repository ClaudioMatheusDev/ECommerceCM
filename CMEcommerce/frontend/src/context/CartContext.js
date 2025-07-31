import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import * as CartService from '../services/CartService';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || [],
        loading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [error, setError] = useState(null);
  
  // Simulando userId - em produção viria do contexto de autenticação
  const userId = "user-123"; // Este valor deve vir do sistema de autenticação

  // Carregar carrinho do backend
  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await CartService.findCartByUserId(userId);
      dispatch({ type: 'LOAD_CART', payload: cartData.items || [] });
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setError(error.message);
      // Fallback para localStorage em caso de erro
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Carregar carrinho na inicialização
  useEffect(() => {
    loadCart();
  }, []);

  // Backup no localStorage
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = async (product, quantity = 1) => {
    try {
      const cartItem = {
        userId: userId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.imageUrl,
        quantity: quantity,
      };

      await CartService.addToCart(cartItem);
      await loadCart(); // Recarregar carrinho após adicionar
      setError(null);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      setError(error.message);
      
      // Fallback para localStorage
      const existingItem = state.items.find(item => item.productId === product.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        dispatch({ type: 'LOAD_CART', payload: updatedItems });
      } else {
        const newItem = {
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.imageUrl,
          quantity: quantity,
        };
        dispatch({ type: 'LOAD_CART', payload: [...state.items, newItem] });
      }
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await CartService.removeFromCart(itemId);
      await loadCart(); // Recarregar carrinho após remover
      setError(null);
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      setError(error.message);
      
      // Fallback para localStorage
      const updatedItems = state.items.filter(item => item.id !== itemId);
      dispatch({ type: 'LOAD_CART', payload: updatedItems });
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        const updatedItem = { ...item, quantity };
        await CartService.updateCartItem(itemId, updatedItem);
        await loadCart(); // Recarregar carrinho após atualizar
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      setError(error.message);
      
      // Fallback para localStorage
      const updatedItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
      dispatch({ type: 'LOAD_CART', payload: updatedItems });
    }
  };

  const clearCart = async () => {
    try {
      await CartService.clearCart(userId);
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
      setError(null);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      setError(error.message);
      
      // Fallback para localStorage
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        loading: state.loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
