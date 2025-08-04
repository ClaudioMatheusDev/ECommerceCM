// AuthContext.js - Context para gerenciar estado de autenticação
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            const authenticated = AuthService.isAuthenticated();
            setIsAuthenticated(authenticated);
            
            if (authenticated) {
                const userInfo = AuthService.getUserInfo();
                setUser(userInfo);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Erro ao verificar status de autenticação:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        AuthService.login();
    };

    const logout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    const isAdmin = () => {
        return user && AuthService.isAdmin();
    };

    const isClient = () => {
        return user && AuthService.isClient();
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        isAdmin,
        isClient,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
