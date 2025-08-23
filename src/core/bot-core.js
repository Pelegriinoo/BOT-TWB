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

        for (const moduleName of modules) {
            try {
                await this.loadModule(moduleName);
                console.log(`📦 Módulo ${moduleName} carregado`);
            } catch (error) {
                console.error(`❌ Erro ao carregar ${moduleName}:`, error);
            }
        }
    }

    async loadModule(moduleName) {
        const url = `https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/src/modules/${moduleName}.js`;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initializeGameData() {
        this.gameData = new GameDataCollector();
        await this.gameData.collectAllData();
    }

    async createInterface() {
        const InterfaceModule = await import('./ui/interface.js');
        this.ui = new InterfaceModule.BotInterface(this);
        this.ui.create();
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

// Inicializar bot quando carregado
if (typeof window !== 'undefined') {
    window.TribalWarsBot = TribalWarsBot;
    
    // Auto-start se não estiver em desenvolvimento
    if (!window.location.hostname.includes('localhost')) {
        window.twBot = new TribalWarsBot();
    }
}