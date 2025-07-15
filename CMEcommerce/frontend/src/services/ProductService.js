import axios from 'axios';
import { API_URL } from '../config/api';

const API_BASE = `${API_URL}/product`;

export async function findAllProduct() {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar produtos');
  }
}

export async function findProductById(id) {
  try {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Produto não encontrado');
  }
}

export async function createProduct(model) {
  try {
    const response = await axios.post(API_BASE, model);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao criar produto');
  }
}

export async function updateProduct(model) {
  try {
    const response = await axios.put(`${API_BASE}/${model.id}`, model);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar produto');
  }
}

export async function deleteProductById(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar produto');
  }
}