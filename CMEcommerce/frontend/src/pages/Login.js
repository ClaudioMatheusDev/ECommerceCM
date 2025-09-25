// Login.js - Página de login
import React from 'react';
import AuthService from '../services/AuthService';

const Login = () => {
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getUserInfo();

    const handleLogin = () => {
        AuthService.login();
    };

    if (isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Você já está logado</h5>
                                <p className="card-text">
                                    Bem-vindo, <strong>{user?.name || user?.preferred_username || user?.email}</strong>!
                                </p>
                                <p className="text-muted">
                                    Role: {Array.isArray(user?.role) ? user.role.join(', ') : (user?.role || 'N/A')}
                                </p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => window.location.href = '/'}
                                >
                                    Ir para Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="text-center">Login</h4>
                        </div>
                        <div className="card-body">
                            <div className="text-center">
                                <p className="mb-4">
                                    Faça login para acessar recursos exclusivos da nossa loja.
                                </p>
                                
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={handleLogin}
                                >
                                    Entrar com IdentityServer
                                </button>
                            </div>
                            
                            <hr className="my-4" />
                            
                            <div className="text-center">
                                <h6>Funcionalidades disponíveis após login:</h6>
                                <ul className="list-unstyled mt-3">
                                    <li>✅ <strong>Clientes:</strong> Visualizar produtos</li>
                                    <li>🔒 <strong>Administradores:</strong> Criar, editar e deletar produtos</li>
                                </ul>

                                <div className="mt-4">
                                    <p className="text-muted">
                                        Ainda não tem uma conta? 
                                        <a href="/register" className="text-decoration-none ms-1">
                                            <strong>Criar conta agora</strong>
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
