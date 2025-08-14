import axios from 'axios';
import { getToken } from './AuthService';

const API_GATEWAY = process.env.REACT_APP_API_GATEWAY || 'https://localhost:7101';
const COUPON_API_BASE = `${API_GATEWAY}/gateway/coupon`;

// Função para criar headers autenticados
function createAuthenticatedRequest() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Função para verificar se está autenticado
function requireAuth() {
  const token = getToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado. Faça login novamente.");
  }
}

/**
 * Valida um cupom de desconto
 * @param {string} couponCode - Código do cupom
 * @returns {Promise} Promise com os dados do cupom
 */
export async function validateCoupon(couponCode) {
  try {
    requireAuth();
    
    if (!couponCode || !couponCode.trim()) {
      throw new Error("Código do cupom é obrigatório");
    }
    
    console.log(`Validando cupom: ${couponCode}`);
    
    const response = await axios.get(`${COUPON_API_BASE}/${couponCode.trim()}`, {
      headers: createAuthenticatedRequest()
    });
    
    console.log('Cupom validado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    
    if (error.response?.status === 404) {
      throw new Error("Cupom não encontrado");
    }
    
    if (error.response?.status >= 500) {
      throw new Error("Erro no servidor. Tente novamente mais tarde.");
    }
    
    throw new Error(error.response?.data?.message || error.message || "Erro ao validar cupom");
  }
}

/**
 * Lista todos os cupons disponíveis (admin)
 * @returns {Promise} Promise com a lista de cupons
 */
export async function getAllCoupons() {
  try {
    requireAuth();
    
    console.log('Buscando todos os cupons...');
    
    const response = await axios.get(`${COUPON_API_BASE}`, {
      headers: createAuthenticatedRequest()
    });
    
    console.log('Cupons carregados:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    
    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    
    if (error.response?.status === 403) {
      throw new Error("Acesso negado. Você não tem permissão para esta operação.");
    }
    
    throw new Error(error.response?.data?.message || "Erro ao buscar cupons");
  }
}

export default {
  validateCoupon,
  getAllCoupons
};
