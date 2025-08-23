/**
 * Coletor de Dados do Jogo
 * Extrai e organiza informações do Tribal Wars
 */

class GameDataCollector {
    constructor() {
        this.gameData = null;
        this.playerData = null;
        this.worldConfig = null;
        this.villagesData = null;
        
        this.lastUpdate = null;
        this.updateInterval = 60000; // 1 minuto
    }

    async collectAllData() {
        console.log('📊 Coletando dados do jogo...');
        
        try {
            // Dados básicos do jogo
            this.gameData = this.extractGameData();
            
            // Dados do jogador
            this.playerData = await this.collectPlayerData();
            
            // Configurações do mundo
            this.worldConfig = this.extractWorldConfig();
            
            // Dados das vilas
            this.villagesData = await this.collectVillagesData();
            
            this.lastUpdate = new Date();
            
            console.log('✅ Dados coletados com sucesso');
            return this.getAllData();
            
        } catch (error) {
            console.error('❌ Erro ao coletar dados:', error);
            throw error;
        }
    }

    extractGameData() {
        if (!window.game_data) {
            throw new Error('game_data não disponível');
        }

        return {
            player: {
                id: game_data.player.id,
                name: game_data.player.name,
                sitter: game_data.player.sitter
            },
            village: {
                id: game_data.village.id,
                name: game_data.village.name,
                x: game_data.village.x,
                y: game_data.village.y,
                coords: `${game_data.village.x}|${game_data.village.y}`
            },
            world: {
                id: game_data.world,
                speed: game_data.speed,
                unitSpeed: game_data.config && game_data.config.unit_speed ? game_data.config.unit_speed : 1,
                locale: game_data.locale
            },
            screen: game_data.screen,
            mode: game_data.mode,
            csrf: this.extractCSRFToken()
        };
    }

    extractCSRFToken() {
        // Múltiplos métodos para extrair token CSRF
        let token = document.querySelector('input[name="h"]')?.value ||
                   document.querySelector('meta[name="csrf-token"]')?.content ||
                   document.querySelector('[name="h"]')?.value;
        
        if (!token) {
            const pageHTML = document.documentElement.innerHTML;
            const match = pageHTML.match(/[&?]h=([a-f0-9]+)/) || 
                         pageHTML.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
            
            if (match) {
                token = match[1];
            }
        }
        
        return token;
    }

    async collectPlayerData() {
        try {
            // Dados básicos já extraídos
            const playerInfo = {
                ...this.gameData.player,
                villages: [],
                totalPoints: 0,
                rank: null
            };

            // Tentar obter mais informações se disponível
            if (window.game_data.player.points) {
                playerInfo.totalPoints = game_data.player.points;
            }

            return playerInfo;
            
        } catch (error) {
            console.warn('⚠️ Erro ao coletar dados do jogador:', error);
            return this.gameData.player;
        }
    }

    extractWorldConfig() {
        const config = {
            speed: this.gameData.world.speed,
            unitSpeed: this.gameData.world.unitSpeed,
            tradeCancelTime: game_data.config?.trade_cancel_time || 1,
            knightNewItems: game_data.config?.knight_new_items || false,
            hasArcher: game_data.config?.archer !== 0,
            hasKnight: game_data.config?.knight !== 0,
            
            // Velocidades das unidades
            unitSpeeds: {
                spear: 18,
                sword: 22,
                axe: 18,
                archer: 18,
                spy: 9,
                light: 10,
                marcher: 10,
                heavy: 11,
                ram: 30,
                catapult: 30,
                knight: 10,
                snob: 35
            }
        };

        // Ajustar velocidades baseado nas configurações do mundo
        if (config.speed && config.unitSpeed) {
            Object.keys(config.unitSpeeds).forEach(unit => {
                config.unitSpeeds[unit] = Math.round(
                    config.unitSpeeds[unit] / (config.speed * config.unitSpeed)
                );
            });
        }

        return config;
    }

    async collectVillagesData() {
        try {
            const response = await fetch('/game.php?screen=overview_villages&mode=prod');
            const html = await response.text();
            
            const villages = [];
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair dados das vilas
            doc.querySelectorAll('tr[id*="village_"]').forEach(row => {
                const villageId = row.id.replace('village_', '');
                const coordsEl = row.querySelector('.quickedit-label');
                const nameEl = row.querySelector('.quickedit-content');
                const pointsEl = row.querySelector('td:nth-child(3)');
                
                if (coordsEl && nameEl) {
                    const coordsMatch = coordsEl.textContent.match(/\((\d+)\|(\d+)\)/);
                    
                    if (coordsMatch) {
                        villages.push({
                            id: villageId,
                            name: nameEl.textContent.trim(),
                            x: parseInt(coordsMatch[1]),
                            y: parseInt(coordsMatch[2]),
                            coords: `${coordsMatch[1]}|${coordsMatch[2]}`,
                            points: pointsEl ? parseInt(pointsEl.textContent.replace(/\D/g, '')) : 0
                        });
                    }
                }
            });

            console.log(`📍 ${villages.length} vilas coletadas`);
            return villages;
            
        } catch (error) {
            console.warn('⚠️ Erro ao coletar dados das vilas:', error);
            return [];
        }
    }

    // Calcular distância entre duas coordenadas
    calculateDistance(coord1, coord2) {
        const [x1, y1] = typeof coord1 === 'string' ? coord1.split('|').map(Number) : [coord1.x, coord1.y];
        const [x2, y2] = typeof coord2 === 'string' ? coord2.split('|').map(Number) : [coord2.x, coord2.y];
        
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Calcular tempo de viagem
    calculateTravelTime(distance, unitType) {
        const unitSpeed = this.worldConfig.unitSpeeds[unitType] || 18;
        return Math.round(distance * unitSpeed * 60 * 1000); // em milissegundos
    }

    // Encontrar vilas próximas a uma coordenada
    findNearestVillages(targetCoords, maxDistance = 50, maxResults = 10) {
        if (!this.villagesData) return [];
        
        const [targetX, targetY] = targetCoords.split('|').map(Number);
        
        return this.villagesData
            .map(village => ({
                ...village,
                distance: this.calculateDistance(village.coords, targetCoords)
            }))
            .filter(village => village.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, maxResults);
    }

    // Obter vila atual
    getCurrentVillage() {
        return this.gameData.village;
    }

    // Obter todas as vilas
    getAllVillages() {
        return this.villagesData || [];
    }

    // Verificar se precisa atualizar dados
    needsUpdate() {
        if (!this.lastUpdate) return true;
        
        const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
        return timeSinceUpdate > this.updateInterval;
    }

    // Atualizar dados se necessário
    async updateIfNeeded() {
        if (this.needsUpdate()) {
            await this.collectAllData();
        }
    }

    // Obter todos os dados coletados
    getAllData() {
        return {
            game: this.gameData,
            player: this.playerData,
            world: this.worldConfig,
            villages: this.villagesData,
            lastUpdate: this.lastUpdate,
            methods: {
                calculateDistance: this.calculateDistance.bind(this),
                calculateTravelTime: this.calculateTravelTime.bind(this),
                findNearestVillages: this.findNearestVillages.bind(this),
                getCurrentVillage: this.getCurrentVillage.bind(this),
                getAllVillages: this.getAllVillages.bind(this)
            }
        };
    }

    // Exportar dados para debug
    exportData() {
        return JSON.stringify(this.getAllData(), null, 2);
    }
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.GameDataCollector = GameDataCollector;
    console.log('✅ GameDataCollector exportado para window');
}