// ProtectedRoute.js - Componente para proteger rotas que precisam de autenticação
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, isAdmin, isClient, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Acesso Restrito</h4>
                    <p>Você precisa estar logado para acessar esta página.</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    // Verificar role específica se necessário
    if (requiredRole === 'Admin' && !isAdmin()) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Acesso Negado</h4>
                    <p>Você não tem permissão para acessar esta página. Apenas administradores podem acessar.</p>
                </div>
            </div>
        );
    }

    if (requiredRole === 'Client' && !isClient() && !isAdmin()) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Acesso Negado</h4>
                    <p>Você não tem permissão para acessar esta página.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
