// Configuração da API - agora usando API Gateway
export const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7101/gateway';

// URLs diretas dos microserviços (para desenvolvimento/debug)
export const DIRECT_APIS = {
  PRODUCT_API: 'https://localhost:7199/api',
  IDENTITY_SERVER: 'https://localhost:7000',
  API_GATEWAY: 'https://localhost:7101'
};

// Configuração de timeout
export const API_TIMEOUT = 10000;