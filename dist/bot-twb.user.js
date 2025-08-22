// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.0
// @description  Sistema modular completo para Tribal Wars - Bot automatizado
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.plemiona.pl/game.php*
// @match        https://*.tribals.it/game.php*
// @match        https://*.guerretribali.it/game.php*
// @match        https://*.vojnaplemen.si/game.php*
// @grant        none
// @updateURL    https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb.user.js
// @downloadURL  https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb.user.js
// @supportURL   https://github.com/Pelegriinoo/BOT-TWB/issues
// @homepageURL  https://github.com/Pelegriinoo/BOT-TWB
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🏰 BOT-TWB v2.0.0 - Iniciado');

// === config/constants.js ===
/**
 * Tribal Wars Game Constants - Constantes e configurações do jogo
 * @version 2.0.0
 * @author BOT-TWB
 */

// Configuração das tropas
window.TROOP_CONFIG  = {
    spear: {
        name: 'Lanceiro',
        nameEn: 'Spear fighter',
        type: 'infantry',
        attack: 10,
        defGeneral: 15,
        defCavalry: 45,
        defArcher: 20,
        carry: 25,
        speed: 18,
        pop: 1,
        cost: { wood: 50, clay: 30, iron: 10 }
    },
    sword: {
        name: 'Espadachim',
        nameEn: 'Swordsman',
        type: 'infantry',
        attack: 25,
        defGeneral: 50,
        defCavalry: 15,
        defArcher: 40,
        carry: 15,
        speed: 22,
        pop: 1,
        cost: { wood: 30, clay: 30, iron: 70 }
    },
    axe: {
        name: 'Bárbaro',
        nameEn: 'Axeman',
        type: 'infantry',
        attack: 40,
        defGeneral: 10,
        defCavalry: 5,
        defArcher: 10,
        carry: 10,
        speed: 18,
        pop: 1,
        cost: { wood: 60, clay: 30, iron: 40 }
    },
    archer: {
        name: 'Arqueiro',
        nameEn: 'Archer',
        type: 'archer',
        attack: 15,
        defGeneral: 50,
        defCavalry: 40,
        defArcher: 5,
        carry: 10,
        speed: 18,
        pop: 1,
        cost: { wood: 100, clay: 30, iron: 60 }
    },
    spy: {
        name: 'Explorador',
        nameEn: 'Scout',
        type: 'scout',
        attack: 0,
        defGeneral: 2,
        defCavalry: 1,
        defArcher: 2,
        carry: 0,
        speed: 9,
        pop: 2,
        cost: { wood: 50, clay: 50, iron: 20 }
    },
    light: {
        name: 'Cavalaria Leve',
        nameEn: 'Light cavalry',
        type: 'cavalry',
        attack: 130,
        defGeneral: 30,
        defCavalry: 40,
        defArcher: 30,
        carry: 80,
        speed: 10,
        pop: 4,
        cost: { wood: 125, clay: 100, iron: 250 }
    },
    marcher: {
        name: 'Arqueiro a Cavalo',
        nameEn: 'Mounted archer',
        type: 'archer',
        attack: 120,
        defGeneral: 40,
        defCavalry: 30,
        defArcher: 50,
        carry: 50,
        speed: 5,
        pop: 5,
        cost: { wood: 250, clay: 100, iron: 150 }
    },
    heavy: {
        name: 'Cavalaria Pesada',
        nameEn: 'Heavy cavalry',
        type: 'cavalry',
        attack: 150,
        defGeneral: 200,
        defCavalry: 80,
        defArcher: 180,
        carry: 50,
        speed: 11,
        pop: 6,
        cost: { wood: 200, clay: 150, iron: 600 }
    },
    ram: {
        name: 'Aríete',
        nameEn: 'Ram',
        type: 'siege',
        attack: 2,
        defGeneral: 20,
        defCavalry: 50,
        defArcher: 20,
        carry: 0,
        speed: 30,
        pop: 5,
        cost: { wood: 300, clay: 200, iron: 200 }
    },
    catapult: {
        name: 'Catapulta',
        nameEn: 'Catapult',
        type: 'siege',
        attack: 100,
        defGeneral: 100,
        defCavalry: 50,
        defArcher: 100,
        carry: 0,
        speed: 30,
        pop: 8,
        cost: { wood: 320, clay: 400, iron: 100 }
    },
    knight: {
        name: 'Paladino',
        nameEn: 'Paladin',
        type: 'special',
        attack: 150,
        defGeneral: 250,
        defCavalry: 400,
        defArcher: 150,
        carry: 100,
        speed: 10,
        pop: 10,
        cost: { wood: 0, clay: 0, iron: 0 }
    },
    snob: {
        name: 'Nobre',
        nameEn: 'Nobleman',
        type: 'special',
        attack: 30,
        defGeneral: 100,
        defCavalry: 50,
        defArcher: 100,
        carry: 0,
        speed: 35,
        pop: 100,
        cost: { wood: 40000, clay: 50000, iron: 50000 }
    }
};

// Velocidades das tropas (minutos por campo)
window.TROOP_SPEEDS  = {
    spy: 9,
    marcher: 5,
    light: 10,
    knight: 10,
    heavy: 11,
    spear: 18,
    sword: 22,
    axe: 18,
    archer: 18,
    ram: 30,
    catapult: 30,
    snob: 35
};

// Tipos de tropas agrupados
window.TROOP_TYPES  = {
    offensive: ['axe', 'light', 'marcher', 'ram', 'catapult'],
    defensive: ['spear', 'sword', 'archer', 'heavy'],
    cavalry: ['light', 'marcher', 'heavy', 'knight'],
    infantry: ['spear', 'sword', 'axe', 'archer'],
    siege: ['ram', 'catapult'],
    special: ['knight', 'snob'],
    scout: ['spy']
};

// Configuração de idiomas
window.LOCALES  = {
    'pt_BR': {
        name: 'Português (Brasil)',
        domain: '.com.br',
        troopNames: {
            spear: 'Lanceiro',
            sword: 'Espadachim',
            axe: 'Bárbaro',
            archer: 'Arqueiro',
            spy: 'Explorador',
            light: 'Cavalaria Leve',
            marcher: 'Arqueiro a Cavalo',
            heavy: 'Cavalaria Pesada',
            ram: 'Aríete',
            catapult: 'Catapulta',
            knight: 'Paladino',
            snob: 'Nobre'
        }
    },
    'en_DK': {
        name: 'English',
        domain: '.net',
        troopNames: {
            spear: 'Spear fighter',
            sword: 'Swordsman',
            axe: 'Axeman',
            archer: 'Archer',
            spy: 'Scout',
            light: 'Light cavalry',
            marcher: 'Mounted archer',
            heavy: 'Heavy cavalry',
            ram: 'Ram',
            catapult: 'Catapult',
            knight: 'Paladin',
            snob: 'Nobleman'
        }
    },
    'de_DE': {
        name: 'Deutsch',
        domain: '.de',
        troopNames: {
            spear: 'Speerträger',
            sword: 'Schwertkämpfer',
            axe: 'Axtträger',
            archer: 'Bogenschütze',
            spy: 'Späher',
            light: 'Leichte Kavallerie',
            marcher: 'Berittener Bogenschütze',
            heavy: 'Schwere Kavallerie',
            ram: 'Rammbock',
            catapult: 'Katapult',
            knight: 'Paladin',
            snob: 'Adelsgeschlecht'
        }
    }
};

// Tipos de ataque
window.ATTACK_TYPES  = {
    attack: {
        name: 'Ataque',
        nameEn: 'Attack',
        param: 'attack',
        color: '#ff4444'
    },
    support: {
        name: 'Apoio',
        nameEn: 'Support',
        param: 'support',
        color: '#44ff44'
    },
    scout: {
        name: 'Espionagem',
        nameEn: 'Scout',
        param: 'attack',
        color: '#4444ff'
    }
};

// Configuração de telas do jogo
window.GAME_SCREENS  = {
    overview: 'Visão Geral',
    place: 'Praça de Reunião',
    overview_villages: 'Visão Geral das Aldeias',
    main: 'Quartel General',
    barracks: 'Quartel',
    stable: 'Estábulo',
    garage: 'Oficina',
    smith: 'Ferreiro',
    snob: 'Academia',
    market: 'Mercado',
    farm: 'Fazenda',
    storage: 'Armazém',
    wall: 'Muralha',
    church: 'Igreja',
    report: 'Relatórios',
    mail: 'Mensagens',
    memo: 'Bloco de Notas',
    ranking: 'Ranking',
    settings: 'Configurações'
};

// Limites do mapa (podem variar por mundo)
window.MAP_LIMITS  = {
    default: {
        minX: 0,
        maxX: 999,
        minY: 0,
        maxY: 999
    },
    speed: {
        minX: 0,
        maxX: 499,
        minY: 0,
        maxY: 499
    }
};

// Configuração de recursos
window.RESOURCES  = {
    wood: {
        name: 'Madeira',
        nameEn: 'Wood',
        color: '#8B4513'
    },
    clay: {
        name: 'Argila',
        nameEn: 'Clay',
        color: '#CD853F'
    },
    iron: {
        name: 'Ferro',
        nameEn: 'Iron',
        color: '#708090'
    }
};

// Configuração de edifícios
window.BUILDINGS  = {
    main: { name: 'Quartel General', maxLevel: 30 },
    barracks: { name: 'Quartel', maxLevel: 25 },
    stable: { name: 'Estábulo', maxLevel: 20 },
    garage: { name: 'Oficina', maxLevel: 15 },
    church: { name: 'Igreja', maxLevel: 3 },
    snob: { name: 'Academia', maxLevel: 1 },
    smith: { name: 'Ferreiro', maxLevel: 20 },
    place: { name: 'Praça de Reunião', maxLevel: 1 },
    statue: { name: 'Estátua', maxLevel: 1 },
    market: { name: 'Mercado', maxLevel: 25 },
    wood: { name: 'Bosque', maxLevel: 30 },
    stone: { name: 'Poço de Argila', maxLevel: 30 },
    iron: { name: 'Mina de Ferro', maxLevel: 30 },
    farm: { name: 'Fazenda', maxLevel: 30 },
    storage: { name: 'Armazém', maxLevel: 30 },
    hide: { name: 'Esconderijo', maxLevel: 10 },
    wall: { name: 'Muralha', maxLevel: 20 }
};

// Status codes comuns
window.STATUS_CODES  = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    LOADING: 'loading',
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Configuração de cache
window.CACHE_CONFIG  = {
    TOKEN_EXPIRATION: 30 * 60 * 1000, // 30 minutos
    TROOPS_EXPIRATION: 2 * 60 * 1000,  // 2 minutos
    VILLAGE_EXPIRATION: 5 * 60 * 1000, // 5 minutos
    REPORTS_EXPIRATION: 1 * 60 * 1000  // 1 minuto
};

// Regex patterns úteis
window.PATTERNS  = {
    COORDINATES: /^(\d{1,3})\|(\d{1,3})$/,
    VILLAGE_ID: /^\d+$/,
    TOKEN: /^[a-f0-9]+$/i,
    TIME_FORMAT: /^(\d{1,2}):(\d{2}):(\d{2})$/,
    NUMBER: /^\d+$/
};

// URLs úteis
window.URLS  = {
    HELP: 'https://help.tribalwars.net/',
    FORUM: 'https://forum.tribalwars.net/',
    WIKI: 'https://wiki.tribalwars.net/'
};

// Versão da API
window.API_VERSION  = '2.0.0';

// Configuração padrão do sistema
window.DEFAULT_CONFIG  = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    enableCache: true,
    enableLogging: false,
    theme: 'dark',
    language: 'auto'
};


// === core/api.js ===
/**
 * Tribal Wars API Core - Sistema de comunicação com o servidor
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
     * Obtém informações básicas da vila atual
     */
    async getVillageInfo(villageId = null) {
        const village = villageId || this.currentVillage;
        
        try {
            const html = await this.get({
                village,
                screen: 'overview'
            });

            // Extrair coordenadas da vila
            const coordsMatch = html.match(/\((\d+)\|(\d+)\)/);
            const coords = coordsMatch ? `${coordsMatch[1]}|${coordsMatch[2]}` : null;

            // Extrair nome da vila
            const nameMatch = html.match(/<span[^>]*class="[^"]*village[^"]*"[^>]*>([^<]+)<\/span>/i);
            const name = nameMatch ? nameMatch[1].trim() : null;

            return {
                id: village,
                name,
                coords,
                raw: html
            };
        } catch (error) {
            throw new Error(`Erro ao obter informações da vila: ${error.message}`);
        }
    }

    /**
     * Obtém lista de aldeias do jogador
     */
    async getVillageList() {
        try {
            const html = await this.get({
                screen: 'overview_villages'
            });

            const villages = [];
            const villageRows = html.match(/<tr[^>]*class="[^"]*village[^"]*"[^>]*>.*?<\/tr>/gs) || [];

            villageRows.forEach(row => {
                const idMatch = row.match(/village=(\d+)/);
                const nameMatch = row.match(/>([^<]+)<\/a>/);
                const coordsMatch = row.match(/\((\d+\|\d+)\)/);

                if (idMatch && nameMatch && coordsMatch) {
                    villages.push({
                        id: idMatch[1],
                        name: nameMatch[1].trim(),
                        coords: coordsMatch[1]
                    });
                }
            });

            return villages;
        } catch (error) {
            throw new Error(`Erro ao obter lista de aldeias: ${error.message}`);
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
}


// === core/auth.js ===
/**
 * Tribal Wars Authentication Manager - Gerenciamento de tokens CSRF
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
     * Força renovação de token
     */
    async refreshToken(villageId = null) {
        const village = villageId || this.api.currentVillage;
        const cacheKey = `token_${village}`;
        
        // Limpar cache
        this.tokenCache.delete(cacheKey);
        
        // Buscar novo token
        return await this.getCSRFToken(village);
    }

    /**
     * Obtém informações do cache
     */
    getCacheInfo() {
        const info = [];
        
        this.tokenCache.forEach((value, key) => {
            const timeLeft = Math.max(0, value.expires - Date.now());
            info.push({
                key,
                token: value.token.substring(0, 8) + '...',
                created: new Date(value.created).toLocaleTimeString(),
                expires: new Date(value.expires).toLocaleTimeString(),
                timeLeft: Math.round(timeLeft / 1000) + 's'
            });
        });

        return info;
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

    /**
     * Obtém informações do jogador
     */
    getPlayerInfo() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            id: window.game_data.player.id,
            name: window.game_data.player.name,
            sitter: window.game_data.player.sitter,
            villageId: window.game_data.village.id,
            villageName: window.game_data.village.name,
            locale: window.game_data.locale,
            world: window.game_data.world
        };
    }
}


// === core/troops.js ===
/**
 * Tribal Wars Troops Manager - Gerenciamento e cálculos de tropas
 * @version 2.0.0
 * @author BOT-TWB
 */

window.TroopsManager = class TroopsManager {
    constructor(api) {
        this.api = api;
        this.troopsCache = new Map();
        this.cacheExpiration = 2 * 60 * 1000; // 2 minutos
    }

    /**
     * Obtém tropas disponíveis em uma vila
     */
    async getAvailableTroops(villageId = null) {
        const village = villageId || this.api.currentVillage;
        const cacheKey = `troops_${village}`;

        // Verificar cache
        const cached = this.getCachedTroops(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const html = await this.api.get({
                village,
                screen: 'place'
            });

            const troops = this.extractTroopsFromHTML(html);
            this.setCachedTroops(cacheKey, troops);

            return troops;
        } catch (error) {
            throw new Error(`Erro ao obter tropas: ${error.message}`);
        }
    }

    /**
     * Extrai tropas do HTML da página
     */
    extractTroopsFromHTML(html) {
        const troops = {};
        const unitTypes = Object.keys(TROOP_CONFIG);

        // Inicializar todas as tropas com 0
        unitTypes.forEach(unit => {
            troops[unit] = 0;
        });

        // Método 1: Buscar por max attribute
        unitTypes.forEach(unit => {
            const regex = new RegExp(`name="${unit}"[^>]*max="(\\d+)"`, 'i');
            const match = html.match(regex);
            if (match) {
                troops[unit] = parseInt(match[1]);
                return;
            }

            // Método 2: Buscar por ID específico
            const idRegex = new RegExp(`id="unit_input_${unit}"[^>]*max="(\\d+)"`, 'i');
            const idMatch = html.match(idRegex);
            if (idMatch) {
                troops[unit] = parseInt(idMatch[1]);
                return;
            }

            // Método 3: Buscar texto após input (número entre parênteses)
            const textRegex = new RegExp(`name="${unit}"[^>]*>[^\\(]*\\((\\d+)\\)`, 'i');
            const textMatch = html.match(textRegex);
            if (textMatch) {
                troops[unit] = parseInt(textMatch[1]);
            }
        });

        return troops;
    }

    /**
     * Valida dados de tropas para ataque
     */
    validateTroopData(troops, availableTroops = null) {
        if (!troops || typeof troops !== 'object') {
            return { valid: false, reason: 'Dados de tropas inválidos' };
        }

        const errors = [];
        let hasValidTroops = false;

        Object.entries(troops).forEach(([unit, count]) => {
            // Verificar se unidade existe
            if (!TROOP_CONFIG[unit]) {
                errors.push(`Unidade desconhecida: ${unit}`);
                return;
            }

            // Verificar se quantidade é válida
            if (!Number.isInteger(count) || count < 0) {
                errors.push(`Quantidade inválida para ${unit}: ${count}`);
                return;
            }

            // Verificar disponibilidade se fornecida
            if (availableTroops && count > (availableTroops[unit] || 0)) {
                errors.push(`${unit}: solicitado ${count}, disponível ${availableTroops[unit] || 0}`);
                return;
            }

            if (count > 0) {
                hasValidTroops = true;
            }
        });

        if (!hasValidTroops) {
            errors.push('Nenhuma tropa selecionada');
        }

        return {
            valid: errors.length === 0,
            errors,
            reason: errors.join('; ')
        };
    }

    /**
     * Calcula tempo de viagem baseado na tropa mais lenta
     */
    calculateTravelTime(sourceCoords, targetCoords, troops) {
        const distance = this.api.calculateDistance(sourceCoords, targetCoords);
        
        // Encontrar a tropa mais lenta
        let slowestSpeed = 0;
        let slowestUnit = null;

        Object.entries(troops).forEach(([unit, count]) => {
            if (count > 0 && TROOP_SPEEDS[unit]) {
                const speed = TROOP_SPEEDS[unit];
                if (speed > slowestSpeed) {
                    slowestSpeed = speed;
                    slowestUnit = unit;
                }
            }
        });

        if (!slowestSpeed) {
            throw new Error('Nenhuma tropa válida para calcular tempo');
        }

        // Calcular tempo em minutos
        const travelMinutes = Math.round(distance * slowestSpeed);
        const arrivalTime = new Date(Date.now() + travelMinutes * 60 * 1000);

        return {
            distance: Math.round(distance * 100) / 100,
            travelMinutes,
            slowestUnit,
            slowestSpeed,
            arrivalTime,
            formattedTime: this.formatDuration(travelMinutes)
        };
    }

    /**
     * Formata duração em formato HH:MM:SS
     */
    formatDuration(minutes) {
        const totalSeconds = minutes * 60;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Calcula força ofensiva das tropas
     */
    calculateOffensivePower(troops) {
        let totalAttack = 0;
        let totalCarry = 0;
        let totalPop = 0;

        Object.entries(troops).forEach(([unit, count]) => {
            if (count > 0 && TROOP_CONFIG[unit]) {
                const config = TROOP_CONFIG[unit];
                totalAttack += count * (config.attack || 0);
                totalCarry += count * (config.carry || 0);
                totalPop += count * (config.pop || 0);
            }
        });

        return {
            attack: totalAttack,
            carry: totalCarry,
            population: totalPop
        };
    }

    /**
     * Calcula força defensiva das tropas
     */
    calculateDefensivePower(troops) {
        let generalDefense = 0;
        let cavalryDefense = 0;
        let archerDefense = 0;

        Object.entries(troops).forEach(([unit, count]) => {
            if (count > 0 && TROOP_CONFIG[unit]) {
                const config = TROOP_CONFIG[unit];
                generalDefense += count * (config.defGeneral || 0);
                cavalryDefense += count * (config.defCavalry || 0);
                archerDefense += count * (config.defArcher || 0);
            }
        });

        return {
            general: generalDefense,
            cavalry: cavalryDefense,
            archer: archerDefense
        };
    }

    /**
     * Obtém total de tropas
     */
    getTotalTroops(troops) {
        return Object.values(troops).reduce((sum, count) => sum + count, 0);
    }

    /**
     * Filtra tropas por tipo
     */
    filterTroopsByType(troops, type) {
        const filtered = {};
        
        Object.entries(troops).forEach(([unit, count]) => {
            if (TROOP_CONFIG[unit]?.type === type) {
                filtered[unit] = count;
            }
        });

        return filtered;
    }

    /**
     * Cria preset de tropas
     */
    createTroopPreset(name, troops, description = '') {
        const validation = this.validateTroopData(troops);
        if (!validation.valid) {
            throw new Error(`Preset inválido: ${validation.reason}`);
        }

        return {
            name,
            description,
            troops: { ...troops },
            created: new Date().toISOString(),
            totalTroops: this.getTotalTroops(troops),
            offensivePower: this.calculateOffensivePower(troops),
            defensivePower: this.calculateDefensivePower(troops)
        };
    }

    /**
     * Cache management
     */
    getCachedTroops(cacheKey) {
        const cached = this.troopsCache.get(cacheKey);
        
        if (!cached) {
            return null;
        }

        if (Date.now() > cached.expires) {
            this.troopsCache.delete(cacheKey);
            return null;
        }

        return cached.troops;
    }

    setCachedTroops(cacheKey, troops) {
        this.troopsCache.set(cacheKey, {
            troops,
            expires: Date.now() + this.cacheExpiration,
            created: Date.now()
        });
    }

    clearTroopsCache() {
        this.troopsCache.clear();
    }

    /**
     * Força atualização das tropas
     */
    async refreshTroops(villageId = null) {
        const village = villageId || this.api.currentVillage;
        const cacheKey = `troops_${village}`;
        
        this.troopsCache.delete(cacheKey);
        return await this.getAvailableTroops(village);
    }
}


// === core/utils.js ===
// Utilitários gerais

// ...implementação futura...



// === modules/attack-system.js ===
/**
 * Tribal Wars Attack System - Sistema completo de envio de ataques
 * @version 2.0.0
 * @author BOT-TWB
 */

window.AttackSystem = class AttackSystem {
    constructor(api, authManager, troopsManager) {
        this.api = api;
        this.auth = authManager;
        this.troops = troopsManager;
        this.attackHistory = [];
        this.isProcessing = false;
    }

    /**
     * Prepara ataque (primeiro passo)
     */
    async prepareAttack(attackData) {
        const { sourceVillage, targetCoords, troops, attackType = 'attack' } = attackData;

        // Validações
        const validation = this.validateAttackData(attackData);
        if (!validation.valid) {
            throw new Error(`Dados inválidos: ${validation.reason}`);
        }

        // Obter token CSRF
        const token = await this.auth.getCSRFToken(sourceVillage);
        if (!token) {
            throw new Error('Não foi possível obter token de autenticação');
        }

        // Preparar coordenadas
        const [x, y] = targetCoords.split('|');

        // Criar FormData
        const formData = new FormData();
        formData.append('x', x);
        formData.append('y', y);
        formData.append('target_type', 'coord');
        formData.append('h', token);

        // Adicionar tropas
        Object.entries(troops).forEach(([unit, count]) => {
            if (count > 0) {
                formData.append(unit, count.toString());
            }
        });

        // Adicionar tipo de ataque
        const attackConfig = ATTACK_TYPES[attackType];
        if (attackConfig) {
            formData.append(attackConfig.param, this.getAttackButtonText(attackType));
        }

        // Determinar URL baseada no tipo
        const screenParam = attackType === 'support' ? 'mode=support' : '';
        const baseParams = {
            village: sourceVillage,
            screen: 'place'
        };

        if (screenParam) {
            baseParams.mode = 'support';
        }

        // Enviar para página de confirmação
        const confirmUrl = this.api.buildUrl('game.php', {
            ...baseParams,
            try: 'confirm'
        });

        try {
            const response = await fetch(confirmUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Verificar erros na resposta
            this.api.checkForErrors(html);

            // Extrair dados de confirmação
            const confirmData = this.api.extractHiddenInputs(html);

            // Extrair informações adicionais
            const attackInfo = this.extractAttackInfo(html);

            return {
                confirmData,
                token,
                html,
                attackInfo,
                status: STATUS_CODES.SUCCESS
            };

        } catch (error) {
            throw new Error(`Erro na preparação: ${error.message}`);
        }
    }

    /**
     * Confirma e envia ataque (segundo passo)
     */
    async confirmAttack(sourceVillage, confirmData, token) {
        const formData = new FormData();
        formData.append('h', token);

        // Adicionar dados de confirmação
        Object.entries(confirmData).forEach(([key, value]) => {
            if (key !== 'h') {
                formData.append(key, value);
            }
        });

        const finalUrl = this.api.buildUrl('game.php', {
            village: sourceVillage,
            screen: 'place',
            action: 'command',
            h: token
        });

        try {
            const response = await fetch(finalUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Verificar sucesso
            const success = this.checkAttackSuccess(html);
            if (!success.isSuccess) {
                throw new Error(success.reason || 'Falha na confirmação do ataque');
            }

            // Extrair informações do resultado
            const resultInfo = this.extractResultInfo(html);

            return {
                success: true,
                ...resultInfo,
                status: STATUS_CODES.COMPLETED
            };

        } catch (error) {
            throw new Error(`Erro na confirmação: ${error.message}`);
        }
    }

    /**
     * Envia ataque completo (combina preparação + confirmação)
     */
    async sendAttack(attackData) {
        if (this.isProcessing) {
            throw new Error('Outro ataque está sendo processado');
        }

        this.isProcessing = true;

        try {
            // Log do início do ataque
            this.logAttack(attackData, STATUS_CODES.LOADING);

            // Verificar tropas disponíveis
            const availableTroops = await this.troops.getAvailableTroops(attackData.sourceVillage);
            const validation = this.troops.validateTroopData(attackData.troops, availableTroops);
            
            if (!validation.valid) {
                throw new Error(`Tropas insuficientes: ${validation.reason}`);
            }

            // Preparar ataque
            const prepareResult = await this.prepareAttack(attackData);

            // Confirmar ataque
            const confirmResult = await this.confirmAttack(
                attackData.sourceVillage,
                prepareResult.confirmData,
                prepareResult.token
            );

            // Criar resultado final
            const result = {
                success: true,
                message: `Ataque enviado para ${attackData.targetCoords}`,
                target: attackData.targetCoords,
                attackType: attackData.attackType,
                duration: confirmResult.duration,
                arrivalTime: confirmResult.arrivalTime,
                troops: attackData.troops,
                attackInfo: prepareResult.attackInfo,
                timestamp: new Date().toISOString()
            };

            // Log do sucesso
            this.logAttack({ ...attackData, result }, STATUS_CODES.SUCCESS);

            return result;

        } catch (error) {
            // Log do erro
            this.logAttack({ ...attackData, error: error.message }, STATUS_CODES.ERROR);

            return {
                success: false,
                error: error.message,
                target: attackData.targetCoords,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Envia múltiplos ataques em sequência
     */
    async sendMultipleAttacks(attacksList, options = {}) {
        const { delay = 1000, stopOnError = false } = options;
        const results = [];

        for (let i = 0; i < attacksList.length; i++) {
            const attackData = attacksList[i];

            try {
                const result = await this.sendAttack(attackData);
                results.push(result);

                if (!result.success && stopOnError) {
                    break;
                }

                // Delay entre ataques
                if (i < attacksList.length - 1 && delay > 0) {
                    await this.sleep(delay);
                }

            } catch (error) {
                const errorResult = {
                    success: false,
                    error: error.message,
                    target: attackData.targetCoords,
                    index: i
                };
                results.push(errorResult);

                if (stopOnError) {
                    break;
                }
            }
        }

        return {
            total: attacksList.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    /**
     * Valida dados do ataque
     */
    validateAttackData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, reason: 'Dados de ataque inválidos' };
        }

        // Verificar vila origem
        if (!data.sourceVillage) {
            return { valid: false, reason: 'Vila de origem não especificada' };
        }

        // Verificar coordenadas de destino
        const coordsValidation = this.api.validateCoordinates(data.targetCoords);
        if (!coordsValidation.valid) {
            return coordsValidation;
        }

        // Verificar tropas
        if (!data.troops || typeof data.troops !== 'object') {
            return { valid: false, reason: 'Tropas não especificadas' };
        }

        const troopsValidation = this.troops.validateTroopData(data.troops);
        if (!troopsValidation.valid) {
            return troopsValidation;
        }

        // Verificar tipo de ataque
        if (data.attackType && !ATTACK_TYPES[data.attackType]) {
            return { valid: false, reason: 'Tipo de ataque inválido' };
        }

        return { valid: true };
    }

    /**
     * Extrai informações do ataque da página de confirmação
     */
    extractAttackInfo(html) {
        const info = {};

        // Extrair tempo de viagem
        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        if (durationMatch) {
            info.duration = `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}`;
            
            // Calcular hora de chegada
            const [hours, minutes, seconds] = durationMatch.slice(1).map(Number);
            const durationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            info.arrivalTime = new Date(Date.now() + durationMs);
        }

        // Extrair informações do alvo
        const targetMatch = html.match(/(\d+\|\d+)/);
        if (targetMatch) {
            info.targetCoords = targetMatch[1];
        }

        // Extrair nome da vila alvo se disponível
        const villageNameMatch = html.match(/<span[^>]*>([^<]+)<\/span>[^<]*\(\d+\|\d+\)/);
        if (villageNameMatch) {
            info.targetVillageName = villageNameMatch[1].trim();
        }

        return info;
    }

    /**
     * Extrai informações do resultado do ataque
     */
    extractResultInfo(html) {
        const info = {};

        // Extrair tempo de viagem do resultado
        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        if (durationMatch) {
            info.duration = `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}`;
        }

        // Extrair ID do comando se disponível
        const commandMatch = html.match(/command=(\d+)/);
        if (commandMatch) {
            info.commandId = commandMatch[1];
        }

        return info;
    }

    /**
     * Verifica se o ataque foi enviado com sucesso
     */
    checkAttackSuccess(html) {
        // Indicadores de sucesso
        const successIndicators = [
            'command_sent',
            'enviado',
            'sent',
            'gesendet',
            'wysłano'
        ];

        const isSuccess = successIndicators.some(indicator => 
            html.toLowerCase().includes(indicator)
        );

        if (isSuccess) {
            return { isSuccess: true };
        }

        // Verificar erros específicos
        if (html.includes('error_box')) {
            const errorMatch = html.match(/<div[^>]*class="error_box"[^>]*>(.*?)<\/div>/s);
            if (errorMatch) {
                const reason = errorMatch[1].replace(/<[^>]*>/g, '').trim();
                return { isSuccess: false, reason };
            }
        }

        return { isSuccess: false, reason: 'Falha na confirmação' };
    }

    /**
     * Obtém texto do botão de ataque baseado no tipo
     */
    getAttackButtonText(attackType) {
        const locale = this.api.gameData.locale || 'pt_BR';
        
        const buttonTexts = {
            'pt_BR': {
                attack: 'Atacar',
                support: 'Apoiar'
            },
            'en_DK': {
                attack: 'Attack',
                support: 'Support'
            },
            'de_DE': {
                attack: 'Angriff',
                support: 'Unterstützung'
            }
        };

        return buttonTexts[locale]?.[attackType] || buttonTexts['pt_BR'][attackType] || 'Atacar';
    }

    /**
     * Log de ataques
     */
    logAttack(attackData, status) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            status,
            sourceVillage: attackData.sourceVillage,
            targetCoords: attackData.targetCoords,
            attackType: attackData.attackType || 'attack',
            troops: attackData.troops,
            error: attackData.error,
            result: attackData.result
        };

        this.attackHistory.push(logEntry);

        // Manter apenas os últimos 100 logs
        if (this.attackHistory.length > 100) {
            this.attackHistory = this.attackHistory.slice(-100);
        }

        // Log no console se habilitado
        if (window.TWB_DEBUG) {
            console.log('Attack Log:', logEntry);
        }
    }

    /**
     * Obtém histórico de ataques
     */
    getAttackHistory() {
        return [...this.attackHistory];
    }

    /**
     * Limpa histórico de ataques
     */
    clearHistory() {
        this.attackHistory = [];
    }

    /**
     * Utility: Sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtém estatísticas dos ataques
     */
    getAttackStats() {
        const total = this.attackHistory.length;
        const successful = this.attackHistory.filter(log => log.status === STATUS_CODES.SUCCESS).length;
        const failed = this.attackHistory.filter(log => log.status === STATUS_CODES.ERROR).length;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? Math.round((successful / total) * 100) : 0
        };
    }
}


// === modules/troop-counter.js ===
// Contador de tropas

// ...implementação futura...



// === modules/village-manager.js ===
// Gerenciador de aldeias

// ...implementação futura...



// === interface/components.js ===
// Componentes reutilizáveis

// ...implementação futura...



// === interface/main.js ===
/**
 * Tribal Wars Bot Interface - Interface principal do sistema
 * @version 2.0.0
 * @author BOT-TWB
 */

window.TWBInterface = class TWBInterface {
    constructor(api, authManager, troopsManager, attackSystem) {
        this.api = api;
        this.auth = authManager;
        this.troops = troopsManager;
        this.attack = attackSystem;
        this.ui = new UIComponents();
        
        this.isVisible = false;
        this.currentTroops = {};
        this.selectedTroops = {};
        this.container = null;
        
        this.init();
    }

    /**
     * Inicializa a interface
     */
    async init() {
        if (!this.api.isReady()) {
            console.warn('TWB: Sistema não está pronto');
            return;
        }

        // Aguardar carregamento da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createInterface());
        } else {
            setTimeout(() => this.createInterface(), 1000);
        }
    }

    /**
     * Cria a interface principal
     */
    createInterface() {
        // Verificar se interface já existe
        if (document.getElementById('twb-interface')) {
            return;
        }

        // Criar estilos CSS
        this.injectStyles();

        // Criar container principal
        this.container = this.createMainContainer();
        document.body.appendChild(this.container);

        // Configurar event listeners
        this.setupEventListeners();

        // Auto-detectar tropas
        this.detectTroops();

        console.log('TWB: Interface criada com sucesso');
    }

    /**
     * Cria o container principal
     */
    createMainContainer() {
        const container = document.createElement('div');
        container.id = 'twb-interface';
        container.className = 'twb-container';
        
        container.innerHTML = `
            <div class="twb-header">
                <h3>🏰 TWB - Sistema de Ataques</h3>
                <button class="twb-close-btn" id="twb-close">×</button>
            </div>
            
            <div class="twb-content">
                <!-- Seção de Alvo -->
                <div class="twb-section">
                    <div class="twb-section-header">🎯 Alvo</div>
                    <div class="twb-form-row">
                        <input type="text" 
                               id="twb-target-coords" 
                               placeholder="500|500" 
                               class="twb-input">
                        <select id="twb-attack-type" class="twb-select">
                            <option value="attack">⚔️ Ataque</option>
                            <option value="support">🛡️ Apoio</option>
                        </select>
                    </div>
                </div>

                <!-- Seção de Tropas -->
                <div class="twb-section">
                    <div class="twb-section-header">
                        ⚔️ Tropas
                        <div class="twb-troop-actions">
                            <button class="twb-btn twb-btn-small" id="twb-detect-troops">🔍 Detectar</button>
                            <span id="twb-detect-status" class="twb-status-text"></span>
                        </div>
                    </div>
                    
                    <div class="twb-troop-presets">
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectAll()">Todas</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectNone()">Nenhuma</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectOffensive()">Ofensivas</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectDefensive()">Defensivas</button>
                    </div>
                    
                    <div class="twb-troop-grid" id="twb-troop-grid">
                        <!-- Tropas serão inseridas aqui -->
                    </div>
                </div>

                <!-- Seção de Informações -->
                <div class="twb-section">
                    <div class="twb-section-header">📊 Informações</div>
                    <div id="twb-attack-info" class="twb-info-grid">
                        <div class="twb-info-item">
                            <span class="twb-info-label">Distância:</span>
                            <span id="twb-info-distance">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">Tempo:</span>
                            <span id="twb-info-time">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">Chegada:</span>
                            <span id="twb-info-arrival">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">População:</span>
                            <span id="twb-info-population">-</span>
                        </div>
                    </div>
                </div>

                <!-- Seção de Ação -->
                <div class="twb-section">
                    <button class="twb-btn twb-btn-primary" id="twb-send-attack" disabled>
                        🚀 Enviar Ataque
                    </button>
                    <div class="twb-status" id="twb-status"></div>
                </div>
            </div>
        `;

        return container;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão fechar
        document.getElementById('twb-close').addEventListener('click', () => {
            this.toggleVisibility();
        });

        // Detectar tropas
        document.getElementById('twb-detect-troops').addEventListener('click', () => {
            this.detectTroops();
        });

        // Enviar ataque
        document.getElementById('twb-send-attack').addEventListener('click', () => {
            this.sendAttack();
        });

        // Coordenadas - calcular info ao digitar
        const coordsInput = document.getElementById('twb-target-coords');
        coordsInput.addEventListener('input', () => {
            this.updateAttackInfo();
        });

        // Tipo de ataque
        document.getElementById('twb-attack-type').addEventListener('change', () => {
            this.updateAttackInfo();
        });

        // Tecla de atalho para mostrar/ocultar (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                this.toggleVisibility();
            }
        });
    }

    /**
     * Detecta tropas disponíveis
     */
    async detectTroops() {
        const statusEl = document.getElementById('twb-detect-status');
        const detectBtn = document.getElementById('twb-detect-troops');
        
        try {
            statusEl.textContent = 'Detectando...';
            statusEl.className = 'twb-status-text twb-loading';
            detectBtn.disabled = true;

            this.currentTroops = await this.troops.getAvailableTroops();
            
            const totalTroops = this.troops.getTotalTroops(this.currentTroops);
            
            if (totalTroops === 0) {
                throw new Error('Nenhuma tropa encontrada');
            }

            this.renderTroopGrid();
            this.updateAttackInfo();
            
            statusEl.textContent = `✓ ${totalTroops} tropas`;
            statusEl.className = 'twb-status-text twb-success';
            
            document.getElementById('twb-send-attack').disabled = false;

        } catch (error) {
            statusEl.textContent = `✗ ${error.message}`;
            statusEl.className = 'twb-status-text twb-error';
            console.error('Erro na detecção de tropas:', error);
        } finally {
            detectBtn.disabled = false;
        }
    }

    /**
     * Renderiza o grid de tropas
     */
    renderTroopGrid() {
        const grid = document.getElementById('twb-troop-grid');
        grid.innerHTML = '';

        Object.entries(TROOP_CONFIG).forEach(([unit, config]) => {
            const available = this.currentTroops[unit] || 0;
            
            const troopItem = document.createElement('div');
            troopItem.className = 'twb-troop-item';
            
            troopItem.innerHTML = `
                <div class="twb-troop-icon">
                    <img src="/graphic/unit/unit_${unit}.png" 
                         alt="${config.name}" 
                         title="${config.name}"
                         onerror="this.style.display='none'">
                </div>
                <div class="twb-troop-info">
                    <label class="twb-troop-label">${config.name}</label>
                    <div class="twb-troop-controls">
                        <input type="number" 
                               id="twb-troop-${unit}" 
                               class="twb-troop-input"
                               min="0" 
                               max="${available}" 
                               value="0"
                               data-unit="${unit}">
                        <span class="twb-troop-available">(${available})</span>
                    </div>
                </div>
            `;

            // Event listener para atualizar informações
            const input = troopItem.querySelector('input');
            input.addEventListener('input', () => {
                this.updateSelectedTroops();
                this.updateAttackInfo();
            });

            grid.appendChild(troopItem);
        });
    }

    /**
     * Atualiza tropas selecionadas
     */
    updateSelectedTroops() {
        this.selectedTroops = {};
        
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) {
                const value = parseInt(input.value) || 0;
                if (value > 0) {
                    this.selectedTroops[unit] = value;
                }
            }
        });
    }

    /**
     * Atualiza informações do ataque
     */
    updateAttackInfo() {
        const coords = document.getElementById('twb-target-coords').value.trim();
        
        if (!coords.match(/^\d+\|\d+$/)) {
            this.clearAttackInfo();
            return;
        }

        this.updateSelectedTroops();
        
        if (Object.keys(this.selectedTroops).length === 0) {
            this.clearAttackInfo();
            return;
        }

        try {
            // Obter coordenadas da vila atual
            const currentVillageCoords = this.getCurrentVillageCoords();
            
            if (!currentVillageCoords) {
                this.clearAttackInfo();
                return;
            }

            // Calcular informações
            const travelInfo = this.troops.calculateTravelTime(
                currentVillageCoords, 
                coords, 
                this.selectedTroops
            );

            const power = this.troops.calculateOffensivePower(this.selectedTroops);
            const totalTroops = this.troops.getTotalTroops(this.selectedTroops);

            // Atualizar UI
            document.getElementById('twb-info-distance').textContent = 
                `${travelInfo.distance} campos`;
            document.getElementById('twb-info-time').textContent = 
                travelInfo.formattedTime;
            document.getElementById('twb-info-arrival').textContent = 
                travelInfo.arrivalTime.toLocaleTimeString();
            document.getElementById('twb-info-population').textContent = 
                `${totalTroops} (${power.population} pop)`;

        } catch (error) {
            console.warn('Erro ao calcular informações:', error);
            this.clearAttackInfo();
        }
    }

    /**
     * Limpa informações do ataque
     */
    clearAttackInfo() {
        ['distance', 'time', 'arrival', 'population'].forEach(field => {
            document.getElementById(`twb-info-${field}`).textContent = '-';
        });
    }

    /**
     * Obtém coordenadas da vila atual
     */
    getCurrentVillageCoords() {
        // Tentar obter das game_data
        if (window.game_data?.village?.coord) {
            return window.game_data.village.coord;
        }

        // Tentar obter da URL da página
        const coordsMatch = document.documentElement.innerHTML.match(/\((\d+\|\d+)\)/);
        return coordsMatch ? coordsMatch[1] : null;
    }

    /**
     * Envia o ataque
     */
    async sendAttack() {
        const targetCoords = document.getElementById('twb-target-coords').value.trim();
        const attackType = document.getElementById('twb-attack-type').value;
        
        // Validações
        if (!targetCoords.match(/^\d+\|\d+$/)) {
            this.showStatus('Coordenadas inválidas', STATUS_CODES.ERROR);
            return;
        }

        this.updateSelectedTroops();
        
        if (Object.keys(this.selectedTroops).length === 0) {
            this.showStatus('Selecione tropas', STATUS_CODES.ERROR);
            return;
        }

        const attackData = {
            sourceVillage: this.api.currentVillage,
            targetCoords,
            troops: this.selectedTroops,
            attackType
        };

        // Desabilitar botão
        const sendBtn = document.getElementById('twb-send-attack');
        sendBtn.disabled = true;
        
        this.showStatus('Enviando ataque...', STATUS_CODES.LOADING);

        try {
            const result = await this.attack.sendAttack(attackData);

            if (result.success) {
                this.showStatus(
                    `✓ Ataque enviado para ${result.target}`, 
                    STATUS_CODES.SUCCESS
                );
                
                // Limpar seleção e redetectar tropas
                this.clearTroopSelection();
                setTimeout(() => this.detectTroops(), 1000);
                
            } else {
                this.showStatus(`✗ ${result.error}`, STATUS_CODES.ERROR);
            }

        } catch (error) {
            this.showStatus(`✗ Erro: ${error.message}`, STATUS_CODES.ERROR);
        } finally {
            sendBtn.disabled = false;
        }
    }

    /**
     * Mostra status na interface
     */
    showStatus(message, type) {
        const statusEl = document.getElementById('twb-status');
        statusEl.textContent = message;
        statusEl.className = `twb-status twb-${type}`;
        statusEl.style.display = 'block';

        if (type === STATUS_CODES.SUCCESS) {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Limpa seleção de tropas
     */
    clearTroopSelection() {
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) input.value = 0;
        });
        this.selectedTroops = {};
        this.updateAttackInfo();
    }

    /**
     * Alterna visibilidade da interface
     */
    toggleVisibility() {
        if (this.container) {
            this.isVisible = !this.isVisible;
            this.container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * Injeta estilos CSS
     */
    injectStyles() {
        if (document.getElementById('twb-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'twb-styles';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }

    /**
     * Retorna CSS da interface
     */
    getCSS() {
        return `
            .twb-container {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 420px;
                max-height: 90vh;
                background: linear-gradient(135deg, #2c1810 0%, #3d2817 100%);
                border: 2px solid #d4af37;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 999999;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 12px;
                color: #d4af37;
                overflow-y: auto;
            }

            .twb-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(212, 175, 55, 0.1);
                border-bottom: 1px solid #8b6914;
                border-radius: 10px 10px 0 0;
            }

            .twb-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: bold;
                color: #d4af37;
            }

            .twb-close-btn {
                background: #8a4a4a;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            }

            .twb-close-btn:hover {
                background: #a55555;
            }

            .twb-content {
                padding: 15px;
            }

            .twb-section {
                margin-bottom: 20px;
                background: rgba(26, 15, 8, 0.6);
                border: 1px solid #8b6914;
                border-radius: 8px;
                overflow: hidden;
            }

            .twb-section-header {
                background: rgba(139, 105, 20, 0.3);
                padding: 8px 12px;
                font-weight: bold;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #8b6914;
            }

            .twb-form-row {
                display: flex;
                gap: 10px;
                padding: 12px;
                align-items: center;
            }

            .twb-input, .twb-select {
                padding: 6px 8px;
                border: 1px solid #8b6914;
                border-radius: 4px;
                background: #1a0f08;
                color: #d4af37;
                font-size: 12px;
                flex: 1;
            }

            .twb-input:focus, .twb-select:focus {
                outline: none;
                border-color: #d4af37;
                box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
            }

            .twb-troop-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .twb-troop-presets {
                padding: 8px 12px;
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                border-bottom: 1px solid rgba(139, 105, 20, 0.3);
            }

            .twb-troop-grid {
                padding: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .twb-troop-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px;
                background: rgba(60, 40, 23, 0.5);
                border: 1px solid rgba(139, 105, 20, 0.3);
                border-radius: 6px;
            }

            .twb-troop-icon img {
                width: 20px;
                height: 20px;
            }

            .twb-troop-info {
                flex: 1;
                min-width: 0;
            }

            .twb-troop-label {
                display: block;
                font-size: 10px;
                color: #d4af37;
                margin-bottom: 2px;
            }

            .twb-troop-controls {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .twb-troop-input {
                width: 40px;
                padding: 2px 4px;
                border: 1px solid #8b6914;
                border-radius: 3px;
                background: #1a0f08;
                color: #d4af37;
                font-size: 11px;
                text-align: center;
            }

            .twb-troop-available {
                font-size: 10px;
                color: #8b6914;
            }

            .twb-info-grid {
                padding: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .twb-info-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 8px;
                background: rgba(60, 40, 23, 0.3);
                border-radius: 4px;
            }

            .twb-info-label {
                font-size: 10px;
                color: #8b6914;
            }

            .twb-btn {
                background: #8b6914;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: background 0.2s;
            }

            .twb-btn:hover {
                background: #a67c00;
            }

            .twb-btn:disabled {
                background: #555;
                cursor: not-allowed;
            }

            .twb-btn-small {
                padding: 4px 8px;
                font-size: 10px;
            }

            .twb-btn-primary {
                background: #2d5a2d;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: bold;
                width: 100%;
                margin-bottom: 10px;
            }

            .twb-btn-primary:hover {
                background: #3a6b3a;
            }

            .twb-status {
                padding: 8px;
                border-radius: 4px;
                font-size: 11px;
                text-align: center;
                display: none;
            }

            .twb-status.twb-success {
                background: rgba(42, 74, 42, 0.8);
                border: 1px solid #4a8a4a;
                color: #8fbc8f;
            }

            .twb-status.twb-error {
                background: rgba(74, 42, 42, 0.8);
                border: 1px solid #8a4a4a;
                color: #f08080;
            }

            .twb-status.twb-loading {
                background: rgba(42, 52, 74, 0.8);
                border: 1px solid #4a6a8a;
                color: #8fb8f0;
            }

            .twb-status-text {
                font-size: 10px;
            }

            .twb-status-text.twb-success {
                color: #8fbc8f;
            }

            .twb-status-text.twb-error {
                color: #f08080;
            }

            .twb-status-text.twb-loading {
                color: #8fb8f0;
            }

            /* Scrollbar personalizada */
            .twb-container::-webkit-scrollbar {
                width: 6px;
            }

            .twb-container::-webkit-scrollbar-track {
                background: #2c1810;
            }

            .twb-container::-webkit-scrollbar-thumb {
                background: #8b6914;
                border-radius: 3px;
            }

            .twb-container::-webkit-scrollbar-thumb:hover {
                background: #d4af37;
            }
        `;
    }

    // Métodos para presets de tropas (expostos globalmente)
    selectAll() {
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) {
                input.value = this.currentTroops[unit] || 0;
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }

    selectNone() {
        this.clearTroopSelection();
    }

    selectOffensive() {
        this.selectNone();
        TROOP_TYPES.offensive.forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input && this.currentTroops[unit]) {
                input.value = this.currentTroops[unit];
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }

    selectDefensive() {
        this.selectNone();
        TROOP_TYPES.defensive.forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input && this.currentTroops[unit]) {
                input.value = this.currentTroops[unit];
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }
}


    // === INICIALIZAÇÃO ===
    
    // Sistema principal TWB
    class TWBSystem {
        constructor() {
            this.isInitialized = false;
            this.api = null;
            this.auth = null;
            this.troops = null;
            this.attack = null;
            this.interface = null;
        }

        async init() {
            if (this.isInitialized) return;

            try {
                // Aguardar game_data
                if (!this.isGameReady()) {
                    console.log('⏳ TWB: Aguardando carregamento do jogo...');
                    await this.waitForGame();
                }

                console.log('🎮 TWB: Jogo detectado, inicializando sistema...');

                // Inicializar componentes
                this.api = new window.TribalWarsAPI();
                this.auth = new window.AuthManager(this.api);
                this.troops = new window.TroopsManager(this.api);
                this.attack = new window.AttackSystem(this.api, this.auth, this.troops);
                this.interface = new window.TWBInterface(this.api, this.auth, this.troops, this.attack);

                this.isInitialized = true;
                console.log('🎉 TWB: Sistema inicializado com sucesso!');

                // Expor API global
                this.exposeGlobalAPI();
                this.showWelcomeMessage();

            } catch (error) {
                console.error('💥 TWB: Erro na inicialização:', error);
            }
        }

        isGameReady() {
            return !!(window.game_data && window.game_data.village && window.game_data.player);
        }

        async waitForGame() {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.isGameReady()) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);

                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 30000);
            });
        }

        exposeGlobalAPI() {
            window.TWB = {
                api: this.api,
                auth: this.auth,
                troops: this.troops,
                attack: this.attack,
                interface: this.interface,
                version: '2.0.0',
                
                sendAttack: (target, troops, type = 'attack') => {
                    return this.attack.sendAttack({
                        sourceVillage: this.api.currentVillage,
                        targetCoords: target,
                        troops,
                        attackType: type
                    });
                },

                getTroops: () => this.troops.getAvailableTroops(),
                show: () => this.interface.toggleVisibility(),
                selectAll: () => this.interface.selectAll(),
                selectNone: () => this.interface.selectNone(),
                selectOffensive: () => this.interface.selectOffensive(),
                selectDefensive: () => this.interface.selectDefensive(),

                getStatus: () => ({
                    initialized: this.isInitialized,
                    gameReady: this.isGameReady(),
                    currentVillage: this.api?.currentVillage,
                    version: '2.0.0'
                })
            };

            console.log('🌐 TWB: API global exposta (window.TWB)');
        }

        showWelcomeMessage() {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #2d5a2d, #3a6b3a);
                color: white; padding: 12px 20px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 999999;
                font-family: Arial, sans-serif; font-size: 14px;
                border: 2px solid #4a8a4a;
            `;
            
            notification.innerHTML = `
                🏰 <strong>TWB v2.0.0</strong> carregado!<br>
                <small>Pressione Ctrl+Shift+T para abrir a interface</small>
            `;

            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
    }

    // Inicialização
    async function main() {
        console.log('🏰 BOT-TWB v2.0.0 - Iniciando...');

        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const system = new TWBSystem();
            await system.init();
        } catch (error) {
            console.error('💥 TWB: Erro fatal:', error);
        }
    }

    // Executar apenas no jogo
    if (window.location.pathname.includes('game.php')) {
        main().catch(console.error);
    }

})();