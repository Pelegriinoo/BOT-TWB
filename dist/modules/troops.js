/**
 * BOT-TWB Troops Manager - Gerenciamento e cálculos de tropas
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
        const unitTypes = Object.keys(window.TROOP_CONFIG);

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
            if (!window.TROOP_CONFIG[unit]) {
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
     * Obtém total de tropas
     */
    getTotalTroops(troops) {
        return Object.values(troops).reduce((sum, count) => sum + count, 0);
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
};

console.log('⚔️ TWB Troops Manager carregada');
