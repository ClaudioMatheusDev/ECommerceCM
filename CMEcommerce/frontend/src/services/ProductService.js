import axios from "axios";
import { API_URL } from "../config/api";
import AuthService from "./AuthService";

// Usando o API Gateway - as rotas agora são /gateway/product e /gateway/products
const API_BASE = `${API_URL}/product`;
const API_PRODUCTS = `${API_URL}/products`;

if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

// Criar interceptor para adicionar token automaticamente nas requisições que precisam
const createAuthenticatedRequest = () => {
  const headers = {
    "Content-Type": "application/json",
    ...AuthService.getAuthHeaders()
  };
  return headers;
};

export async function findAllProduct() {
  try {
    const response = await axios.get(API_PRODUCTS);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error(error.response?.data?.message || "Erro ao buscar produtos");
  }
}

export async function findProductById(id) {
  try {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Produto não encontrado");
  }
}

export async function createProduct(model) {
  try {
    const response = await axios.post(API_BASE, model, {
      headers: createAuthenticatedRequest()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Você precisa estar logado como administrador para criar produtos");
    }
    if (error.response?.status === 403) {
      throw new Error("Apenas administradores podem criar produtos");
    }
    throw new Error(error.response?.data?.message || "Erro ao criar produto");
  }
}

export async function updateProduct(model) {
  try {
    const response = await axios.put(`${API_BASE}/${model.id}`, model, {
      headers: createAuthenticatedRequest(),
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Você precisa estar logado como administrador para atualizar produtos");
    }
    if (error.response?.status === 403) {
      throw new Error("Apenas administradores podem atualizar produtos");
    }
    if (error.response?.status === 405) {
      try {
        console.log("PUT não suportado, tentando POST...");
        const response = await axios.post(
          `${API_BASE}/update/${model.id}`,
          model,
          {
            headers: createAuthenticatedRequest(),
          }
        );
        return response.data;
      } catch (postError) {
        throw new Error("Método PUT não suportado e POST também falhou");
      }
    }

    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.title ||
        `Erro HTTP ${error.response.status}: ${error.response.statusText}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Erro de conexão com o servidor");
    } else {
      throw new Error(
        error.message || "Erro desconhecido ao atualizar produto"
      );
    }
  }
}

export async function deleteProductById(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`, {
      headers: createAuthenticatedRequest()
    });
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Você precisa estar logado como administrador para deletar produtos");
    }
    if (error.response?.status === 403) {
      throw new Error("Apenas administradores podem deletar produtos");
    }
    throw new Error(error.response?.data?.message || "Erro ao deletar produto");
  }
}
