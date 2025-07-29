// Navbar.js - Barra de navegação com autenticação
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, login, logout, isAdmin } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <a className="navbar-brand" href="/">
                    <i className="fas fa-store me-2"></i>
                    CM E-commerce
                </a>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="/">
                                <i className="fas fa-home me-1"></i>
                                Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/produtos">
                                <i className="fas fa-box me-1"></i>
                                Produtos
                            </a>
                        </li>
                        
                        {/* Links apenas para administradores */}
                        {isAuthenticated && isAdmin() && (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="/admin/produtos/criar">
                                        <i className="fas fa-plus me-1"></i>
                                        Criar Produto
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/admin/produtos">
                                        <i className="fas fa-cogs me-1"></i>
                                        Gerenciar Produtos
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>
                    
                    <ul className="navbar-nav">
                        {isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <a 
                                    className="nav-link dropdown-toggle" 
                                    href="#" 
                                    id="navbarDropdown" 
                                    role="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="fas fa-user me-1"></i>
                                    {user?.name || user?.email}
                                    {isAdmin() && <span className="badge bg-warning text-dark ms-2">Admin</span>}
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <span className="dropdown-item-text">
                                            <small className="text-muted">
                                                Logado como: {user?.role || 'Cliente'}
                                            </small>
                                        </span>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <a className="dropdown-item" href="/perfil">
                                            <i className="fas fa-user-edit me-2"></i>
                                            Meu Perfil
                                        </a>
                                    </li>
                                    {isAdmin() && (
                                        <li>
                                            <a className="dropdown-item" href="/admin">
                                                <i className="fas fa-shield-alt me-2"></i>
                                                Painel Admin
                                            </a>
                                        </li>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger" 
                                            onClick={logout}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Sair
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <button 
                                    className="btn btn-outline-light"
                                    onClick={login}
                                >
                                    <i className="fas fa-sign-in-alt me-1"></i>
                                    Entrar
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
