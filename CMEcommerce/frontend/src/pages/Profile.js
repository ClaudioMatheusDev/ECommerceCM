import React from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/AuthService';
import '../styles/Profile.css';

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    if (!isAuthenticated) {
        return (
            <div className="container mt-5 profile-page">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Acesso Restrito</h5>
                                <p className="card-text">Você precisa fazer login para ver seu perfil.</p>
                                <a href="/login" className="btn btn-primary">Fazer Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 profile-page">
            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h4><i className="fas fa-user"></i> Meu Perfil</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 text-center">
                                    <div className="mb-3">
                                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                                             style={{width: '100px', height: '100px', fontSize: '40px'}}>
                                            {authService.isAdmin() ? '👑' : '👤'}
                                        </div>
                                        <h5 className="mt-2">{user?.name || 'Usuário'}</h5>
                                        <span className={`badge ${authService.isAdmin() ? 'bg-warning' : 'bg-info'} text-dark`}>
                                            {authService.isAdmin() ? 'Administrador' : 'Cliente'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="col-md-9">
                                    <h5>Informações Pessoais</h5>
                                    <div className="row mb-3">
                                        <div className="col-sm-4"><strong>Nome Completo:</strong></div>
                                        <div className="col-sm-8">{user?.name || 'Não informado'}</div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-sm-4"><strong>Email:</strong></div>
                                        <div className="col-sm-8">{user?.email || 'Não informado'}</div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-sm-4"><strong>Nome de Usuário:</strong></div>
                                        <div className="col-sm-8">{user?.preferred_username || 'Não informado'}</div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-sm-4"><strong>Tipo de Conta:</strong></div>
                                        <div className="col-sm-8">
                                            {authService.isAdmin() ? (
                                                <span className="text-warning"><strong>Administrador</strong> - Acesso total ao sistema</span>
                                            ) : (
                                                <span className="text-info"><strong>Cliente</strong> - Acesso para compras</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr />
                            
                            <h5>Permissões da Conta</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Visualizar Produtos
                                            <span className="badge bg-success rounded-pill">✓</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Fazer Compras
                                            <span className="badge bg-success rounded-pill">✓</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Gerenciar Carrinho
                                            <span className="badge bg-success rounded-pill">✓</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Criar Produtos
                                            <span className={`badge ${authService.isAdmin() ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                                                {authService.isAdmin() ? '✓' : '✗'}
                                            </span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Editar Produtos
                                            <span className={`badge ${authService.isAdmin() ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                                                {authService.isAdmin() ? '✓' : '✗'}
                                            </span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Deletar Produtos
                                            <span className={`badge ${authService.isAdmin() ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                                                {authService.isAdmin() ? '✓' : '✗'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h5><i className="fas fa-cog"></i> Ações da Conta</h5>
                        </div>
                        <div className="card-body">
                            <div className="acoes-botoes">
                                {authService.isAdmin() && (
                                    <>
                                        <a href="/admin" className="btn btn-danger btn-sm">
                                            <i className="fas fa-tools"></i> Painel Admin
                                        </a>

                                        <a href="/produto" className="btn btn=danger btn-sm">
                                        <i className="fas fa-tools">Painel de Produtos</i>
                                        </a>
                                        <hr />
                                    </>
                                )}
                                <a href="/loja" className="btn btn-danger btn-sm">
                                    <i className="fas fa-shopping-bag"></i> Ver Loja
                                </a>
                                <a href="/carrinho" className="btn btn-success btn-sm">
                                    <i className="fas fa-shopping-cart"></i> Meu Carrinho
                                </a>
                                <a href="/pedidos" className="btn btn-success btn-sm">
                                    <i className="fas fa-box"></i> Meus Pedidos
                                </a>
                                <hr />
                                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card mt-3">
                        <div className="card-header">
                            <h6><i className="fas fa-info-circle"></i> Status da Sessão</h6>
                        </div>
                        <div className="card-body">
                            <div className="small">
                                <p><strong>Autenticado:</strong> <span className="text-success">✓ Sim</span></p>
                                <p><strong>Última Atividade:</strong> Agora</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
