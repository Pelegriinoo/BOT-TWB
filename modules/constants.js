/**
 * BOT-TWB Constants - Constantes e configurações do jogo
 * @version 2.0.0
 * @author BOT-TWB
 */

// Configuração das tropas
window.TROOP_CONFIG = {
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
window.TROOP_SPEEDS = {
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
window.TROOP_TYPES = {
    offensive: ['axe', 'light', 'marcher', 'ram', 'catapult'],
    defensive: ['spear', 'sword', 'archer', 'heavy'],
    cavalry: ['light', 'marcher', 'heavy', 'knight'],
    infantry: ['spear', 'sword', 'axe', 'archer'],
    siege: ['ram', 'catapult'],
    special: ['knight', 'snob'],
    scout: ['spy']
};

// Tipos de ataque
window.ATTACK_TYPES = {
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

// Status codes comuns
window.STATUS_CODES = {
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
window.CACHE_CONFIG = {
    TOKEN_EXPIRATION: 30 * 60 * 1000, // 30 minutos
    TROOPS_EXPIRATION: 2 * 60 * 1000,  // 2 minutos
    VILLAGE_EXPIRATION: 5 * 60 * 1000, // 5 minutos
    REPORTS_EXPIRATION: 1 * 60 * 1000  // 1 minuto
};

// Versão da API
window.API_VERSION = '2.0.0';

// Configuração padrão do sistema
window.DEFAULT_CONFIG = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    enableCache: true,
    enableLogging: false,
    theme: 'dark',
    language: 'auto'
};

console.log('📋 TWB Constants carregadas');
