// Login.js - Página de login
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Você já está logado</h5>
                                <p className="card-text">
                                    Bem-vindo, <strong>{user?.name || user?.email}</strong>!
                                </p>
                                <p className="text-muted">
                                    Role: {user?.role || 'N/A'}
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
                                    onClick={login}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
