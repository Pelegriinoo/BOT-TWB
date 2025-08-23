// ==UserScript==
// @name         BOT-TWB - Sistema de Bot para Tribal Wars Brasil
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.1
// @description  Sistema completo de automação para Tribal Wars Brasil - Versão Corrigida
// @author       Pelegrino
// @match        *://*.tribalwars.com.br/*
// @match        *://*.tribos.com.pt/*
// @match        *://br*.tribalwars.net/*
// @match        *://mundo*.tribalwars.com.br/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_addStyle
// @icon         https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/assets/icon.png
// @downloadURL  https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/tampermonkey/bot-loader.user.js
// @updateURL    https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/tampermonkey/bot-loader.user.js
// @homepageURL  https://github.com/Pelegriinoo/BOT-TWB
// @supportURL   https://github.com/Pelegriinoo/BOT-TWB/issues
// ==/UserScript==

(function() {
    'use strict';

    console.log('🏰 BOT-TWB Brasil iniciando...');

    // Configurações específicas para Brasil
    const CONFIG = {
        github: {
            owner: 'Pelegriinoo',
            repo: 'BOT-TWB',
            branch: 'main'
        },
        files: [
            'src/core/bot-core.js',
            'src/core/game-data.js',
            'src/core/http-client.js',
            'src/core/utils.js',
            'src/modules/troops-collector.js',
            'src/modules/attack-system.js',
            'src/modules/village-finder.js',
            'src/modules/distance-calculator.js',
            'src/modules/timing-controller.js',
            'src/ui/interface.js',
            'src/ui/components.js',
            'src/config/settings.js',
            'src/config/unit-speeds.js',
            'src/config/world-config.js'
        ],
        version: '2.0.1-BR',
        checkInterval: 30000,
        locale: 'pt-BR',
        serverType: 'brasil'
    };

    const BRASIL_CONFIG = {
        unitNames: {
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
        messages: {
            loading: '🚀 Carregando BOT-TWB Brasil...',
            success: '✅ BOT-TWB Brasil carregado com sucesso!',
            error: '❌ Erro ao carregar BOT-TWB Brasil',
            notTribalWars: '❌ BOT-TWB: Não está no Tribal Wars Brasil',
            filesLoaded: '📦 Carregando arquivos do GitHub...',
            retrying: '🔄 Tentando recarregar arquivos...',
            botInitialized: '🤖 Bot inicializado para servidor brasileiro',
            updateAvailable: '🔄 BOT-TWB Brasil - Nova Versão',
            cacheCleared: '🧹 Cache limpo'
        }
    };

    class BotLoaderBrasil {
        constructor() {
            this.loadedFiles = new Set();
            this.failedFiles = new Set();
            this.retryCount = new Map();
            this.maxRetries = 3;
            this.serverInfo = this.detectServerInfo();
            this.globalClasses = new Map(); // Para rastrear classes carregadas

            this.init();
        }

        detectServerInfo() {
            const hostname = window.location.hostname;
            const serverInfo = {
                type: 'brasil',
                language: 'pt-BR',
                domain: hostname,
                isBrazil: hostname.includes('.com.br') || hostname.includes('tribos.'),
                isPortugal: hostname.includes('.com.pt'),
                worldNumber: this.extractWorldNumber(hostname)
            };

            console.log('🌍 Servidor detectado:', serverInfo);
            return serverInfo;
        }

        extractWorldNumber(hostname) {
            const match = hostname.match(/br(\d+)|mundo(\d+)|(\d+)/);
            return match ? (match[1] || match[2] || match[3]) : 'desconhecido';
        }

        async init() {
            if (!this.isTribalWarsBrasil()) {
                console.log(BRASIL_CONFIG.messages.notTribalWars);
                return;
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        isTribalWarsBrasil() {
            const hostname = window.location.hostname;
            return hostname.includes('tribalwars.com.br') ||
                   hostname.includes('tribos.com.pt') ||
                   hostname.includes('br') ||
                   hostname.includes('mundo') ||
                   (window.game_data && (window.game_data.locale === 'pt_BR' || window.game_data.locale === 'pt_PT'));
        }

        async start() {
            console.log(BRASIL_CONFIG.messages.loading);

            try {
                this.setupLocale();
                await this.checkForUpdates();
                await this.loadDependencies();
                await this.loadBotFiles();
                await this.initializeBot();

                console.log(BRASIL_CONFIG.messages.success);
                this.showSuccessNotification();

            } catch (error) {
                console.error(BRASIL_CONFIG.messages.error + ':', error);
                this.showErrorNotification(error.message);
            }
        }

        setupLocale() {
            window.BRASIL_LOCALE = {
                currency: 'R$',
                dateFormat: 'dd/mm/yyyy',
                timeFormat: '24h',
                decimalSeparator: ',',
                thousandSeparator: '.',
                unitNames: BRASIL_CONFIG.unitNames
            };

            console.log('🇧🇷 Configurações brasileiras aplicadas');
        }

        async loadBotFiles() {
            console.log(BRASIL_CONFIG.messages.filesLoaded);

            // Carregar arquivos sequencialmente para garantir ordem
            for (const file of CONFIG.files) {
                try {
                    await this.loadFile(file);
                    // Pequena pausa para garantir execução
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`❌ Erro ao carregar ${file}:`, error);
                }
            }

            // Verificar falhas e tentar novamente
            if (this.failedFiles.size > 0) {
                console.warn(`⚠️ ${this.failedFiles.size} arquivo(s) falharam ao carregar`);
                await this.retryFailedFiles();
            }
        }

        async loadFile(filePath) {
            if (this.loadedFiles.has(filePath)) {
                return;
            }

            const url = `https://raw.githubusercontent.com/${CONFIG.github.owner}/${CONFIG.github.repo}/${CONFIG.github.branch}/${filePath}`;

            try {
                const response = await this.fetchFile(url);
                await this.injectScript(response, filePath);
                this.loadedFiles.add(filePath);
                console.log(`✅ ${filePath}`);

            } catch (error) {
                this.failedFiles.add(filePath);
                const retries = this.retryCount.get(filePath) || 0;
                this.retryCount.set(filePath, retries + 1);
                console.error(`❌ Falha ao carregar ${filePath}:`, error.message);
                throw error;
            }
        }

        fetchFile(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: 15000,
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error('Erro de rede: ' + error));
                    },
                    ontimeout: function() {
                        reject(new Error('Timeout - Verifique sua conexão'));
                    }
                });
            });
        }

        async injectScript(code, filePath) {
            return new Promise((resolve, reject) => {
                try {
                    // Processar código para garantir exportação global
                    const processedCode = this.processCodeForGlobalExport(code, filePath);
                    
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.setAttribute('data-file', filePath);
                    script.setAttribute('data-timestamp', Date.now().toString());
                    
                    script.textContent = `
                        // Arquivo: ${filePath}
                        // Carregado: ${new Date().toLocaleString('pt-BR')}
                        // Servidor: ${this.serverInfo.domain}
                        
                        (function() {
                            'use strict';
                            try {
                                ${processedCode}
                                
                                // Log de sucesso específico para debug
                                console.log('📦 Arquivo ${filePath} executado com sucesso');
                                
                            } catch (error) {
                                console.error('❌ Erro ao executar ${filePath}:', error);
                                throw error;
                            }
                        })();
                    `;

                    let executed = false;
                    
                    script.onerror = (error) => {
                        if (!executed) {
                            executed = true;
                            console.error(`❌ Erro no script ${filePath}:`, error);
                            reject(error);
                        }
                    };
                    
                    script.onload = () => {
                        if (!executed) {
                            executed = true;
                            resolve();
                        }
                    };

                    document.head.appendChild(script);

                    // Aguardar execução e verificar se classe foi exportada
                    setTimeout(() => {
                        if (!executed) {
                            executed = true;
                            // Verificar após um delay adicional para garantir que a classe foi exportada
                            setTimeout(() => {
                                this.verifyClassExport(filePath);
                            }, 100);
                            resolve();
                        }
                    }, 500);

                } catch (error) {
                    console.error(`❌ Erro ao processar ${filePath}:`, error);
                    reject(error);
                }
            });
        }

        /**
         * Processa código para garantir exportação global correta
         */
        processCodeForGlobalExport(code, filePath) {
            let processedCode = code;
            
            // Remover exports ES6 problemáticos
            processedCode = processedCode.replace(/^\s*export\s+function\s+/gm, 'function ');
            processedCode = processedCode.replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, '');
            processedCode = processedCode.replace(/^\s*export\s+default\s+/gm, '');
            
            // Mapeamento específico de classes por arquivo
            const classExports = {
                'src/core/bot-core.js': ['TribalWarsBot'],
                'src/core/game-data.js': ['GameDataCollector'],
                'src/core/http-client.js': ['HttpClient'],
                'src/core/utils.js': ['BotUtils'],
                'src/modules/troops-collector.js': ['TroopsCollector'],
                'src/modules/attack-system.js': ['AttackSystem'],
                'src/modules/village-finder.js': ['VillageFinder'],
                'src/modules/distance-calculator.js': ['DistanceCalculator'],
                'src/modules/timing-controller.js': ['TimingController'],
                'src/ui/interface.js': ['BotInterface'],
                'src/ui/components.js': ['UIComponents'],
                'src/config/settings.js': ['BotSettings'],
                'src/config/unit-speeds.js': ['UnitSpeedCalculator'],
                'src/config/world-config.js': ['WorldConfig']
            };

            const classesToExport = classExports[filePath];
            
            if (classesToExport && classesToExport.length > 0) {
                let exportCode = '\n\n// === EXPORTAÇÃO GLOBAL FORÇADA ===\n';
                exportCode += '(function() {\n';
                exportCode += '    try {\n';
                
                classesToExport.forEach(className => {
                    exportCode += `        // Exportar ${className}\n`;
                    exportCode += `        if (typeof ${className} !== 'undefined') {\n`;
                    exportCode += `            window.${className} = ${className};\n`;
                    exportCode += `            console.log('✅ ${className} exportado para window');\n`;
                    exportCode += `        } else {\n`;
                    exportCode += `            console.warn('⚠️ ${className} não encontrado para exportação');\n`;
                    exportCode += `        }\n`;
                });
                
                exportCode += '    } catch (error) {\n';
                exportCode += `        console.error('❌ Erro na exportação de ${filePath}:', error);\n`;
                exportCode += '    }\n';
                exportCode += '})();\n';
                
                processedCode += exportCode;
                
                // Registrar classes esperadas
                classesToExport.forEach(className => {
                    this.globalClasses.set(className, { file: filePath, loaded: false });
                });
            }

            return processedCode;
        }

        /**
         * Verifica se as classes foram exportadas corretamente
         */
        verifyClassExport(filePath, retryCount = 0) {
            const classExports = {
                'src/core/bot-core.js': ['TribalWarsBot'],
                'src/core/game-data.js': ['GameDataCollector'],
                'src/core/http-client.js': ['HttpClient'],
                'src/core/utils.js': ['BotUtils'],
                'src/modules/troops-collector.js': ['TroopsCollector'],
                'src/modules/attack-system.js': ['AttackSystem'],
                'src/modules/village-finder.js': ['VillageFinder'],
                'src/modules/distance-calculator.js': ['DistanceCalculator'],
                'src/modules/timing-controller.js': ['TimingController'],
                'src/ui/interface.js': ['BotInterface'],
                'src/ui/components.js': ['UIComponents'],
                'src/config/settings.js': ['BotSettings'],
                'src/config/unit-speeds.js': ['UnitSpeedCalculator'],
                'src/config/world-config.js': ['WorldConfig']
            };

            const expectedClasses = classExports[filePath];
            if (expectedClasses) {
                let allFound = true;
                expectedClasses.forEach(className => {
                    if (window[className]) {
                        this.globalClasses.set(className, { file: filePath, loaded: true });
                        console.log(`🔍 Verificado: ${className} disponível em window`);
                    } else {
                        allFound = false;
                        if (retryCount < 3) {
                            // Tentar novamente após um delay
                            setTimeout(() => {
                                this.verifyClassExport(filePath, retryCount + 1);
                            }, 200 * (retryCount + 1));
                            return;
                        } else {
                            console.warn(`⚠️ Classe ${className} não encontrada em window após carregar ${filePath} (${retryCount + 1} tentativas)`);
                        }
                    }
                });
                
                if (allFound) {
                    console.log(`✅ Todas as classes de ${filePath} verificadas com sucesso`);
                }
            }
        }

        async retryFailedFiles() {
            const toRetry = Array.from(this.failedFiles).filter(file => {
                const retries = this.retryCount.get(file) || 0;
                return retries < this.maxRetries;
            });

            if (toRetry.length === 0) return;

            console.log(`🔄 Tentando recarregar ${toRetry.length} arquivos...`);

            for (const file of toRetry) {
                try {
                    await this.loadFile(file);
                    this.failedFiles.delete(file);
                } catch (error) {
                    console.error(`❌ Falha na retry de ${file}`);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        async loadDependencies() {
            if (!window.jQuery) {
                throw new Error('jQuery não carregado');
            }
            console.log('📚 Dependências carregadas');
        }

        async initializeBot() {
            console.log('⏳ Iniciando verificação de classes...');
            
            // Lista de classes essenciais
            const requiredClasses = [
                'TribalWarsBot',
                'GameDataCollector', 
                'HttpClient',
                'TroopsCollector',
                'AttackSystem',
                'VillageFinder',
                'DistanceCalculator',
                'TimingController',
                'BotInterface'
            ];

            // Aguardar classes com timeout mais longo e melhor feedback
            let maxAttempts = 200; // 20 segundos
            let attempts = 0;
            
            while (attempts < maxAttempts) {
                const missingClasses = requiredClasses.filter(className => !window[className]);
                
                if (missingClasses.length === 0) {
                    console.log('✅ Todas as classes carregadas com sucesso!');
                    break;
                }
                
                // Feedback mais frequente
                if (attempts % 20 === 0) { // A cada 2 segundos
                    console.log(`⏳ Aguardando classes (${attempts/10}s): ${missingClasses.join(', ')}`);
                }
                
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Verificação final e relatório detalhado
            const finalStatus = this.generateClassLoadReport(requiredClasses);
            console.log('📊 Relatório de carregamento:', finalStatus);
            
            if (!window.TribalWarsBot) {
                // Tentar forçar carregamento da classe principal
                console.log('🔄 Tentando forçar carregamento do TribalWarsBot...');
                await this.emergencyLoadTribalWarsBot();
            }

            if (window.TribalWarsBot) {
                // Inicializar bot com configurações brasileiras
                window.twBot = new window.TribalWarsBot({
                    locale: 'pt-BR',
                    serverInfo: this.serverInfo,
                    brasilConfig: BRASIL_CONFIG
                });

                console.log(BRASIL_CONFIG.messages.botInitialized);
                console.log(`🌍 Mundo ${this.serverInfo.worldNumber} - ${this.serverInfo.domain}`);

            } else {
                throw new Error('TribalWarsBot ainda não disponível após todas as tentativas');
            }
        }

        /**
         * Gera relatório detalhado do status das classes
         */
        generateClassLoadReport(requiredClasses) {
            const report = {
                loaded: [],
                missing: [],
                total: requiredClasses.length
            };

            requiredClasses.forEach(className => {
                if (window[className]) {
                    report.loaded.push(className);
                } else {
                    report.missing.push(className);
                }
            });

            report.loadRate = `${report.loaded.length}/${report.total} (${Math.round(report.loaded.length/report.total*100)}%)`;
            
            return report;
        }

        /**
         * Carregamento de emergência do TribalWarsBot
         */
        async emergencyLoadTribalWarsBot() {
            try {
                const botCoreCode = `
                class TribalWarsBot {
                    constructor(config = {}) {
                        this.version = '2.0.1-emergency';
                        this.config = config;
                        this.modules = new Map();
                        this.ui = null;
                        
                        console.log('🚨 TribalWarsBot carregado em modo emergência');
                        this.initEmergencyMode();
                    }
                    
                    initEmergencyMode() {
                        // Inicialização básica
                        console.log('🏰 BOT-TWB Brasil v' + this.version + ' (Modo Emergência)');
                        
                        // Tentar carregar interface básica
                        setTimeout(() => this.createBasicInterface(), 1000);
                    }
                    
                    createBasicInterface() {
                        if (window.BotInterface) {
                            try {
                                this.ui = new window.BotInterface(this);
                                this.ui.create();
                                console.log('✅ Interface carregada');
                            } catch (error) {
                                console.warn('⚠️ Erro ao carregar interface:', error);
                                this.createFallbackInterface();
                            }
                        } else {
                            this.createFallbackInterface();
                        }
                    }
                    
                    createFallbackInterface() {
                        // Interface de emergência mínima
                        const btn = document.createElement('button');
                        btn.innerHTML = '🏰 Bot (Emergency)';
                        btn.style.cssText = \`
                            position: fixed;
                            top: 100px;
                            right: 20px;
                            z-index: 9999;
                            padding: 10px;
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        \`;
                        btn.onclick = () => {
                            alert('🚨 Bot em modo emergência\\n\\nAlgumas funcionalidades podem não estar disponíveis.\\nTente recarregar a página.');
                        };
                        document.body.appendChild(btn);
                        
                        console.log('⚠️ Interface de emergência criada');
                    }
                    
                    getModule(name) {
                        return this.modules.get(name);
                    }
                    
                    registerModule(name, module) {
                        this.modules.set(name, module);
                        console.log('📦 Módulo registrado:', name);
                    }
                }
                
                // Exportar imediatamente
                window.TribalWarsBot = TribalWarsBot;
                console.log('✅ TribalWarsBot de emergência carregado');
                `;

                // Injetar código de emergência
                const script = document.createElement('script');
                script.textContent = botCoreCode;
                document.head.appendChild(script);
                
                // Aguardar um pouco
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return window.TribalWarsBot !== undefined;
                
            } catch (error) {
                console.error('❌ Falha no carregamento de emergência:', error);
                return false;
            }
        }

        async checkForUpdates() {
            try {
                const savedVersion = GM_getValue('bot_version_brasil', '0.0.0');
                if (savedVersion !== CONFIG.version) {
                    console.log(`🔄 Atualizando de v${savedVersion} para v${CONFIG.version}`);
                    GM_setValue('bot_version_brasil', CONFIG.version);
                    this.clearCache();
                }
            } catch (error) {
                console.warn('⚠️ Não foi possível verificar atualizações:', error);
            }
        }

        clearCache() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('twbot-br-') || key.startsWith('twbot-brasil-')) {
                    localStorage.removeItem(key);
                }
            });
            console.log(BRASIL_CONFIG.messages.cacheCleared);
        }

        showSuccessNotification() {
            if (typeof GM_notification !== 'undefined') {
                GM_notification({
                    title: '🏰 BOT-TWB Brasil',
                    text: `Bot carregado com sucesso!\\nMundo ${this.serverInfo.worldNumber} - Clique no botão 🏰 para abrir.`,
                    timeout: 8000,
                    onclick: () => {
                        if (window.twBot && window.twBot.ui) {
                            window.twBot.ui.show();
                        }
                    }
                });
            }
        }

        showErrorNotification(message) {
            if (typeof GM_notification !== 'undefined') {
                GM_notification({
                    title: '❌ BOT-TWB Brasil - Erro',
                    text: `Falha ao carregar: ${message}\\nVerifique sua conexão e tente recarregar a página.`,
                    timeout: 15000
                });
            }
        }
    }

    // Debug aprimorado
    window.TWBBrasilDebug = {
        loader: null,

        reload: function() {
            location.reload();
        },

        clearCache: function() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('twbot-')) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🧹 Cache limpo');
        },

        version: function() {
            console.log(`BOT-TWB Brasil v${CONFIG.version}`);
            return CONFIG.version;
        },

        verificarClasses: function() {
            const classes = [
                'TribalWarsBot', 'GameDataCollector', 'HttpClient', 'BotUtils',
                'TroopsCollector', 'AttackSystem', 'VillageFinder', 
                'DistanceCalculator', 'TimingController', 'BotInterface',
                'UIComponents', 'BotSettings', 'UnitSpeedCalculator', 'WorldConfig'
            ];

            console.log('🔍 Verificando classes globais:');
            const status = {};
            classes.forEach(className => {
                const exists = !!window[className];
                status[className] = exists;
                const icon = exists ? '✅' : '❌';
                console.log(`${icon} ${className}: ${exists ? 'Disponível' : 'Não encontrada'}`);
            });

            return status;
        },

        status: function() {
            const loader = window.TWBBrasilDebug.loader;
            return {
                loaded: !!window.twBot,
                version: CONFIG.version,
                server: loader ? loader.serverInfo : 'N/A',
                files: loader ? {
                    loaded: loader.loadedFiles.size,
                    failed: loader.failedFiles.size,
                    total: CONFIG.files.length
                } : 'N/A',
                classes: this.verificarClasses()
            };
        },

        forceReload: async function() {
            console.log('🔄 Forçando recarregamento do bot...');
            if (window.TWBBrasilDebug.loader) {
                try {
                    await window.TWBBrasilDebug.loader.start();
                } catch (error) {
                    console.error('❌ Erro no recarregamento forçado:', error);
                }
            } else {
                console.error('❌ Loader não disponível');
            }
        }
    };

    // Verificar se já está carregado
    if (window.twBotBrasilLoaded) {
        console.log('⚠️ BOT-TWB Brasil já está carregado');
        return;
    }

    window.twBotBrasilLoaded = true;

    // Inicializar
    const loader = new BotLoaderBrasil();
    window.TWBBrasilDebug.loader = loader;

    console.log(`🏰 BOT-TWB Brasil v${CONFIG.version} ativo`);
    console.log('🇧🇷 Otimizado para servidores brasileiros e portugueses');

})();