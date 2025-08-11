import axios from "axios";
import { API_URL } from "../config/api";
import AuthService from "./AuthService";

// Usando o API Gateway - as rotas agora são /cart
const API_BASE = `${API_URL}/cart`;

if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

// Criar interceptor para adicionar token automaticamente nas requisições
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
    
    // Estruturar dados conforme esperado pelo backend
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
            imageUrl: cartData.productImage
          }
        }
      ]
    };

    const response = await axios.post(API_BASE, cartPayload, {
      headers: createAuthenticatedRequest()
    });
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
