/**
 * Configurações do Mundo Tribal Wars
 * Detecta e gerencia configurações específicas de cada mundo
 */

class WorldConfig {
    constructor() {
        this.config = null;
        this.worldInfo = null;
        this.playerInfo = null;
        this.serverInfo = null;
        
        // Configurações padrão
        this.defaultConfig = {
            // Velocidades básicas
            speed: 1.0,
            unitSpeed: 1.0,
            
            // Unidades disponíveis
            archer: true,
            knight: true,
            
            // Configurações de jogo
            maxNobleDistance: 100,
            coinWood: 10000,
            coinStone: 10000,
            coinIron: 10000,
            
            // Limites de tempo
            tradeCancelTime: 1,
            commandCancelTime: 300,
            
            // Recursos iniciais
            startResources: {
                wood: 0,
                stone: 0,
                iron: 0
            },
            
            // Configurações de batalha
            haiku: false,
            fakeLimit: 5,
            
            // Configurações de mercado
            tradeMerchants: 1000,
            tradeShipSpeed: 20,
            
            // Igreja/Igreja Primeira
            church: false,
            watchtower: false,
            
            // Configurações especiais
            gameMode: 'classic', // classic, speed, casual
            strongholdMode: false,
            barbarianRise: false,
            
            // Limites do mapa
            mapSize: { width: 1000, height: 1000 },
            
            // Configurações de suporte
            supportOutsideTribe: true,
            
            // Sistema de moralidade
            moral: 100,
            
            // Bônus de beginner protection
            beginnerProtection: 259200 // 3 dias em segundos
        };
        
        this.init();
    }

    /**
     * Inicializa configurações do mundo
     */
    async init() {
        try {
            // Tentar obter dados do game_data global
            if (typeof window !== 'undefined' && window.game_data) {
                this.loadFromGameData(window.game_data);
            }
            
            // Tentar carregar dados adicionais do servidor
            await this.loadServerConfig();
            
            // Detectar configurações automaticamente
            this.detectWorldFeatures();
            
            console.log('🌍 Configurações do mundo carregadas');
            
        } catch (error) {
            console.warn('⚠️ Erro ao carregar configurações do mundo:', error);
            this.config = { ...this.defaultConfig };
        }
    }

    /**
     * Carrega configurações do game_data
     */
    loadFromGameData(gameData) {
        this.worldInfo = {
            id: gameData.world,
            name: gameData.world,
            locale: gameData.locale || 'pt_BR',
            version: gameData.version || '1.0'
        };

        this.playerInfo = {
            id: gameData.player?.id,
            name: gameData.player?.name,
            sitter: gameData.player?.sitter || 0,
            premium: gameData.premium || false
        };

        this.serverInfo = {
            time: gameData.time_generated,
            timezone: gameData.timezone || 'UTC'
        };

        // Configurações específicas do mundo
        this.config = {
            ...this.defaultConfig,
            
            // Velocidades
            speed: gameData.speed || 1.0,
            unitSpeed: gameData.config?.unit_speed || 1.0,
            
            // Unidades disponíveis
            archer: gameData.config?.archer !== 0,
            knight: gameData.config?.knight !== 0,
            
            // Configurações de jogo
            maxNobleDistance: gameData.config?.snob?.max_dist || 100,
            coinWood: gameData.config?.snob?.coin_wood || 10000,
            coinStone: gameData.config?.snob?.coin_stone || 10000,
            coinIron: gameData.config?.snob?.coin_iron || 10000,
            
            // Tempos
            tradeCancelTime: gameData.config?.trade_cancel_time || 1,
            commandCancelTime: gameData.config?.command_cancel_time || 300,
            
            // Igreja
            church: gameData.config?.church !== 0,
            watchtower: gameData.config?.watchtower !== 0,
            
            // Outras configurações
            haiku: gameData.config?.haiku || false,
            fakeLimit: gameData.config?.fake_limit || 5,
            
            // Moral
            moral: gameData.config?.moral || 100,
            
            // Proteção de iniciante
            beginnerProtection: gameData.config?.beginner_protection || 259200,
            
            // Suporte externo
            supportOutsideTribe: gameData.config?.support_outside_tribe !== false
        };
    }

    /**
     * Tenta carregar configurações adicionais do servidor
     */
    async loadServerConfig() {
        try {
            // Tentar obter dados de configuração do mundo via interface do jogo
            const response = await fetch('/interface.php?func=get_config');
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                
                let serverConfig;
                if (contentType && contentType.includes('xml')) {
                    // Resposta é XML
                    serverConfig = this.parseConfigXML(await response.text());
                } else if (contentType && contentType.includes('json')) {
                    // Resposta é JSON
                    serverConfig = await response.json();
                } else {
                    // Tentar detectar automaticamente
                    const text = await response.text();
                    try {
                        // Tentar primeiro como JSON
                        serverConfig = JSON.parse(text);
                    } catch {
                        // Se falhar, tentar como XML
                        serverConfig = this.parseConfigXML(text);
                    }
                }
                
                this.mergeServerConfig(serverConfig);
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar config do servidor:', error.message);
            // Usar configurações padrão em caso de erro
            this.useDefaultConfig();
        }
    }

    /**
     * Parse XML de configuração (formato antigo do TW)
     */
    parseConfigXML(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const config = {};
            const configElements = xmlDoc.querySelectorAll('config > *');
            
            configElements.forEach(element => {
                const tagName = element.tagName;
                const value = element.textContent;
                
                // Converter valores numéricos
                if (!isNaN(value)) {
                    config[tagName] = parseFloat(value);
                } else if (value === 'true' || value === 'false') {
                    config[tagName] = value === 'true';
                } else {
                    config[tagName] = value;
                }
            });
            
            return config;
            
        } catch (error) {
            console.warn('⚠️ Erro ao fazer parse do XML:', error);
            return {};
        }
    }

    /**
     * Usa configurações padrão quando não é possível carregar do servidor
     */
    useDefaultConfig() {
        console.log('📋 Usando configurações padrão do mundo');
        // As configurações padrão já estão definidas no construtor
        // Apenas log para informar que estamos usando valores padrão
    }

    /**
     * Mescla configurações do servidor
     */
    mergeServerConfig(serverConfig) {
        if (!serverConfig) return;
        
        // Mapear configurações do servidor para nosso formato
        const mappings = {
            'game_speed': 'speed',
            'unit_speed': 'unitSpeed',
            'archer': 'archer',
            'knight': 'knight',
            'max_noble_distance': 'maxNobleDistance',
            'coin_wood': 'coinWood',
            'coin_stone': 'coinStone',
            'coin_iron': 'coinIron'
        };
        
        for (const [serverKey, ourKey] of Object.entries(mappings)) {
            if (serverConfig[serverKey] !== undefined) {
                this.config[ourKey] = serverConfig[serverKey];
            }
        }
    }

    /**
     * Detecta recursos automaticamente baseado na interface
     */
    detectWorldFeatures() {
        try {
            // Detectar se tem arqueiro verificando elementos da página
            if (!this.config.archer) {
                const archerElements = document.querySelectorAll('[src*="archer"], [class*="archer"], #archer');
                this.config.archer = archerElements.length > 0;
            }
            
            // Detectar cavaleiro/paladino
            if (!this.config.knight) {
                const knightElements = document.querySelectorAll('[src*="knight"], [class*="knight"], #knight');
                this.config.knight = knightElements.length > 0;
            }
            
            // Detectar igreja
            if (!this.config.church) {
                const churchElements = document.querySelectorAll('[src*="church"], [class*="church"]');
                this.config.church = churchElements.length > 0;
            }
            
            // Detectar watchtower
            if (!this.config.watchtower) {
                const watchtowerElements = document.querySelectorAll('[src*="watchtower"]');
                this.config.watchtower = watchtowerElements.length > 0;
            }
            
            // Detectar modo do jogo baseado na velocidade
            if (this.config.speed >= 10) {
                this.config.gameMode = 'speed';
            } else if (this.config.speed <= 0.5) {
                this.config.gameMode = 'casual';
            } else {
                this.config.gameMode = 'classic';
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na detecção automática:', error);
        }
    }

    /**
     * Obtém configuração específica
     */
    get(key, defaultValue = null) {
        if (!this.config) return defaultValue;
        
        const keys = key.split('.');
        let current = this.config;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }

    /**
     * Verifica se uma funcionalidade está disponível
     */
    hasFeature(feature) {
        const features = {
            archer: this.config?.archer || false,
            knight: this.config?.knight || false,
            church: this.config?.church || false,
            watchtower: this.config?.watchtower || false,
            haiku: this.config?.haiku || false,
            moral: this.config?.moral !== undefined && this.config.moral < 100,
            premium: this.playerInfo?.premium || false
        };
        
        return features[feature] || false;
    }

    /**
     * Obtém velocidade efetiva de uma unidade
     */
    getUnitSpeed(unitType, baseSpeed) {
        if (!this.config) return baseSpeed;
        
        return baseSpeed / (this.config.speed * this.config.unitSpeed);
    }

    /**
     * Calcula tempo de viagem considerando velocidades do mundo
     */
    calculateTravelTime(distance, unitSpeed) {
        const worldSpeed = this.config?.speed || 1;
        const unitSpeedMultiplier = this.config?.unitSpeed || 1;
        
        const actualSpeed = unitSpeed / (worldSpeed * unitSpeedMultiplier);
        return Math.round(distance * actualSpeed * 60 * 1000); // em milissegundos
    }

    /**
     * Obtém limites do mundo
     */
    getWorldLimits() {
        return {
            maxX: this.config?.mapSize?.width || 1000,
            maxY: this.config?.mapSize?.height || 1000,
            minX: 0,
            minY: 0
        };
    }

    /**
     * Verifica se coordenadas são válidas
     */
    isValidCoordinate(x, y) {
        const limits = this.getWorldLimits();
        return x >= limits.minX && x <= limits.maxX && 
               y >= limits.minY && y <= limits.maxY;
    }

    /**
     * Obtém informações de recursos iniciais
     */
    getStartingResources() {
        return {
            wood: this.config?.startResources?.wood || 1000,
            stone: this.config?.startResources?.stone || 1000,
            iron: this.config?.startResources?.iron || 1000
        };
    }

    /**
     * Calcula custo de nobres baseado na configuração
     */
    getNobleCoins() {
        return {
            wood: this.config?.coinWood || 10000,
            stone: this.config?.coinStone || 10000,
            iron: this.config?.coinIron || 10000
        };
    }

    /**
     * Obtém configuração de moral
     */
    getMoralConfig() {
        return {
            enabled: this.config?.moral !== undefined && this.config.moral < 100,
            basePoints: this.config?.moral || 100
        };
    }

    /**
     * Verifica se jogador ainda tem proteção de iniciante
     */
    hasBeginnerProtection(playerStartTime = null) {
        if (!playerStartTime) return false;
        
        const protectionTime = this.config?.beginnerProtection || 259200; // 3 dias
        const elapsed = Date.now() / 1000 - playerStartTime;
        
        return elapsed < protectionTime;
    }

    /**
     * Obtém informações completas do mundo
     */
    getWorldInfo() {
        return {
            ...this.worldInfo,
            config: this.config,
            player: this.playerInfo,
            server: this.serverInfo,
            features: {
                archer: this.hasFeature('archer'),
                knight: this.hasFeature('knight'),
                church: this.hasFeature('church'),
                watchtower: this.hasFeature('watchtower'),
                haiku: this.hasFeature('haiku'),
                moral: this.hasFeature('moral'),
                premium: this.hasFeature('premium')
            },
            gameMode: this.config?.gameMode || 'classic'
        };
    }

    /**
     * Detecta tipo de servidor (internacional, nacional, etc.)
     */
    getServerType() {
        if (!this.worldInfo) return 'unknown';
        
        const hostname = window.location.hostname;
        
        if (hostname.includes('.com.br') || hostname.includes('tribos.')) {
            return 'brazil';
        } else if (hostname.includes('.net')) {
            return 'international';
        } else if (hostname.includes('.com')) {
            return 'us';
        } else if (hostname.includes('.de')) {
            return 'germany';
        } else if (hostname.includes('.fr')) {
            return 'france';
        } else if (hostname.includes('.es')) {
            return 'spain';
        } else if (hostname.includes('.it')) {
            return 'italy';
        } else if (hostname.includes('.pl')) {
            return 'poland';
        }
        
        return 'other';
    }

    /**
     * Obtém configurações específicas do servidor
     */
    getServerSpecificConfig() {
        const serverType = this.getServerType();
        
        const serverConfigs = {
            brazil: {
                timeFormat: '24h',
                dateFormat: 'dd/mm/yyyy',
                decimalSeparator: ',',
                thousandSeparator: '.',
                currency: 'R$'
            },
            international: {
                timeFormat: '24h',
                dateFormat: 'dd/mm/yyyy',
                decimalSeparator: '.',
                thousandSeparator: ',',
                currency: '$'
            },
            us: {
                timeFormat: '12h',
                dateFormat: 'mm/dd/yyyy',
                decimalSeparator: '.',
                thousandSeparator: ',',
                currency: '$'
            }
        };
        
        return serverConfigs[serverType] || serverConfigs.international;
    }

    /**
     * Formata número baseado nas configurações do servidor
     */
    formatNumber(number) {
        const config = this.getServerSpecificConfig();
        
        return new Intl.NumberFormat(this.worldInfo?.locale || 'pt-BR', {
            useGrouping: true
        }).format(number);
    }

    /**
     * Formata data baseado nas configurações do servidor
     */
    formatDate(date) {
        const locale = this.worldInfo?.locale || 'pt-BR';
        return new Intl.DateTimeFormat(locale).format(date);
    }

    /**
     * Exporta configurações para backup
     */
    export() {
        return JSON.stringify({
            worldInfo: this.worldInfo,
            config: this.config,
            playerInfo: this.playerInfo,
            serverInfo: this.serverInfo,
            exportDate: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa configurações de backup
     */
    import(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            this.worldInfo = data.worldInfo || this.worldInfo;
            this.config = { ...this.defaultConfig, ...data.config };
            this.playerInfo = data.playerInfo || this.playerInfo;
            this.serverInfo = data.serverInfo || this.serverInfo;
            
            console.log('✅ Configurações importadas com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao importar configurações:', error);
            return false;
        }
    }

    /**
     * Atualiza configurações em tempo real
     */
    refresh() {
        return this.init();
    }

    /**
     * Obtém estatísticas do mundo (se disponível)
     */
    async getWorldStats() {
        try {
            // Tentar obter estatísticas básicas
            const stats = {
                totalPlayers: 0,
                totalTribes: 0,
                totalVillages: 0,
                averagePoints: 0,
                topPlayer: null,
                topTribe: null
            };
            
            // Implementação dependeria de APIs específicas disponíveis
            // Por enquanto, retorna estrutura vazia
            
            return stats;
            
        } catch (error) {
            console.warn('⚠️ Não foi possível obter estatísticas:', error);
            return null;
        }
    }

    /**
     * Debug: imprime todas as configurações
     */
    debug() {
        console.group('🌍 World Configuration Debug');
        console.log('World Info:', this.worldInfo);
        console.log('Config:', this.config);
        console.log('Player Info:', this.playerInfo);
        console.log('Server Info:', this.serverInfo);
        console.log('Server Type:', this.getServerType());
        console.log('Available Features:', {
            archer: this.hasFeature('archer'),
            knight: this.hasFeature('knight'),
            church: this.hasFeature('church'),
            watchtower: this.hasFeature('watchtower'),
            haiku: this.hasFeature('haiku'),
            moral: this.hasFeature('moral'),
            premium: this.hasFeature('premium')
        });
        console.groupEnd();
    }
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.WorldConfig = WorldConfig;
    
    // Criar instância global
    window.worldConfig = new WorldConfig();
    
    // Auto-inicializar quando game_data estiver disponível
    if (typeof game_data !== 'undefined') {
        window.worldConfig.loadFromGameData(game_data);
    }
    
    // Disponibilizar métodos de conveniência globais
    window.getWorldConfig = (key, defaultValue) => window.worldConfig.get(key, defaultValue);
    window.hasWorldFeature = (feature) => window.worldConfig.hasFeature(feature);
}

// Para Node.js/CommonJS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldConfig;
}