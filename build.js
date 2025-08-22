#!/usr/bin/env node

/**
 * Build Script para BOT-TWB
 * Combina e minifica todos os módulos em um único userscript
 */

const fs = require('fs').promises;
const path = require('path');

class TWBBuilder {
    constructor() {
        this.srcDir = './src';
        this.distDir = './dist';
        this.outputFile = 'bot-twb.user.js';
        this.modules = [];
        this.version = '2.0.0';
    }

    /**
     * Executa o build completo
     */
    async build() {
        console.log('🔧 Iniciando build do BOT-TWB...');
        
        try {
            await this.createDistDir();
            await this.loadModules();
            await this.generateUserScript();
            await this.generateDocumentation();
            
            console.log('✅ Build concluído com sucesso!');
            console.log(`📦 Arquivo gerado: ${this.distDir}/${this.outputFile}`);
            
        } catch (error) {
            console.error('❌ Erro no build:', error);
            process.exit(1);
        }
    }

    /**
     * Cria diretório dist
     */
    async createDistDir() {
        try {
            await fs.mkdir(this.distDir, { recursive: true });
        } catch (error) {
            // Diretório já existe
        }
    }

    /**
     * Carrega todos os módulos
     */
    async loadModules() {
        console.log('📁 Carregando módulos...');
        
        const moduleFiles = [
            'config/constants.js',
            'core/api.js',
            'core/auth.js',
            'core/troops.js',
            'core/utils.js',
            'modules/attack-system.js',
            'modules/troop-counter.js',
            'modules/village-manager.js',
            'interface/components.js',
            'interface/main.js'
        ];

        for (const file of moduleFiles) {
            try {
                const filePath = path.join(this.srcDir, file);
                const content = await fs.readFile(filePath, 'utf8');
                
                this.modules.push({
                    name: file,
                    content: this.processModule(content, file)
                });
                
                console.log(`  ✓ ${file}`);
            } catch (error) {
                console.warn(`  ⚠️ ${file} não encontrado, pulando...`);
            }
        }
    }

    /**
     * Processa um módulo individual
     */
    processModule(content, filename) {
        // Remover imports/exports ES6 e converter para formato compatível
        let processed = content;
        
        // Remover imports
        processed = processed.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
        
        // Converter exports para assignments
        processed = processed.replace(/export\s+class\s+(\w+)/g, 'window.$1 = class $1');
        processed = processed.replace(/export\s+const\s+(\w+)/g, 'window.$1 ');
        processed = processed.replace(/export\s+function\s+(\w+)/g, 'window.$1 = function $1');
        processed = processed.replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
            const exportList = exports.split(',').map(exp => exp.trim());
            return exportList.map(exp => `window.${exp} = ${exp};`).join('\n');
        });

        // Adicionar comentário identificador
        return `\n// === ${filename} ===\n${processed}\n`;
    }

    /**
     * Gera o userscript final
     */
    async generateUserScript() {
        console.log('🔨 Gerando userscript...');
        
        const header = this.generateUserScriptHeader();
        const modulesCode = this.modules.map(m => m.content).join('\n');
        const footer = this.generateUserScriptFooter();
        
        const finalScript = `${header}\n${modulesCode}\n${footer}`;
        
        const outputPath = path.join(this.distDir, this.outputFile);
        await fs.writeFile(outputPath, finalScript, 'utf8');
    }

    /**
     * Gera header do userscript
     */
    generateUserScriptHeader() {
        return `// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      ${this.version}
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
    
    console.log('🏰 BOT-TWB v${this.version} - Iniciado');`;
    }

    /**
     * Gera footer do userscript
     */
    generateUserScriptFooter() {
        return `
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
                version: '${this.version}',
                
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
                    version: '${this.version}'
                })
            };

            console.log('🌐 TWB: API global exposta (window.TWB)');
        }

        showWelcomeMessage() {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #2d5a2d, #3a6b3a);
                color: white; padding: 12px 20px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 999999;
                font-family: Arial, sans-serif; font-size: 14px;
                border: 2px solid #4a8a4a;
            \`;
            
            notification.innerHTML = \`
                🏰 <strong>TWB v${this.version}</strong> carregado!<br>
                <small>Pressione Ctrl+Shift+T para abrir a interface</small>
            \`;

            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
    }

    // Inicialização
    async function main() {
        console.log('🏰 BOT-TWB v${this.version} - Iniciando...');

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

})();`;
    }

    /**
     * Gera documentação
     */
    async generateDocumentation() {
        console.log('📚 Gerando documentação...');
        
        const docs = `# BOT-TWB - Build ${this.version}

## Arquivos Gerados

- **bot-twb.user.js**: UserScript completo com todos os módulos
- **Tamanho**: ${await this.getFileSize()} KB

## Módulos Incluídos

${this.modules.map(m => `- ${m.name}`).join('\n')}

## Instalação

1. Instale o Tampermonkey ou Greasemonkey
2. Clique em "Criar um novo script"
3. Cole o conteúdo de \`bot-twb.user.js\`
4. Salve o script
5. Acesse o Tribal Wars

## Uso

- **Ctrl+Shift+T**: Abrir/fechar interface
- **window.TWB**: API global disponível no console

## API Global

\`\`\`javascript
// Enviar ataque rápido
TWB.sendAttack('500|500', {axe: 100, light: 50}, 'attack');

// Obter tropas
const troops = await TWB.getTroops();

// Abrir interface
TWB.show();

// Status do sistema
TWB.getStatus();
\`\`\`

---
Gerado automaticamente em ${new Date().toLocaleString()}
`;

        await fs.writeFile(path.join(this.distDir, 'README.md'), docs, 'utf8');
    }

    /**
     * Obtém tamanho do arquivo gerado
     */
    async getFileSize() {
        try {
            const stats = await fs.stat(path.join(this.distDir, this.outputFile));
            return Math.round(stats.size / 1024);
        } catch {
            return 0;
        }
    }
}

// Executar build
if (require.main === module) {
    const builder = new TWBBuilder();
    builder.build();
}

module.exports = TWBBuilder;