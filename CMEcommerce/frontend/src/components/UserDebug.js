// UserDebug.js - Componente para debug das informações do usuário
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

const UserDebug = () => {
    const { isAuthenticated, user, isAdmin, isClient } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="container mt-3">
                <div className="alert alert-info">
                    <h5>Debug - Usuário não autenticado</h5>
                </div>
            </div>
        );
    }

    const userInfo = AuthService.getUserInfo();
    const token = AuthService.getIdToken();
    
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
        }
    }

    return (
        <div className="container mt-3">
            <div className="card">
                <div className="card-header">
                    <h5>🔍 Debug - Informações do Usuário</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6>AuthContext User:</h6>
                            <pre className="bg-light p-2 rounded">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                        <div className="col-md-6">
                            <h6>AuthService UserInfo:</h6>
                            <pre className="bg-light p-2 rounded">
                                {JSON.stringify(userInfo, null, 2)}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="row mt-3">
                        <div className="col-12">
                            <h6>Token Decodificado (Claims):</h6>
                            <pre className="bg-light p-2 rounded" style={{ fontSize: '12px' }}>
                                {JSON.stringify(decodedToken, null, 2)}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="row mt-3">
                        <div className="col-md-4">
                            <div className="alert alert-info">
                                <strong>isAdmin():</strong> {isAdmin() ? '✅ true' : '❌ false'}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="alert alert-info">
                                <strong>isClient():</strong> {isClient() ? '✅ true' : '❌ false'}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="alert alert-info">
                                <strong>isAuthenticated:</strong> {isAuthenticated ? '✅ true' : '❌ false'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDebug;
