/**
 * BOT-TWB Authentication Manager - Gerenciamento de tokens CSRF
 * @version 2.0.0
 * @author BOT-TWB
 */

window.AuthManager = class AuthManager {
    constructor(api) {
        this.api = api;
        this.tokenCache = new Map();
        this.tokenExpiration = 30 * 60 * 1000; // 30 minutos em ms
    }

    /**
     * Obtém token CSRF para uma vila específica
     */
    async getCSRFToken(villageId = null) {
        const village = villageId || this.api.currentVillage;
        const cacheKey = `token_${village}`;

        // Verificar cache
        const cachedToken = this.getCachedToken(cacheKey);
        if (cachedToken) {
            return cachedToken;
        }

        // Tentar obter da página atual
        let token = this.extractTokenFromCurrentPage();
        if (token) {
            this.setCachedToken(cacheKey, token);
            return token;
        }

        // Buscar token fazendo requisição
        token = await this.fetchTokenFromServer(village);
        if (token) {
            this.setCachedToken(cacheKey, token);
            return token;
        }

        throw new Error('Não foi possível obter token CSRF');
    }

    /**
     * Extrai token da página atual
     */
    extractTokenFromCurrentPage() {
        // Método 1: Input hidden
        const hiddenInput = document.querySelector('input[name="h"]');
        if (hiddenInput?.value) {
            return hiddenInput.value;
        }

        // Método 2: URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('h');
        if (urlToken) {
            return urlToken;
        }

        // Método 3: HTML content scan
        const pageHTML = document.documentElement.innerHTML;
        
        // Buscar em URLs
        let match = pageHTML.match(/[&?]h=([a-f0-9]+)/);
        if (match) return match[1];

        // Buscar em JavaScript objects
        match = pageHTML.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
        if (match) return match[1];

        // Buscar em data attributes
        match = pageHTML.match(/data-h=['"]([^'"]+)['"]/);
        if (match) return match[1];

        return null;
    }

    /**
     * Busca token fazendo requisição ao servidor
     */
    async fetchTokenFromServer(villageId) {
        try {
            // Tentar diferentes páginas que sempre têm token
            const pages = ['place', 'overview', 'main'];
            
            for (const screen of pages) {
                try {
                    const html = await this.api.get({
                        village: villageId,
                        screen
                    });

                    const token = this.extractTokenFromHTML(html);
                    if (token) {
                        return token;
                    }
                } catch (error) {
                    console.warn(`Erro ao buscar token na tela ${screen}:`, error.message);
                }
            }

            return null;
        } catch (error) {
            console.error('Erro ao buscar token do servidor:', error);
            return null;
        }
    }

    /**
     * Extrai token de HTML
     */
    extractTokenFromHTML(html) {
        // Método 1: Input hidden name="h"
        let match = html.match(/name="h"\s+value="([^"]+)"/);
        if (match) return match[1];

        // Método 2: Input hidden value primeiro
        match = html.match(/value="([^"]+)"\s+name="h"/);
        if (match) return match[1];

        // Método 3: Links com parâmetro h
        match = html.match(/[&?]h=([a-f0-9]+)/);
        if (match) return match[1];

        // Método 4: JavaScript objects
        match = html.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
        if (match) return match[1];

        // Método 5: Form action
        match = html.match(/action="[^"]*[&?]h=([a-f0-9]+)/);
        if (match) return match[1];

        return null;
    }

    /**
     * Obtém token do cache se ainda válido
     */
    getCachedToken(cacheKey) {
        const cached = this.tokenCache.get(cacheKey);
        
        if (!cached) {
            return null;
        }

        const now = Date.now();
        if (now > cached.expires) {
            this.tokenCache.delete(cacheKey);
            return null;
        }

        return cached.token;
    }

    /**
     * Armazena token no cache
     */
    setCachedToken(cacheKey, token) {
        const expires = Date.now() + this.tokenExpiration;
        this.tokenCache.set(cacheKey, {
            token,
            expires,
            created: Date.now()
        });
    }

    /**
     * Limpa cache de tokens
     */
    clearTokenCache() {
        this.tokenCache.clear();
    }

    /**
     * Valida se um token tem formato válido
     */
    validateTokenFormat(token) {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Token CSRF do Tribal Wars geralmente é hexadecimal
        return /^[a-f0-9]+$/i.test(token) && token.length >= 8;
    }

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated() {
        return !!(
            window.game_data && 
            window.game_data.player && 
            window.game_data.village
        );
    }
};

console.log('🔐 TWB Auth Manager carregada');
