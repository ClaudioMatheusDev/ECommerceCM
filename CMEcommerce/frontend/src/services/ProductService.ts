import { Product } from '../models/ProductModel';
import { API_URL } from '../config/api';

const API_BASE = `${API_URL}/products`;

export async function findAllProduct(): Promise<Product[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erro ao buscar produtos');
  return await response.json();
}

export async function findProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Produto não encontrado');
  return await response.json();
}

export async function createProduct(model: Product): Promise<Product> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model)
  });
  if (!response.ok) throw new Error('Erro ao criar produto');
  return await response.json();
}

export async function updateProduct(model: Product): Promise<Product> {
  const response = await fetch(`${API_URL}/${model.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model)
  });
  if (!response.ok) throw new Error('Erro ao atualizar produto');
  return await response.json();
}

export async function deleteProductById(id: number): Promise<boolean> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erro ao deletar produto');
  return true;
}