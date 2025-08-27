// Configuração da API - usando API Gateway por padrão
export const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7101/gateway';
export const IDENTITY_SERVER_URL = process.env.REACT_APP_IDENTITY_SERVER_URL || 'https://localhost:7000';

// URLs diretas dos microserviços (para desenvolvimento/debug)
export const DIRECT_APIS = {
  PRODUCT_API: 'https://localhost:7199/api',
  CART_API: 'https://localhost:7201/api',
  IDENTITY_SERVER: 'https://localhost:7000',
  API_GATEWAY: 'https://localhost:7101'
};

// Configuração de timeout
export const API_TIMEOUT = 10000;

// Modo de desenvolvimento: usar API Gateway (true) ou acesso direto (false)
export const USE_API_GATEWAY = true;
