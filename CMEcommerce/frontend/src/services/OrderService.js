import axios from "axios";
import { API_URL } from "../config/api";
import AuthService from "./AuthService";

// Usando o API Gateway - as rotas são mapeadas para o OrderAPI
const API_BASE = `${API_URL}/orders`;

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
    throw new Error("Usuário não autenticado. Faça login para acessar os pedidos.");
  }
};

/**
 * Busca todos os pedidos do usuário atual
 */
export async function getUserOrders() {
  try {
    requireAuth();
    
    const userId = AuthService.getUserInfo()?.sub;
    if (!userId) {
      throw new Error("ID do usuário não encontrado");
    }
    
    const response = await axios.get(`${API_BASE}/user/${userId}`, {
      headers: createAuthenticatedRequest()
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao buscar pedidos");
  }
}

/**
 * Busca um pedido específico pelo ID
 */
export async function getOrderById(orderId) {
  try {
    requireAuth();
    
    const response = await axios.get(`${API_BASE}/${orderId}`, {
      headers: createAuthenticatedRequest()
    });
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar pedido #${orderId}:`, error);
    if (error.response?.status === 404) {
      throw new Error("Pedido não encontrado");
    }
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(error.response?.data?.message || "Erro ao buscar pedido");
  }
}

/**
 * Busca todos os pedidos (somente admin)
 */
export async function getAllOrders() {
  try {
    requireAuth();
    
    if (!AuthService.isAdmin()) {
      throw new Error("Acesso negado. Apenas administradores podem ver todos os pedidos.");
    }
    
    const response = await axios.get(API_BASE, {
      headers: createAuthenticatedRequest()
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    if (error.response?.status === 403) {
      throw new Error("Acesso negado. Apenas administradores podem ver todos os pedidos.");
    }
    throw new Error(error.response?.data?.message || "Erro ao buscar pedidos");
  }
}

/**
 * Formata a data para o formato brasileiro
 */
export function formatOrderDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Formata o valor monetário para o formato brasileiro
 */
export function formatOrderPrice(price) {
  if (price === undefined || price === null) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

/**
 * Traduz o status de pagamento para português
 */
export function getPaymentStatusText(status) {
  if (status === true || status === 'true' || status === 'Approved') {
    return "Aprovado";
  } else if (status === false || status === 'false' || status === 'Rejected') {
    return "Recusado";
  } else {
    return "Pendente";
  }
}

/**
 * Retorna a classe CSS para o status de pagamento
 */
export function getPaymentStatusClass(status) {
  if (status === true || status === 'true' || status === 'Approved') {
    return "status-approved";
  } else if (status === false || status === 'false' || status === 'Rejected') {
    return "status-rejected";
  } else {
    return "status-pending";
  }
}

export default {
  getUserOrders,
  getOrderById,
  getAllOrders,
  formatOrderDate,
  formatOrderPrice,
  getPaymentStatusText,
  getPaymentStatusClass
};