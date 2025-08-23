/**
 * BOT-TWB - Core System
 * Sistema principal do bot com funcionalidades centrais
 */

class TribalWarsBot {
    constructor() {
        this.version = '2.0.0';
        this.modules = new Map();
        this.config = null;
        this.gameData = null;
        this.ui = null;
        
        this.init();
    }

    async init() {
        console.log(`🏰 BOT-TWB v${this.version} iniciando...`);
        
        // Verificar se está no Tribal Wars
        if (!this.isTribalWars()) {
            console.error('❌ Bot deve ser executado no Tribal Wars');
            return;
        }

        try {
            await this.loadModules();
            await this.initializeGameData();
            await this.createInterface();
            
            console.log('✅ BOT-TWB carregado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao carregar bot:', error);
        }
    }

    isTribalWars() {
        return window.location.hostname.includes('tribalwars') || 
               window.location.hostname.includes('tribos') ||
               window.game_data;
    }

    async loadModules() {
        const modules = [
            'troops-collector',
            'attack-system', 
            'village-finder',
            'distance-calculator',
            'timing-controller'
        ];

        console.log('📦 Carregando módulos...');
        
        // Aguardar que os módulos sejam carregados pelo loader
        for (const moduleName of modules) {
            await this.waitForModule(moduleName);
        }
        
        console.log('✅ Todos os módulos carregados');
    }

    /**
     * Aguarda um módulo específico ser carregado
     */
    async waitForModule(moduleName) {
        const maxAttempts = 50; // 5 segundos máximo
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkModule = () => {
                attempts++;
                
                // Mapear nomes dos módulos para classes globais
                const moduleClasses = {
                    'troops-collector': 'TroopsCollector',
                    'attack-system': 'AttackSystem',
                    'village-finder': 'VillageFinder', 
                    'distance-calculator': 'DistanceCalculator',
                    'timing-controller': 'TimingController'
                };
                
                const className = moduleClasses[moduleName];
                
                if (window[className]) {
                    console.log(`✅ Módulo ${moduleName} carregado`);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error(`❌ Erro ao carregar ${moduleName}: timeout`);
                    reject(new Error(`Timeout ao carregar módulo ${moduleName}`));
                } else {
                    setTimeout(checkModule, 100);
                }
            };
            
            checkModule();
        });
    }

    async initializeGameData() {
        this.gameData = new GameDataCollector();
        await this.gameData.collectAllData();
    }

    async createInterface() {
        // Aguardar que a interface seja carregada pelos scripts
        await new Promise(resolve => {
            const checkInterface = () => {
                if (window.BotInterface) {
                    this.ui = new window.BotInterface(this);
                    this.ui.create();
                    resolve();
                } else {
                    setTimeout(checkInterface, 100);
                }
            };
            checkInterface();
        });
    }

    // API pública para outros módulos
    getModule(name) {
        return this.modules.get(name);
    }

    registerModule(name, module) {
        this.modules.set(name, module);
    }

    getGameData() {
        return this.gameData;
    }

    getConfig() {
        return this.config;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TribalWarsBot = TribalWarsBot;
    console.log('✅ TribalWarsBot exportado para window');
}
