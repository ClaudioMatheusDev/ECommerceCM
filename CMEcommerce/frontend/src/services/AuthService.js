// AuthService.js - Serviço para gerenciar autenticação com IdentityServer
class AuthService {
    constructor() {
        this.baseUrl = process.env.REACT_APP_IDENTITY_SERVER_URL || 'https://localhost:7000';
        this.clientId = 'cmshopping';
        this.redirectUri = `${window.location.origin}/callback`;
        this.scope = 'openid profile email roles cmshop product';
        this.responseType = 'code';
    }

    // Construir URL de login
    getLoginUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: this.responseType,
            scope: this.scope,
            state: this.generateState(),
            nonce: this.generateNonce()
        });

        return `${this.baseUrl}/connect/authorize?${params.toString()}`;
    }

    // Construir URL de logout
    getLogoutUrl() {
        const token = this.getIdToken();
        const params = new URLSearchParams({
            id_token_hint: token,
            post_logout_redirect_uri: window.location.origin
        });

        return `${this.baseUrl}/connect/endsession?${params.toString()}`;
    }

    // Redirecionar para login
    login() {
        window.location.href = this.getLoginUrl();
    }

    // Redirecionar para logout
    logout() {
        this.clearTokens();
        window.location.href = this.getLogoutUrl();
    }

    // Processar callback do IdentityServer
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
            throw new Error('Código de autorização não encontrado');
        }

        // Trocar código por tokens
        const tokens = await this.exchangeCodeForTokens(code);
        this.saveTokens(tokens);
        
        return tokens;
    }

    // Trocar código de autorização por tokens
    async exchangeCodeForTokens(code) {
        const tokenEndpoint = `${this.baseUrl}/connect/token`;
        
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: 'my_super_secret' // Em produção, use PKCE em vez de client_secret
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error('Erro ao obter tokens');
        }

        return await response.json();
    }

    // Salvar tokens no localStorage
    saveTokens(tokens) {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('expires_at', (Date.now() + tokens.expires_in * 1000).toString());
    }

    // Limpar tokens
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
    }

    // Obter access token
    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    // Obter id token
    getIdToken() {
        return localStorage.getItem('id_token');
    }

    // Verificar se está autenticado
    isAuthenticated() {
        const token = this.getAccessToken();
        const expiresAt = localStorage.getItem('expires_at');
        
        if (!token || !expiresAt) {
            return false;
        }

        return Date.now() < parseInt(expiresAt);
    }

    // Obter informações do usuário do token
    getUserInfo() {
        const token = this.getIdToken();
        if (!token) return null;

        try {
            // Decodificar JWT (apenas a parte do payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Extrair role - pode estar em diferentes formatos
            let role = null;
            if (payload.role) {
                role = Array.isArray(payload.role) ? payload.role : [payload.role];
            } else if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
                const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                role = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            }
            
            console.log('Token payload:', payload);
            console.log('Extracted role:', role);
            
            return {
                sub: payload.sub,
                name: payload.name,
                given_name: payload.given_name,
                family_name: payload.family_name,
                email: payload.email,
                preferred_username: payload.preferred_username,
                role: role || []
            };
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    // Verificar se é admin
    isAdmin() {
        const userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.role) return false;
        
        const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
        const hasAdminRole = roles.some(role => 
            role === 'Admin' || 
            role === 'admin' || 
            role.toLowerCase() === 'admin'
        );
        
        console.log('Checking isAdmin:', { roles, hasAdminRole });
        return hasAdminRole;
    }

    // Verificar se é cliente
    isClient() {
        const userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.role) return false;
        
        const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
        const hasClientRole = roles.some(role => 
            role === 'Client' || 
            role === 'client' || 
            role.toLowerCase() === 'client'
        );
        
        console.log('Checking isClient:', { roles, hasClientRole });
        return hasClientRole;
    }

    // Adicionar token às requisições
    getAuthHeaders() {
        const token = this.getAccessToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Gerar state aleatório
    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Gerar nonce aleatório
    generateNonce() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

export default new AuthService();
