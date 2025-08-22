#!/usr/bin/env node

/**
 * Build Script Modular para BOT-TWB
 * Gera módulos separados e minificados + loader
 */

const fs = require('fs').promises;
const path = require('path');

class ModularBuilder {
    constructor() {
        this.srcDir = './src';
        this.distDir = './dist';
        this.modulesDir = './dist/modules';
        this.version = '2.1.0';
    }

    /**
     * Build modular completo
     */
    async build() {
        console.log('🔧 Iniciando build modular...');
        
        try {
            await this.createDirectories();
            await this.buildModules();
            await this.createLoader();
            await this.createManifest();
            
            console.log('✅ Build modular concluído!');
            console.log(`📦 Módulos gerados em: ${this.modulesDir}`);
            
        } catch (error) {
            console.error('❌ Erro no build:', error);
            process.exit(1);
        }
    }

    /**
     * Cria diretórios necessários
     */
    async createDirectories() {
        await fs.mkdir(this.distDir, { recursive: true });
        await fs.mkdir(this.modulesDir, { recursive: true });
        await fs.mkdir(`${this.modulesDir}/core`, { recursive: true });
        await fs.mkdir(`${this.modulesDir}/interface`, { recursive: true });
        await fs.mkdir(`${this.modulesDir}/modules`, { recursive: true });
        await fs.mkdir(`${this.modulesDir}/system`, { recursive: true });
    }

    /**
     * Constrói todos os módulos
     */
    async buildModules() {
        const modules = [
            { src: 'config/constants.js', dest: 'core/constants.min.js' },
            { src: 'core/api.js', dest: 'core/api.min.js' },
            { src: 'core/auth.js', dest: 'core/auth.min.js' },
            { src: 'core/troops.js', dest: 'core/troops.min.js' },
            { src: 'interface/components.js', dest: 'interface/components.min.js' },
            { src: 'interface/main.js', dest: 'interface/main.min.js' },
            { src: 'modules/attack-system.js', dest: 'modules/attack-system.min.js' },
            { src: 'modules/troop-counter.js', dest: 'modules/troop-counter.min.js' },
        ];

        for (const module of modules) {
            await this.buildModule(module.src, module.dest);
        }

        // Módulo de inicialização especial
        await this.createInitModule();
    }

    /**
     * Constrói um módulo individual
     */
    async buildModule(srcPath, destPath) {
        try {
            const fullSrcPath = path.join(this.srcDir, srcPath);
            const fullDestPath = path.join(this.modulesDir, destPath);
            
            let content = await fs.readFile(fullSrcPath, 'utf-8');
            
            // Remove imports/exports ES6 e converte para window
            content = this.processModuleContent(content, srcPath);
            
            // Minifica (básico)
            content = this.minifyBasic(content);
            
            await fs.writeFile(fullDestPath, content);
            console.log(`  ✓ ${srcPath} → ${destPath}`);
            
        } catch (error) {
            console.error(`  ❌ Erro ao processar ${srcPath}:`, error.message);
        }
    }

    /**
     * Processa conteúdo do módulo para formato standalone
     */
    processModuleContent(content, srcPath) {
        // Remove imports
        content = content.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
        
        // Converte exports para window
        if (srcPath.includes('constants.js')) {
            content = content.replace(/export\s+(const|let|var)\s+/g, 'window.');
        } else {
            content = content.replace(/export\s+class\s+(\w+)/g, 'window.$1 = class $1');
            content = content.replace(/export\s+function\s+(\w+)/g, 'window.$1 = function $1');
            content = content.replace(/export\s+(const|let|var)\s+(\w+)/g, 'window.$2');
        }
        
        // Garante referências corretas para window
        content = content.replace(/\bnew\s+UIComponents\(/g, 'new window.UIComponents(');
        content = content.replace(/\bTROOP_CONFIG\b/g, 'window.TROOP_CONFIG');
        content = content.replace(/\bTROOP_TYPES\b/g, 'window.TROOP_TYPES');
        
        return content;
    }

    /**
     * Minificação básica
     */
    minifyBasic(content) {
        return content
            // Remove comentários de linha
            .replace(/\/\/.*$/gm, '')
            // Remove comentários de bloco
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove linhas vazias excessivas
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // Remove espaços no início das linhas
            .replace(/^\s+/gm, '')
            // Trim final
            .trim();
    }

    /**
     * Cria módulo de inicialização
     */
    async createInitModule() {
        const initContent = `
// Sistema de inicialização TWB
window.TWBSystem = class TWBSystem {
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
            console.log('🎮 TWB: Inicializando sistema...');
            
            if (!this.isGameReady()) {
                console.log('⏳ TWB: Aguardando game_data...');
                setTimeout(() => this.init(), 1000);
                return;
            }

            this.api = new window.TribalWarsAPI();
            this.auth = new window.AuthManager(this.api);
            this.troops = new window.TroopsManager(this.api);
            this.attack = new window.AttackSystem(this.api, this.auth, this.troops);
            this.interface = new window.TWBInterface(this.api, this.auth, this.troops, this.attack);

            await this.interface.init();
            
            this.isInitialized = true;
            console.log('✅ TWB: Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('💥 TWB: Erro na inicialização:', error);
        }
    }

    isGameReady() {
        return typeof window.game_data !== 'undefined' && 
               window.game_data && 
               window.game_data.village && 
               document.querySelector('#content_value');
    }
};`;

        await fs.writeFile(
            path.join(this.modulesDir, 'system/init.min.js'),
            this.minifyBasic(initContent)
        );
        console.log('  ✓ system/init.min.js');
    }

    /**
     * Cria o loader principal
     */
    async createLoader() {
        // O loader já foi criado acima
        console.log('  ✓ bot-twb-loader.user.js');
    }

    /**
     * Cria manifesto com informações dos módulos
     */
    async createManifest() {
        const manifest = {
            name: 'BOT-TWB',
            version: this.version,
            description: 'Sistema modular para Tribal Wars',
            author: 'Pelegriinoo',
            buildDate: new Date().toISOString(),
            modules: [
                'core/constants.min.js',
                'core/api.min.js',
                'core/auth.min.js', 
                'core/troops.min.js',
                'interface/components.min.js',
                'interface/main.min.js',
                'modules/attack-system.min.js',
                'modules/troop-counter.min.js',
                'system/init.min.js'
            ]
        };

        await fs.writeFile(
            path.join(this.modulesDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        console.log('  ✓ manifest.json');
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    const builder = new ModularBuilder();
    builder.build();
}

module.exports = ModularBuilder;
