import axios from "axios";
import { API_URL } from "../config/api";

// Usando o API Gateway - as rotas agora são /gateway/cart
const API_BASE = `${API_URL}/cart`;
const API_CARTS = `${API_URL}/carts`;

if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

export async function findCartByUserId(userId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao buscar carrinho do usuário");
  }
}

export async function getAllCarts() {
  try {
    const response = await axios.get(API_CARTS);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar todos os carrinhos:', error);
    throw new Error(error.response?.data?.message || "Erro ao buscar carrinhos");
  }
}

export async function addToCart(cartItem) {
  try {
    const response = await axios.post(API_BASE, cartItem, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao adicionar item ao carrinho");
  }
}

export async function updateCartItem(id, cartItem) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, cartItem, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao atualizar item do carrinho");
  }
}

export async function removeFromCart(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao remover item do carrinho");
  }
}

export async function clearCart(userId) {
  try {
    await axios.delete(`${API_BASE}/user/${userId}/clear`);
    return true;
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao limpar carrinho");
  }
}

export async function getCartTotal(userId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${userId}/total`);
    return response.data;
  } catch (error) {
    console.error('Erro ao calcular total do carrinho:', error);
    throw new Error(error.response?.data?.message || "Erro ao calcular total do carrinho");
  }
}
