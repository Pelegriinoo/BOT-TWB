// ==UserScript==
// @name         BOT-TWB - Sistema de Bot para Tribal Wars Brasil
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.0
// @description  Sistema completo de automação para Tribal Wars Brasil - Otimizado para servidores brasileiros
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
        version: '2.0.0-BR',
        checkInterval: 30000, // 30 segundos
        locale: 'pt-BR',
        serverType: 'brasil'
    };

    // Configurações específicas para o Brasil
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

            this.init();
        }

        /**
         * Detecta informações específicas do servidor brasileiro
         */
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

        /**
         * Extrai número do mundo da URL
         */
        extractWorldNumber(hostname) {
            const match = hostname.match(/br(\d+)|mundo(\d+)|(\d+)/);
            return match ? (match[1] || match[2] || match[3]) : 'desconhecido';
        }

        async init() {
            // Verificar se está no Tribal Wars Brasil/Portugal
            if (!this.isTribalWarsBrasil()) {
                console.log(BRASIL_CONFIG.messages.notTribalWars);
                return;
            }

            // Aguardar carregamento da página
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
                // Configurar idioma
                this.setupLocale();

                // Verificar versão
                await this.checkForUpdates();

                // Carregar dependências
                await this.loadDependencies();

                // Carregar arquivos do bot
                await this.loadBotFiles();

                // Inicializar bot com configurações brasileiras
                await this.initializeBot();

                console.log(BRASIL_CONFIG.messages.success);
                this.showSuccessNotification();

            } catch (error) {
                console.error(BRASIL_CONFIG.messages.error + ':', error);
                this.showErrorNotification(error.message);
            }
        }

        /**
         * Configura idioma e formatações brasileiras
         */
        setupLocale() {
            // Configurar formatações brasileiras
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

            const promises = CONFIG.files.map(file => this.loadFile(file));
            const results = await Promise.allSettled(promises);

            // Verificar falhas
            const failed = results.filter(result => result.status === 'rejected');
            if (failed.length > 0) {
                console.warn(`⚠️ ${failed.length} arquivo(s) falharam ao carregar`);

                // Tentar novamente arquivos que falharam
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
                    timeout: 15000, // 15 segundos - conexões do Brasil podem ser mais lentas
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
                    // Converter exports ES6 para compatibilidade com userscripts
                    const processedCode = this.processES6Code(code, filePath);
                    
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = `
                        // Arquivo: ${filePath}
                        // Carregado em: ${new Date().toLocaleString('pt-BR')}
                        // Servidor: ${this.serverInfo.domain} (Mundo ${this.serverInfo.worldNumber})
                        
                        try {
                            ${processedCode}
                        } catch (error) {
                            console.error('❌ Erro ao executar ${filePath}:', error);
                            throw error;
                        }
                    `;

                    script.onerror = (error) => {
                        console.error(`❌ Erro ao carregar script ${filePath}:`, error);
                        reject(error);
                    };
                    
                    script.onload = () => resolve();

                    document.head.appendChild(script);

                    // Resolve imediatamente para scripts inline
                    setTimeout(resolve, 100);

                } catch (error) {
                    console.error(`❌ Erro ao processar ${filePath}:`, error);
                    reject(error);
                }
            });
        }

        /**
         * Processa código ES6 para compatibilidade
         */
        processES6Code(code, filePath) {
            // Remover exports ES6 simples que causam erros
            let processedCode = code;
            
            // Remover linhas que começam com export function
            processedCode = processedCode.replace(/^\s*export\s+function\s+/gm, 'function ');
            
            // Remover outras declarações export problemáticas
            processedCode = processedCode.replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, '');
            processedCode = processedCode.replace(/^\s*export\s+default\s+/gm, '');
            
            return processedCode;
        }

        async retryFailedFiles() {
            const toRetry = Array.from(this.failedFiles).filter(file => {
                const retries = this.retryCount.get(file) || 0;
                return retries < this.maxRetries;
            });

            if (toRetry.length === 0) return;

            console.log(BRASIL_CONFIG.messages.retrying.replace('{}', toRetry.length));

            for (const file of toRetry) {
                try {
                    await this.loadFile(file);
                    this.failedFiles.delete(file);
                } catch (error) {
                    console.error(`❌ Falha na retry de ${file}`);
                }

                // Delay maior para conexões brasileiras
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        async loadDependencies() {
            // jQuery já está carregado via @require
            if (!window.jQuery) {
                throw new Error('jQuery não carregado');
            }

            console.log('📚 Dependências carregadas');
        }

        async initializeBot() {
            // Aguardar que todos os módulos sejam carregados
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verificar se todas as dependências estão disponíveis
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

            const missingClasses = requiredClasses.filter(className => !window[className]);
            
            if (missingClasses.length > 0) {
                console.warn('⚠️ Algumas classes não foram carregadas:', missingClasses);
                // Tentar mesmo assim
            }

            if (typeof window.TribalWarsBot !== 'undefined') {
                // Configurar bot com informações do servidor brasileiro
                window.twBot = new window.TribalWarsBot({
                    locale: 'pt-BR',
                    serverInfo: this.serverInfo,
                    brasilConfig: BRASIL_CONFIG
                });

                console.log(BRASIL_CONFIG.messages.botInitialized);
                console.log(`🌍 Mundo ${this.serverInfo.worldNumber} - ${this.serverInfo.domain}`);

            } else {
                throw new Error('Classe TribalWarsBot não encontrada');
            }
        }

        async checkForUpdates() {
            try {
                const savedVersion = GM_getValue('bot_version_brasil', '0.0.0');

                if (savedVersion !== CONFIG.version) {
                    console.log(`🔄 Atualizando de v${savedVersion} para v${CONFIG.version}`);
                    GM_setValue('bot_version_brasil', CONFIG.version);

                    // Limpar cache se necessário
                    this.clearCache();
                }

            } catch (error) {
                console.warn('⚠️ Não foi possível verificar atualizações:', error);
            }
        }

        clearCache() {
            // Limpar dados antigos específicos do Brasil
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
                    text: `Bot carregado com sucesso!\nMundo ${this.serverInfo.worldNumber} - Clique no botão 🏰 para abrir.`,
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
                    text: `Falha ao carregar: ${message}\nVerifique sua conexão e tente recarregar a página.`,
                    timeout: 15000
                });
            }
        }
    }

    // Auto-updater para versão brasileira
    class AutoUpdaterBrasil {
        constructor() {
            this.checkInterval = CONFIG.checkInterval;
            this.start();
        }

        start() {
            // Verificar atualizações com menos frequência para economizar dados
            setInterval(() => this.checkForUpdates(), this.checkInterval * 2);
        }

        async checkForUpdates() {
            try {
                const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/releases/latest`;

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: 10000,
                    onload: function(response) {
                        if (response.status === 200) {
                            const release = JSON.parse(response.responseText);
                            const latestVersion = release.tag_name.replace('v', '');

                            if (latestVersion !== CONFIG.version.replace('-BR', '')) {
                                GM_notification({
                                    title: BRASIL_CONFIG.messages.updateAvailable,
                                    text: `Nova versão ${latestVersion} disponível para o Brasil!\nClique para ver as novidades.`,
                                    timeout: 0,
                                    onclick: () => {
                                        window.open(release.html_url, '_blank');
                                    }
                                });
                            }
                        }
                    },
                    onerror: function() {
                        // Silenciar erros de update check para não incomodar
                    }
                });

            } catch (error) {
                // Silenciar erros de update check
            }
        }
    }

    // Utilitários para debug específicos do Brasil
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
            console.log(BRASIL_CONFIG.messages.cacheCleared);
        },

        version: function() {
            console.log(`BOT-TWB Brasil v${CONFIG.version}`);
            return CONFIG.version;
        },

        serverInfo: function() {
            return window.TWBBrasilDebug.loader ?
                   window.TWBBrasilDebug.loader.serverInfo :
                   'Loader não disponível';
        },

        status: function() {
            return {
                loaded: window.twBot ? 'Sim' : 'Não',
                version: CONFIG.version,
                servidor: window.TWBBrasilDebug.serverInfo(),
                files: window.TWBBrasilDebug.loader ? {
                    loaded: window.TWBBrasilDebug.loader.loadedFiles.size,
                    failed: window.TWBBrasilDebug.loader.failedFiles.size
                } : 'N/A'
            };
        },

        // Comandos específicos para o Brasil
        testarConexao: function() {
            console.log('🔗 Testando conexão com GitHub...');
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/README.md',
                timeout: 5000,
                onload: (response) => {
                    console.log('✅ Conexão OK - Status:', response.status);
                },
                onerror: () => {
                    console.log('❌ Erro de conexão - Verifique sua internet');
                },
                ontimeout: () => {
                    console.log('⏱️ Timeout - Conexão lenta');
                }
            });
        }
    };

    // Verificar se já existe uma instância rodando
    if (window.twBotBrasilLoaded) {
        console.log('⚠️ BOT-TWB Brasil já está carregado');
        return;
    }

    // Marcar como carregado
    window.twBotBrasilLoaded = true;

    // Inicializar
    const loader = new BotLoaderBrasil();
    const updater = new AutoUpdaterBrasil();

    window.TWBBrasilDebug.loader = loader;

    console.log(`🏰 BOT-TWB Brasil v${CONFIG.version} ativo`);
    console.log('🇧🇷 Otimizado para servidores brasileiros e portugueses');
})();