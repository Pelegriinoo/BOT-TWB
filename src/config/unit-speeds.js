/**
 * Configurações de Velocidades das Unidades
 * Dados precisos para cálculos de tempo
 */

const UNIT_SPEEDS = {
    // Velocidades base em minutos por campo
    base: {
        spear: 18,      // Lanceiro
        sword: 22,      // Espadachim  
        axe: 18,        // Bárbaro/Machado
        archer: 18,     // Arqueiro
        spy: 9,         // Explorador
        light: 10,      // Cavalaria Leve
        marcher: 10,    // Arqueiro a Cavalo
        heavy: 11,      // Cavalaria Pesada
        ram: 30,        // Aríete
        catapult: 30,   // Catapulta
        knight: 10,     // Paladino
        snob: 35        // Nobres
    },
    
    // Nomes das unidades por idioma
    names: {
        pt_BR: {
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
            snob: 'Nobres'
        },
        en_DK: {
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
        },
        es_ES: {
            spear: 'Lancero',
            sword: 'Espadachín',
            axe: 'Bárbaro',
            archer: 'Arquero',
            spy: 'Explorador',
            light: 'Caballería ligera',
            marcher: 'Arquero a caballo',
            heavy: 'Caballería pesada',
            ram: 'Ariete',
            catapult: 'Catapulta',
            knight: 'Paladín',
            snob: 'Noble'
        },
        fr_FR: {
            spear: 'Lancier',
            sword: 'Épéiste',
            axe: 'Barbare',
            archer: 'Archer',
            spy: 'Éclaireur',
            light: 'Cavalerie légère',
            marcher: 'Archer à cheval',
            heavy: 'Cavalerie lourde',
            ram: 'Bélier',
            catapult: 'Catapulte',
            knight: 'Paladin',
            snob: 'Noble'
        }
    },
    
    // Ícones das unidades (paths relativos do TW)
    icons: {
        spear: '/graphic/unit/unit_spear.png',
        sword: '/graphic/unit/unit_sword.png',
        axe: '/graphic/unit/unit_axe.png',
        archer: '/graphic/unit/unit_archer.png',
        spy: '/graphic/unit/unit_spy.png',
        light: '/graphic/unit/unit_light.png',
        marcher: '/graphic/unit/unit_marcher.png',
        heavy: '/graphic/unit/unit_heavy.png',
        ram: '/graphic/unit/unit_ram.png',
        catapult: '/graphic/unit/unit_catapult.png',
        knight: '/graphic/unit/unit_knight.png',
        snob: '/graphic/unit/unit_snob.png'
    },
    
    // Categorias de unidades
    categories: {
        infantry: ['spear', 'sword', 'axe', 'archer'],
        cavalry: ['spy', 'light', 'marcher', 'heavy'],
        siege: ['ram', 'catapult'],
        special: ['knight', 'snob']
    },
    
    // Capacidade de carga (recursos que pode carregar)
    carryCapacity: {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 10,
        spy: 0,          // Exploradores não carregam recursos
        light: 80,
        marcher: 50,
        heavy: 50,
        ram: 0,          // Máquinas de cerco não carregam
        catapult: 0,
        knight: 100,
        snob: 0          // Nobres não carregam recursos
    },
    
    // Custo populacional
    population: {
        spear: 1,
        sword: 1,
        axe: 1,
        archer: 1,
        spy: 2,
        light: 4,
        marcher: 5,
        heavy: 6,
        ram: 5,
        catapult: 8,
        knight: 10,
        snob: 100        // Nobres custam muito espaço
    },
    
    // Custos de produção (madeira/argila/ferro)
    costs: {
        spear: { wood: 50, stone: 30, iron: 10 },
        sword: { wood: 30, stone: 30, iron: 70 },
        axe: { wood: 60, stone: 30, iron: 40 },
        archer: { wood: 100, stone: 30, iron: 60 },
        spy: { wood: 50, stone: 50, iron: 20 },
        light: { wood: 125, stone: 100, iron: 250 },
        marcher: { wood: 250, stone: 100, iron: 150 },
        heavy: { wood: 200, stone: 150, iron: 600 },
        ram: { wood: 300, stone: 200, iron: 200 },
        catapult: { wood: 320, stone: 400, iron: 100 },
        knight: { wood: 20, stone: 20, iron: 40 },  // Apenas custo de manutenção
        snob: { wood: 40000, stone: 50000, iron: 50000 } // Custo alto dos nobres
    },
    
    // Força de ataque
    attack: {
        spear: { general: 10, cavalry: 15, archer: 45 },
        sword: { general: 25, cavalry: 50, archer: 40 },
        axe: { general: 40, cavalry: 10, archer: 5 },
        archer: { general: 15, cavalry: 50, archer: 40 },
        spy: { general: 0, cavalry: 0, archer: 0 },
        light: { general: 130, cavalry: 120, archer: 80 },
        marcher: { general: 120, cavalry: 40, archer: 50 },
        heavy: { general: 150, cavalry: 200, archer: 80 },
        ram: { general: 2, cavalry: 2, archer: 2 },
        catapult: { general: 100, cavalry: 100, archer: 100 },
        knight: { general: 150, cavalry: 250, archer: 40 },
        snob: { general: 30, cavalry: 100, archer: 50 }
    },
    
    // Força de defesa
    defense: {
        spear: { general: 15, cavalry: 45, archer: 20 },
        sword: { general: 50, cavalry: 15, archer: 40 },
        axe: { general: 10, cavalry: 5, archer: 10 },
        archer: { general: 50, cavalry: 40, archer: 5 },
        spy: { general: 2, cavalry: 1, archer: 2 },
        light: { general: 30, cavalry: 40, archer: 30 },
        marcher: { general: 40, cavalry: 30, archer: 50 },
        heavy: { general: 200, cavalry: 80, archer: 180 },
        ram: { general: 2, cavalry: 2, archer: 2 },
        catapult: { general: 100, cavalry: 100, archer: 100 },
        knight: { general: 250, cavalry: 400, archer: 150 },
        snob: { general: 100, cavalry: 50, archer: 100 }
    },
    
    // Tempo de produção em segundos (base)
    buildTime: {
        spear: 1020,     // 17 minutos
        sword: 1500,     // 25 minutos  
        axe: 1320,       // 22 minutos
        archer: 1800,    // 30 minutos
        spy: 2700,       // 45 minutos
        light: 3600,     // 1 hora
        marcher: 4500,   // 1h 15min
        heavy: 5400,     // 1h 30min
        ram: 4800,       // 1h 20min
        catapult: 7200,  // 2 horas
        knight: 0,       // Não é produzido
        snob: 0          // Tempo especial
    }
};

/**
 * Calculadora de velocidades com modificadores do mundo
 */
class UnitSpeedCalculator {
    constructor(worldConfig = {}) {
        this.worldSpeed = worldConfig.speed || 1;
        this.unitSpeed = worldConfig.unitSpeed || 1;
        this.hasArcher = worldConfig.hasArcher !== false;
        this.hasKnight = worldConfig.hasKnight !== false;
        this.locale = worldConfig.locale || 'pt_BR';
    }

    /**
     * Atualiza configurações do mundo
     */
    updateWorldConfig(config) {
        this.worldSpeed = config.speed || this.worldSpeed;
        this.unitSpeed = config.unitSpeed || this.unitSpeed;
        this.hasArcher = config.hasArcher !== false;
        this.hasKnight = config.hasKnight !== false;
        this.locale = config.locale || this.locale;
    }

    /**
     * Calcula velocidade real da unidade considerando modificadores do mundo
     */
    getActualSpeed(unitType) {
        const baseSpeed = UNIT_SPEEDS.base[unitType];
        if (!baseSpeed) return null;
        
        return baseSpeed / (this.worldSpeed * this.unitSpeed);
    }

    /**
     * Calcula tempo de viagem entre coordenadas em milissegundos
     */
    calculateTravelTime(distance, unitType) {
        const speed = this.getActualSpeed(unitType);
        if (!speed) return null;
        
        return Math.round(distance * speed * 60 * 1000); // em milissegundos
    }

    /**
     * Encontra a unidade mais lenta em um grupo (determina velocidade do exército)
     */
    findSlowestUnit(units) {
        if (typeof units === 'string') return units;
        
        let slowestUnit = null;
        let slowestSpeed = 0;
        
        const unitList = Array.isArray(units) ? units : 
                        Object.keys(units).filter(u => units[u] > 0);
        
        for (const unit of unitList) {
            if (!this.isUnitAvailable(unit)) continue;
            
            const speed = this.getActualSpeed(unit);
            if (speed && speed > slowestSpeed) {
                slowestSpeed = speed;
                slowestUnit = unit;
            }
        }
        
        return slowestUnit || 'light';
    }

    /**
     * Obtém nome da unidade no idioma atual
     */
    getUnitName(unitType, locale = null) {
        const lang = locale || this.locale;
        return UNIT_SPEEDS.names[lang]?.[unitType] || 
               UNIT_SPEEDS.names['pt_BR']?.[unitType] || 
               unitType;
    }

    /**
     * Obtém todos os nomes de unidades no idioma atual
     */
    getAllUnitNames(locale = null) {
        const lang = locale || this.locale;
        return UNIT_SPEEDS.names[lang] || UNIT_SPEEDS.names['pt_BR'];
    }

    /**
     * Obtém ícone da unidade
     */
    getUnitIcon(unitType) {
        return UNIT_SPEEDS.icons[unitType] || '';
    }

    /**
     * Obtém URL completa do ícone
     */
    getUnitIconUrl(unitType, baseUrl = '') {
        const iconPath = this.getUnitIcon(unitType);
        return baseUrl + iconPath;
    }

    /**
     * Obtém unidades por categoria
     */
    getUnitsByCategory(category) {
        return UNIT_SPEEDS.categories[category] || [];
    }

    /**
     * Obtém todas as categorias
     */
    getAllCategories() {
        return Object.keys(UNIT_SPEEDS.categories);
    }

    /**
     * Verifica se unidade está disponível no mundo atual
     */
    isUnitAvailable(unitType) {
        if ((unitType === 'archer' || unitType === 'marcher') && !this.hasArcher) {
            return false;
        }
        if (unitType === 'knight' && !this.hasKnight) {
            return false;
        }
        return UNIT_SPEEDS.base[unitType] !== undefined;
    }

    /**
     * Obtém lista de unidades disponíveis no mundo atual
     */
    getAvailableUnits() {
        return Object.keys(UNIT_SPEEDS.base).filter(unit => this.isUnitAvailable(unit));
    }

    /**
     * Calcula capacidade total de carga de um exército
     */
    calculateCarryCapacity(units) {
        let totalCapacity = 0;
        
        for (const [unitType, count] of Object.entries(units)) {
            if (typeof count !== 'number' || count <= 0) continue;
            
            const capacity = UNIT_SPEEDS.carryCapacity[unitType] || 0;
            totalCapacity += capacity * count;
        }
        
        return totalCapacity;
    }

    /**
     * Calcula população total de um exército
     */
    calculateTotalPopulation(units) {
        let totalPop = 0;
        
        for (const [unitType, count] of Object.entries(units)) {
            if (typeof count !== 'number' || count <= 0) continue;
            
            const pop = UNIT_SPEEDS.population[unitType] || 0;
            totalPop += pop * count;
        }
        
        return totalPop;
    }

    /**
     * Calcula custo total de recursos de um exército
     */
    calculateTotalCost(units) {
        const totalCost = { wood: 0, stone: 0, iron: 0 };
        
        for (const [unitType, count] of Object.entries(units)) {
            if (typeof count !== 'number' || count <= 0) continue;
            
            const cost = UNIT_SPEEDS.costs[unitType];
            if (cost) {
                totalCost.wood += (cost.wood || 0) * count;
                totalCost.stone += (cost.stone || 0) * count;
                totalCost.iron += (cost.iron || 0) * count;
            }
        }
        
        return totalCost;
    }

    /**
     * Calcula força de ataque total
     */
    calculateAttackPower(units, defenseType = 'general') {
        let totalAttack = 0;
        
        for (const [unitType, count] of Object.entries(units)) {
            if (typeof count !== 'number' || count <= 0) continue;
            
            const attack = UNIT_SPEEDS.attack[unitType];
            if (attack) {
                totalAttack += (attack[defenseType] || attack.general || 0) * count;
            }
        }
        
        return totalAttack;
    }

    /**
     * Calcula força de defesa total
     */
    calculateDefensePower(units, attackType = 'general') {
        let totalDefense = 0;
        
        for (const [unitType, count] of Object.entries(units)) {
            if (typeof count !== 'number' || count <= 0) continue;
            
            const defense = UNIT_SPEEDS.defense[unitType];
            if (defense) {
                totalDefense += (defense[attackType] || defense.general || 0) * count;
            }
        }
        
        return totalDefense;
    }

    /**
     * Sugere composição de tropas baseada no objetivo
     */
    suggestTroopComposition(objective, availableUnits = {}, targetDistance = 0) {
        const suggestions = {
            // Farm em bárbaros próximos
            farm: {
                light: Math.min(availableUnits.light || 0, 100),
                spy: Math.min(availableUnits.spy || 0, 1)
            },
            
            // Ataque geral balanceado
            attack: {
                axe: Math.min(availableUnits.axe || 0, 1000),
                light: Math.min(availableUnits.light || 0, 500),
                ram: Math.min(availableUnits.ram || 0, 20),
                spy: Math.min(availableUnits.spy || 0, 1)
            },
            
            // Defesa balanceada
            defense: {
                spear: Math.min(availableUnits.spear || 0, 2000),
                sword: Math.min(availableUnits.sword || 0, 1000),
                heavy: Math.min(availableUnits.heavy || 0, 200)
            },
            
            // Ataque rápido (cavalaria)
            fastAttack: {
                light: Math.min(availableUnits.light || 0, 1000),
                heavy: Math.min(availableUnits.heavy || 0, 200),
                spy: Math.min(availableUnits.spy || 0, 5)
            },
            
            // Exploração simples
            scout: {
                spy: Math.min(availableUnits.spy || 0, 1)
            },
            
            // Ataque com nobre
            noble: {
                snob: 1,
                axe: Math.min(availableUnits.axe || 0, 5000),
                light: Math.min(availableUnits.light || 0, 1000),
                ram: Math.min(availableUnits.ram || 0, 50),
                catapult: Math.min(availableUnits.catapult || 0, 100)
            },
            
            // Apoio defensivo
            support: {
                spear: Math.min(availableUnits.spear || 0, 1000),
                sword: Math.min(availableUnits.sword || 0, 500),
                heavy: Math.min(availableUnits.heavy || 0, 100)
            }
        };
        
        // Ajustar baseado na distância
        if (targetDistance > 50 && suggestions[objective]) {
            // Para alvos distantes, priorizar unidades mais rápidas
            const suggestion = suggestions[objective];
            
            // Reduzir unidades lentas
            if (suggestion.ram) suggestion.ram = Math.floor(suggestion.ram * 0.5);
            if (suggestion.catapult) suggestion.catapult = Math.floor(suggestion.catapult * 0.3);
            if (suggestion.snob && targetDistance > 30) {
                // Para nobres muito distantes, adicionar mais escolta rápida
                suggestion.light = Math.min(availableUnits.light || 0, 2000);
                suggestion.heavy = Math.min(availableUnits.heavy || 0, 500);
            }
        }
        
        return suggestions[objective] || {};
    }

    /**
     * Analisa eficiência de um exército para diferentes objetivos
     */
    analyzeArmyEfficiency(units) {
        const analysis = {
            totalUnits: Object.values(units).reduce((sum, count) => sum + count, 0),
            totalPopulation: this.calculateTotalPopulation(units),
            carryCapacity: this.calculateCarryCapacity(units),
            attackPower: {
                general: this.calculateAttackPower(units, 'general'),
                cavalry: this.calculateAttackPower(units, 'cavalry'),
                archer: this.calculateAttackPower(units, 'archer')
            },
            defensePower: {
                general: this.calculateDefensePower(units, 'general'),
                cavalry: this.calculateDefensePower(units, 'cavalry'),
                archer: this.calculateDefensePower(units, 'archer')
            },
            cost: this.calculateTotalCost(units),
            slowestUnit: this.findSlowestUnit(units),
            composition: {}
        };
        
        // Análise da composição
        const categories = ['infantry', 'cavalry', 'siege', 'special'];
        for (const category of categories) {
            const categoryUnits = this.getUnitsByCategory(category);
            const categoryCount = categoryUnits.reduce((sum, unit) => sum + (units[unit] || 0), 0);
            analysis.composition[category] = {
                count: categoryCount,
                percentage: analysis.totalUnits > 0 ? (categoryCount / analysis.totalUnits * 100).toFixed(1) : '0'
            };
        }
        
        // Recomendações baseadas na análise
        analysis.recommendations = [];
        
        if (analysis.composition.cavalry.count === 0 && analysis.totalUnits > 100) {
            analysis.recommendations.push('Considere adicionar cavalaria para maior velocidade');
        }
        
        if (analysis.composition.siege.count === 0 && analysis.attackPower.general > 1000) {
            analysis.recommendations.push('Adicione máquinas de cerco para destruir muralhas');
        }
        
        if (analysis.carryCapacity < 1000 && analysis.composition.cavalry.count > 0) {
            analysis.recommendations.push('Boa capacidade de saque para farm');
        }
        
        return analysis;
    }

    /**
     * Converte tempo em milissegundos para string legível
     */
    formatTravelTime(milliseconds) {
        if (milliseconds < 1000) return '0s';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Exporta dados de velocidades para uso externo
     */
    exportSpeedData() {
        return {
            baseSpeed: UNIT_SPEEDS.base,
            actualSpeeds: Object.keys(UNIT_SPEEDS.base).reduce((speeds, unit) => {
                speeds[unit] = this.getActualSpeed(unit);
                return speeds;
            }, {}),
            worldConfig: {
                speed: this.worldSpeed,
                unitSpeed: this.unitSpeed,
                hasArcher: this.hasArcher,
                hasKnight: this.hasKnight,
                locale: this.locale
            }
        };
    }
}

// Registrar módulo globalmente
if (typeof window !== 'undefined') {
    window.UNIT_SPEEDS = UNIT_SPEEDS;
    window.UnitSpeedCalculator = UnitSpeedCalculator;
    console.log('✅ UnitSpeedCalculator exportado para window');
    
    // Disponibilizar instância global com configuração padrão
    window.unitSpeedCalc = new UnitSpeedCalculator();
    
    // Auto-atualizar se game_data estiver disponível
    if (typeof game_data !== 'undefined') {
        window.unitSpeedCalc.updateWorldConfig({
            speed: game_data.speed,
            unitSpeed: game_data.config?.unit_speed,
            hasArcher: game_data.config?.archer !== 0,
            hasKnight: game_data.config?.knight !== 0,
            locale: game_data.locale
        });
    }
}

// Para Node.js/CommonJS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UNIT_SPEEDS, UnitSpeedCalculator };
}

// Confirmar execução
console.log('📦 Arquivo src/config/unit-speeds.js executado com sucesso');