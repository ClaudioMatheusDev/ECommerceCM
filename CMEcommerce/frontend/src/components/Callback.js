// Callback.js - Componente para processar retorno do IdentityServer
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Callback = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const processCallback = async () => {
            try {
                await AuthService.handleCallback();
                // Redirecionar para a página inicial após login bem-sucedido
                navigate('/');
            } catch (err) {
                console.error('Erro no callback:', err);
                setError('Erro ao processar login. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        processCallback();
    }, [navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3">Processando login...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Erro no Login</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default Callback;
