import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import * as CartService from '../services/CartService';
import AuthService from '../services/AuthService';

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

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Obter userId do usuário autenticado
  const getUserId = () => {
    const userInfo = AuthService.getUserInfo();
    return userInfo?.sub || null;
  };

  // Verificar se usuário está autenticado
  const isUserAuthenticated = () => {
    return AuthService.isAuthenticated();
  };

  // Converter dados do backend para formato do frontend
  const convertBackendToFrontend = (cartData) => {
    if (!cartData || !cartData.cartDetails) {
      return [];
    }

    return cartData.cartDetails.map(detail => ({
      id: detail.id,
      productId: detail.productId,
      productName: detail.product?.name || 'Produto sem nome',
      productPrice: detail.product?.price || 0,
      productImage: detail.product?.imageUrl || null,
      quantity: detail.count || 1,
      categoryName: detail.product?.categoryName || 'Categoria'
    }));
  };

  // Carregar carrinho do backend
  const loadCart = async () => {
    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Usuário não autenticado' });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      dispatch({ type: 'SET_ERROR', payload: 'ID do usuário não encontrado' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const cartData = await CartService.findCartByUserId(userId);
      const items = convertBackendToFrontend(cartData);
      
      dispatch({ type: 'LOAD_CART', payload: items });
      
      // Backup no localStorage apenas se tiver dados
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback para localStorage apenas se o erro não for de autenticação
      if (!error.message.includes('autenticado') && !error.message.includes('expirada')) {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          } catch (parseError) {
            console.error('Erro ao parsear carrinho salvo:', parseError);
            localStorage.removeItem('cart');
          }
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Carregar carrinho na inicialização e quando o usuário autentica
  useEffect(() => {
    if (isUserAuthenticated()) {
      loadCart();
    } else {
      // Se não autenticado, limpar estado e tentar carregar do localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (parseError) {
          localStorage.removeItem('cart');
        }
      }
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para sincronizar seu carrinho' });
    }
  }, []);

  const addToCart = async (product, quantity = 1) => {
    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para adicionar itens ao carrinho' });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      dispatch({ type: 'SET_ERROR', payload: 'ID do usuário não encontrado' });
      return;
    }

    try {
      const cartData = {
        userId: userId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.imageURL || product.imageUrl,
        productDescription: product.description,
        categoryName: product.categoryName,
        quantity: quantity
      };

      await CartService.addToCart(cartData);
      await loadCart(); // Recarregar carrinho após adicionar
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback para localStorage apenas se não for erro de autenticação
      if (!error.message.includes('autenticado') && !error.message.includes('expirada')) {
        const existingItem = state.items.find(item => item.productId === product.id);
        let updatedItems;
        
        if (existingItem) {
          updatedItems = state.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem = {
            id: Date.now(), // ID temporário
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productImage: product.imageURL || product.imageUrl,
            quantity: quantity,
            categoryName: product.categoryName
          };
          updatedItems = [...state.items, newItem];
        }
        
        dispatch({ type: 'LOAD_CART', payload: updatedItems });
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para remover itens do carrinho' });
      return;
    }

    try {
      await CartService.removeFromCart(itemId);
      await loadCart(); // Recarregar carrinho após remover
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback para localStorage
      if (!error.message.includes('autenticado') && !error.message.includes('expirada')) {
        const updatedItems = state.items.filter(item => item.id !== itemId);
        dispatch({ type: 'LOAD_CART', payload: updatedItems });
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para atualizar quantidades' });
      return;
    }

    try {
      // Para atualização de quantidade, precisamos recriar o carrinho
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        const updatedCartData = {
          userId: getUserId(),
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          categoryName: item.categoryName,
          quantity: quantity
        };
        
        // Primeiro remove o item atual
        await CartService.removeFromCart(itemId);
        // Depois adiciona com nova quantidade
        await CartService.addToCart(updatedCartData);
        
        await loadCart(); // Recarregar carrinho
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback para localStorage
      if (!error.message.includes('autenticado') && !error.message.includes('expirada')) {
        const updatedItems = state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        );
        dispatch({ type: 'LOAD_CART', payload: updatedItems });
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    }
  };

  const clearCart = async () => {
    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para limpar o carrinho' });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      dispatch({ type: 'SET_ERROR', payload: 'ID do usuário não encontrado' });
      return;
    }

    try {
      await CartService.clearCart(userId);
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback para localStorage
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
    }
  };

  const applyCoupon = async (couponCode) => {
    if (!isUserAuthenticated()) {
      dispatch({ type: 'SET_ERROR', payload: 'Faça login para aplicar cupons' });
      return false;
    }

    const userId = getUserId();
    if (!userId) {
      dispatch({ type: 'SET_ERROR', payload: 'ID do usuário não encontrado' });
      return false;
    }

    try {
      await CartService.applyCoupon(userId, couponCode);
      await loadCart(); // Recarregar carrinho para mostrar cupom aplicado
      dispatch({ type: 'SET_ERROR', payload: null });
      return true;
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
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
        error: state.error,
        isAuthenticated: isUserAuthenticated(),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
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
