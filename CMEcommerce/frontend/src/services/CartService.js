import axios from "axios";
import { API_URL } from "../config/api";
import AuthService from "./AuthService";

// Usando o API Gateway - as rotas agora são /cart (mapeado para /carts no backend)
const API_BASE = `${API_URL}/cart`;

if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

const createAuthenticatedRequest = () => {
  const headers = {
    "Content-Type": "application/json",
    ...AuthService.getAuthHeaders()
  };
  return headers;
};

// Verificar se usuário está autenticado
const requireAuth = () => {
  if (!AuthService.isAuthenticated()) {
    throw new Error("Usuário não autenticado. Faça login para acessar o carrinho.");
  }
};

export async function findCartByUserId(userId) {
  try {
    requireAuth();
    const response = await axios.get(`${API_BASE}/${userId}`, {
      headers: createAuthenticatedRequest()
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao buscar carrinho do usuário");
  }
}

export async function getAllCarts() {
  try {
    requireAuth();
    if (!AuthService.isAdmin()) {
      throw new Error("Acesso negado. Apenas administradores podem ver todos os carrinhos.");
    }
    
    const response = await axios.get(API_BASE, {
      headers: createAuthenticatedRequest()
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar todos os carrinhos:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    if (error.response?.status === 403) {
      throw new Error("Acesso negado. Apenas administradores podem ver todos os carrinhos.");
    }
    throw new Error(error.response?.data?.message || "Erro ao buscar carrinhos");
  }
}

export async function addToCart(cartData) {
  try {
    requireAuth();
    
    const cartPayload = {
      cartHeader: {
        userId: cartData.userId,
        couponCode: cartData.couponCode || null
      },
      cartDetails: [
        {
          productId: cartData.productId,
          count: cartData.quantity || 1,
          product: {
            id: cartData.productId,
            name: cartData.productName,
            price: cartData.productPrice,
            description: cartData.productDescription || "",
            categoryName: cartData.categoryName || "Produto",
            imageURL: cartData.productImage
          }
        }
      ]
    };

    console.log('CartService - Enviando dados:', JSON.stringify(cartPayload, null, 2));

    const response = await axios.post(API_BASE, cartPayload, {
      headers: createAuthenticatedRequest()
    });
    
    console.log('CartService - Resposta recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao adicionar item ao carrinho");
  }
}

export async function updateCart(cartData) {
  try {
    requireAuth();
    
    const response = await axios.put(API_BASE, cartData, {
      headers: createAuthenticatedRequest()
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao atualizar carrinho");
  }
}

export async function removeFromCart(cartDetailId) {
  try {
    requireAuth();
    
    await axios.delete(`${API_BASE}/${cartDetailId}`, {
      headers: createAuthenticatedRequest()
    });
    return true;
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao remover item do carrinho");
  }
}

export async function clearCart(userId) {
  try {
    requireAuth();
    
    await axios.delete(`${API_BASE}/clear/${userId}`, {
      headers: createAuthenticatedRequest()
    });
    return true;
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao limpar carrinho");
  }
}

export async function applyCoupon(userId, couponCode) {
  try {
    requireAuth();
    
    const payload = {
      userId: userId,
      couponCode: couponCode
    };
    
    await axios.post(`${API_BASE}/apply-coupon`, payload, {
      headers: createAuthenticatedRequest()
    });
    return true;
  } catch (error) {
    console.error('Erro ao aplicar cupom:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao aplicar cupom");
  }
}

export async function removeCoupon(userId) {
  try {
    requireAuth();
    
    await axios.delete(`${API_BASE}/remove-coupon/${userId}`, {
      headers: createAuthenticatedRequest()
    });
    return true;
  } catch (error) {
    console.error('Erro ao remover cupom:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao remover cupom");
  }
}

export async function checkout(checkoutData) {
  try {
    requireAuth();

    console.log('Enviando request para:', `${API_BASE}/checkout`);
    console.log('Headers:', createAuthenticatedRequest());
    console.log('Dados enviados:', checkoutData);

    const response = await axios.post(`${API_BASE}/checkout`, checkoutData, {
      headers: createAuthenticatedRequest()
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao realizar checkout:', error);
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Response headers:', error.response?.headers);
    
    // Log detalhado dos erros de validação
    if (error.response?.data?.errors) {
      console.error('🔍 ERROS DE VALIDAÇÃO DETALHADOS:');
      console.error(JSON.stringify(error.response.data.errors, null, 2));
    }
    
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    
    // Capturar detalhes mais específicos do erro
    let errorMessage = "Erro ao realizar checkout";
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
      } else if (error.response.data.errors) {
        // Mostrar os erros de validação
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorMessage = `Erros de validação: ${validationErrors}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}
