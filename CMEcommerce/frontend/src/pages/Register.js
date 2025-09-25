import React from 'react';
import AuthService from '../services/AuthService';
import '../styles/Register.css';

const Register = () => {
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getUserInfo();

    const handleRegister = () => {
        // Criar URL de registro que redireciona para a página de criação de conta do IdentityServer
        const registerUrl = AuthService.getRegisterUrl();
        window.location.href = registerUrl;
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
        <div className="container mt-5 register-page">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white">
                            <h4 className="text-center mb-0">
                                <i className="fas fa-user-plus me-2"></i>
                                Criar Nova Conta
                            </h4>
                        </div>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <p className="lead mb-4">
                                    Junte-se à nossa comunidade e aproveite todos os benefícios de ser um membro!
                                </p>
                                
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="benefit-item">
                                            <i className="fas fa-shopping-cart text-primary fa-2x mb-2"></i>
                                            <h6>Carrinho Personalizado</h6>
                                            <p className="small text-muted">Salve seus produtos favoritos</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="benefit-item">
                                            <i className="fas fa-history text-primary fa-2x mb-2"></i>
                                            <h6>Histórico de Pedidos</h6>
                                            <p className="small text-muted">Acompanhe suas compras</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="benefit-item">
                                            <i className="fas fa-star text-primary fa-2x mb-2"></i>
                                            <h6>Ofertas Exclusivas</h6>
                                            <p className="small text-muted">Promoções especiais para membros</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    className="btn btn-primary btn-lg px-5"
                                    onClick={handleRegister}
                                >
                                    <i className="fas fa-user-plus me-2"></i>
                                    Criar Minha Conta
                                </button>
                            </div>
                            
                            <hr className="my-4" />
                            
                            <div className="text-center">
                                <h6 className="mb-3">O que você pode fazer após criar sua conta:</h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <ul className="list-unstyled text-start">
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success me-2"></i>
                                                <strong>Clientes:</strong> Navegar pela loja
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success me-2"></i>
                                                <strong>Clientes:</strong> Adicionar ao carrinho
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success me-2"></i>
                                                <strong>Clientes:</strong> Finalizar pedidos
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="list-unstyled text-start">
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success me-2"></i>
                                                <strong>Clientes:</strong> Ver histórico de compras
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-crown text-warning me-2"></i>
                                                <strong>Admins:</strong> Gerenciar produtos
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-crown text-warning me-2"></i>
                                                <strong>Admins:</strong> Dashboard completo
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info mt-4">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Importante:</strong> Você será redirecionado para nossa página segura de registro. 
                                Após criar sua conta, faça login para acessar todas as funcionalidades.
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Já tem uma conta? 
                                    <a href="/login" className="text-decoration-none ms-1">
                                        <strong>Fazer Login</strong>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;