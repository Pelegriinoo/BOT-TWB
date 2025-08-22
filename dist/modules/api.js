/**
 * BOT-TWB API Core - Sistema de comunicação com o servidor
 * @version 2.0.0
 * @author BOT-TWB
 */

window.TribalWarsAPI = class TribalWarsAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentVillage = this.getCurrentVillage();
        this.gameData = window.game_data || {};
    }

    /**
     * Obtém a vila atual da URL ou game_data
     */
    getCurrentVillage() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('village') || 
               (window.game_data?.village?.id) || 
               null;
    }

    /**
     * Verifica se o sistema está pronto para uso
     */
    isReady() {
        return !!(this.gameData && this.gameData.village && this.currentVillage);
    }

    /**
     * Realiza requisição GET para o jogo
     */
    async get(params = {}) {
        const defaultParams = {
            village: this.currentVillage,
            ...params
        };

        const url = this.buildUrl('game.php', defaultParams);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Erro na requisição GET: ${error.message}`);
        }
    }

    /**
     * Realiza requisição POST para o jogo
     */
    async post(params = {}, formData = new FormData()) {
        const defaultParams = {
            village: this.currentVillage,
            ...params
        };

        const url = this.buildUrl('game.php', defaultParams);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        } catch (error) {
            throw new Error(`Erro na requisição POST: ${error.message}`);
        }
    }

    /**
     * Constrói URL com parâmetros
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value.toString());
            }
        });

        return url.toString();
    }

    /**
     * Extrai dados de formulários hidden da página
     */
    extractHiddenInputs(html) {
        const hiddenData = {};
        const hiddenInputs = html.match(/<input[^>]*type="hidden"[^>]*>/g) || [];
        
        hiddenInputs.forEach(input => {
            const nameMatch = input.match(/name="([^"]+)"/);
            const valueMatch = input.match(/value="([^"]*)"/);
            
            if (nameMatch && valueMatch) {
                hiddenData[nameMatch[1]] = valueMatch[1];
            }
        });

        return hiddenData;
    }

    /**
     * Verifica se há erros na resposta HTML
     */
    checkForErrors(html) {
        if (html.includes('error_box')) {
            const errorMatch = html.match(/<div[^>]*class="error_box"[^>]*>(.*?)<\/div>/s);
            if (errorMatch) {
                const errorMsg = errorMatch[1]
                    .replace(/<[^>]*>/g, '')
                    .trim();
                throw new Error(errorMsg);
            }
            throw new Error('Erro desconhecido detectado na resposta');
        }
    }

    /**
     * Valida coordenadas
     */
    validateCoordinates(coords) {
        if (!coords || typeof coords !== 'string') {
            return { valid: false, reason: 'Coordenadas inválidas' };
        }

        const match = coords.match(/^(\d+)\|(\d+)$/);
        if (!match) {
            return { valid: false, reason: 'Formato inválido (use: X|Y)' };
        }

        const [, x, y] = match;
        const maxCoord = 1000; // Limite padrão do Tribal Wars

        if (x < 0 || x > maxCoord || y < 0 || y > maxCoord) {
            return { valid: false, reason: 'Coordenadas fora do mapa' };
        }

        return { valid: true, x: parseInt(x), y: parseInt(y) };
    }

    /**
     * Calcula distância entre coordenadas
     */
    calculateDistance(coords1, coords2) {
        const c1 = this.validateCoordinates(coords1);
        const c2 = this.validateCoordinates(coords2);

        if (!c1.valid || !c2.valid) {
            throw new Error('Coordenadas inválidas para cálculo de distância');
        }

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
};

console.log('🌐 TWB API Core carregada');
