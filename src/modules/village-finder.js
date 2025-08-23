/**
 * Localizador de Aldeias
 * Encontra alvos para ataques ou farm
 */

class VillageFinder {
    constructor() {
        this.foundVillages = [];
        this.searchRadius = 10;
        this.filters = {
            minDistance: 0,
            maxDistance: 20,
            minPoints: 0,
            maxPoints: 12000,
            onlyBarbarian: false,
            excludePlayer: [],
            includePlayer: []
        };
    }

    /**
     * Busca aldeias baseado nos filtros
     */
    async findVillages(centerCoords = null, customFilters = {}) {
        const coords = centerCoords || this.getCurrentVillageCoords();
        const filters = { ...this.filters, ...customFilters };
        
        console.log('🔍 Buscando aldeias próximas...', { coords, filters });
        
        try {
            const villages = await this.searchNearbyVillages(coords, filters);
            this.foundVillages = villages;
            
            console.log(`✅ Encontradas ${villages.length} aldeias`);
            return villages;
            
        } catch (error) {
            console.error('❌ Erro ao buscar aldeias:', error);
            throw error;
        }
    }

    /**
     * Busca aldeias próximas
     */
    async searchNearbyVillages(centerCoords, filters) {
        const villages = [];
        
        // Buscar em um grid ao redor das coordenadas centrais
        for (let x = centerCoords.x - filters.maxDistance; x <= centerCoords.x + filters.maxDistance; x++) {
            for (let y = centerCoords.y - filters.maxDistance; y <= centerCoords.y + filters.maxDistance; y++) {
                const distance = this.calculateDistance(centerCoords, { x, y });
                
                if (distance >= filters.minDistance && distance <= filters.maxDistance) {
                    const villageInfo = await this.getVillageInfo(x, y);
                    
                    if (villageInfo && this.passesFilters(villageInfo, filters)) {
                        villages.push({
                            ...villageInfo,
                            distance: distance,
                            coords: { x, y }
                        });
                    }
                }
            }
        }
        
        return villages.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Obtém informações de uma aldeia
     */
    async getVillageInfo(x, y) {
        try {
            // Implementar busca real das informações da aldeia
            // Por enquanto, retorna dados simulados
            return {
                id: `${x}|${y}`,
                name: `Aldeia ${x}|${y}`,
                player: 'Jogador',
                tribe: 'Tribo',
                points: Math.floor(Math.random() * 12000),
                isBarbarian: Math.random() > 0.7
            };
            
        } catch (error) {
            console.warn(`⚠️ Erro ao obter info da aldeia ${x}|${y}:`, error);
            return null;
        }
    }

    /**
     * Verifica se a aldeia passa pelos filtros
     */
    passesFilters(village, filters) {
        // Verificar pontos
        if (village.points < filters.minPoints || village.points > filters.maxPoints) {
            return false;
        }
        
        // Verificar se é bárbaro
        if (filters.onlyBarbarian && !village.isBarbarian) {
            return false;
        }
        
        // Verificar jogadores excluídos
        if (filters.excludePlayer.includes(village.player)) {
            return false;
        }
        
        // Verificar jogadores incluídos
        if (filters.includePlayer.length > 0 && !filters.includePlayer.includes(village.player)) {
            return false;
        }
        
        return true;
    }

    /**
     * Calcula distância entre duas coordenadas
     */
    calculateDistance(coord1, coord2) {
        const dx = coord1.x - coord2.x;
        const dy = coord1.y - coord2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Obtém coordenadas da aldeia atual
     */
    getCurrentVillageCoords() {
        if (window.game_data && window.game_data.village) {
            return {
                x: parseInt(window.game_data.village.x),
                y: parseInt(window.game_data.village.y)
            };
        }
        
        throw new Error('Coordenadas da aldeia atual não encontradas');
    }

    /**
     * Configurar filtros de busca
     */
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
    }

    /**
     * Obter aldeias encontradas
     */
    getFoundVillages() {
        return this.foundVillages;
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.VillageFinder = VillageFinder;
    window.villageFinder = new VillageFinder();
}
