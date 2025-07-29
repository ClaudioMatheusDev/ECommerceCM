// Configuração da API baseada nas variáveis de ambiente
// Temporário: acessando diretamente o ProductAPI (sem Gateway) para desenvolvimento
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5155/api/v1';
export const IDENTITY_SERVER_URL = process.env.REACT_APP_IDENTITY_SERVER_URL || 'https://localhost:7000';