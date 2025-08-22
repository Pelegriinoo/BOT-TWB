/**
 * BOT-TWB System - Sistema principal de inicialização
 * @version 2.0.0
 * @author BOT-TWB
 */

// Sistema principal TWB
class TWBSystem {
    constructor() {
        this.isInitialized = false;
        this.api = null;
        this.auth = null;
        this.troops = null;
        this.attack = null;
        this.interface = null;
        this.troopCounter = null;
        this.villageManager = null;
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

            // Inicializar componentes principais
            this.api = new window.TribalWarsAPI();
            this.auth = new window.AuthManager(this.api);
            this.troops = new window.TroopsManager(this.api);
            this.attack = new window.AttackSystem(this.api, this.auth, this.troops);
            
            // Inicializar módulos auxiliares
            this.troopCounter = new window.TroopCounter(this.troops);
            this.villageManager = new window.VillageManager(this.api);
            
            // Inicializar interface
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
            system: this,
            api: this.api,
            auth: this.auth,
            troops: this.troops,
            attack: this.attack,
            interface: this.interface,
            troopCounter: this.troopCounter,
            villageManager: this.villageManager,
            utils: window.TWBUtils,
            version: '2.0.0',
            
            // Métodos de conveniência
            sendAttack: (target, troops, type = 'attack') => {
                return this.attack.sendAttack({
                    sourceVillage: this.api.currentVillage,
                    targetCoords: target,
                    troops,
                    attackType: type
                });
            },

            getTroops: () => this.troops.getAvailableTroops(),
            getVillages: () => this.villageManager.getVillageList(),
            show: () => this.interface.toggleVisibility(),
            
            // Métodos de seleção de tropas
            selectAll: () => this.interface.selectAll(),
            selectNone: () => this.interface.selectNone(),
            selectOffensive: () => this.interface.selectOffensive(),

            getStatus: () => ({
                initialized: this.isInitialized,
                gameReady: this.isGameReady(),
                currentVillage: this.api?.currentVillage,
                version: '2.0.0',
                modules: {
                    api: !!this.api,
                    auth: !!this.auth,
                    troops: !!this.troops,
                    attack: !!this.attack,
                    interface: !!this.interface,
                    troopCounter: !!this.troopCounter,
                    villageManager: !!this.villageManager
                }
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

// Inicialização automática
async function initTWB() {
    if (window.location.pathname.includes('game.php')) {
        const system = new TWBSystem();
        await system.init();
    }
}

// Aguardar todos os módulos carregarem antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initTWB, 1000);
    });
} else {
    setTimeout(initTWB, 1000);
}

console.log('🏰 TWB System carregado');
