// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.0
// @description  Sistema completo de automação para Tribal Wars
// @author       Pelegrino
// @match        *://*.tribalwars.*/*
// @match        *://*.tribos.*/*
// @match        *://*.tribal.wars*/*
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
    
    console.log('🏰 BOT-TWB Loader iniciando...');
    
    // Configurações
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
            'src/config/unit-speeds.js'
        ],
        version: '2.0.0',
        checkInterval: 30000 // 30 segundos
    };

    class BotLoader {
        constructor() {
            this.loadedFiles = new Set();
            this.failedFiles = new Set();
            this.retryCount = new Map();
            this.maxRetries = 3;
            
            this.init();
        }

        async init() {
            // Verificar se está no Tribal Wars
            if (!this.isTribalWars()) {
                console.log('❌ BOT-TWB: Não está no Tribal Wars');
                return;
            }

            // Aguardar carregamento da página
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        isTribalWars() {
            return window.location.hostname.includes('tribalwars') || 
                   window.location.hostname.includes('tribos') ||
                   window.location.hostname.includes('tribal');
        }

        async start() {
            console.log('🚀 Iniciando carregamento do BOT-TWB...');
            
            try {
                // Verificar versão
                await this.checkForUpdates();
                
                // Carregar dependências
                await this.loadDependencies();
                
                // Carregar arquivos do bot
                await this.loadBotFiles();
                
                // Inicializar bot
                await this.initializeBot();
                
                console.log('✅ BOT-TWB carregado com sucesso!');
                this.showSuccessNotification();
                
            } catch (error) {
                console.error('❌ Erro ao carregar BOT-TWB:', error);
                this.showErrorNotification(error.message);
            }
        }

        async loadBotFiles() {
            console.log('📦 Carregando arquivos do GitHub...');
            
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
                    timeout: 10000,
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
                        reject(new Error('Timeout'));
                    }
                });
            });
        }

        async injectScript(code, filePath) {
            return new Promise((resolve, reject) => {
                try {
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = `
                        // Arquivo: ${filePath}
                        // Carregado em: ${new Date().toISOString()}
                        ${code}
                    `;
                    
                    script.onerror = (error) => reject(error);
                    script.onload = () => resolve();
                    
                    document.head.appendChild(script);
                    
                    // Resolve imediatamente se não há onload
                    setTimeout(resolve, 100);
                    
                } catch (error) {
                    reject(error);
                }
            });
        }

        async retryFailedFiles() {
            const toRetry = Array.from(this.failedFiles).filter(file => {
                const retries = this.retryCount.get(file) || 0;
                return retries < this.maxRetries;
            });

            if (toRetry.length === 0) return;

            console.log(`🔄 Tentando recarregar ${toRetry.length} arquivo(s)...`);
            
            for (const file of toRetry) {
                try {
                    await this.loadFile(file);
                    this.failedFiles.delete(file);
                } catch (error) {
                    console.error(`❌ Falha na retry de ${file}`);
                }
                
                // Pequeno delay entre tentativas
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        async loadDependencies() {
            // jQuery já está carregado via @require
            
            // Carregar outras dependências se necessário
            if (!window.jQuery) {
                throw new Error('jQuery não carregado');
            }
            
            console.log('📚 Dependências carregadas');
        }

        async initializeBot() {
            // Aguardar um pouco para garantir que todos os scripts foram executados
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (typeof window.TribalWarsBot !== 'undefined') {
                window.twBot = new window.TribalWarsBot();
                console.log('🤖 Bot inicializado');
            } else {
                throw new Error('Classe TribalWarsBot não encontrada');
            }
        }

        async checkForUpdates() {
            try {
                const savedVersion = GM_getValue('bot_version', '0.0.0');
                
                if (savedVersion !== CONFIG.version) {
                    console.log(`🔄 Atualizando de v${savedVersion} para v${CONFIG.version}`);
                    GM_setValue('bot_version', CONFIG.version);
                    
                    // Limpar cache se necessário
                    this.clearCache();
                }
                
            } catch (error) {
                console.warn('⚠️ Não foi possível verificar atualizações:', error);
            }
        }

        clearCache() {
            // Limpar dados antigos se houver mudança de versão
            console.log('🧹 Limpando cache...');
        }

        showSuccessNotification() {
            if (typeof GM_notification !== 'undefined') {
                GM_notification({
                    title: '🏰 BOT-TWB',
                    text: 'Bot carregado com sucesso!\nClique no botão flutuante para abrir.',
                    timeout: 5000,
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
                    title: '❌ BOT-TWB - Erro',
                    text: `Falha ao carregar: ${message}`,
                    timeout: 10000
                });
            }
        }
    }

    // Auto-updater - verifica atualizações periodicamente
    class AutoUpdater {
        constructor() {
            this.checkInterval = CONFIG.checkInterval;
            this.start();
        }

        start() {
            setInterval(() => this.checkForUpdates(), this.checkInterval);
        }

        async checkForUpdates() {
            try {
                const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/releases/latest`;
                
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: function(response) {
                        if (response.status === 200) {
                            const release = JSON.parse(response.responseText);
                            const latestVersion = release.tag_name.replace('v', '');
                            
                            if (latestVersion !== CONFIG.version) {
                                GM_notification({
                                    title: '🔄 BOT-TWB - Nova Versão',
                                    text: `Versão ${latestVersion} disponível!\nClique para atualizar.`,
                                    timeout: 0,
                                    onclick: () => {
                                        window.open(release.html_url, '_blank');
                                    }
                                });
                            }
                        }
                    }
                });
                
            } catch (error) {
                console.warn('⚠️ Erro ao verificar atualizações:', error);
            }
        }
    }

    // Utilitários para debug e desenvolvimento
    window.TWBDebug = {
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
            console.log(`BOT-TWB v${CONFIG.version}`);
            return CONFIG.version;
        },
        
        status: function() {
            return {
                loaded: window.twBot ? 'Sim' : 'Não',
                version: CONFIG.version,
                files: window.TWBDebug.loader ? {
                    loaded: window.TWBDebug.loader.loadedFiles.size,
                    failed: window.TWBDebug.loader.failedFiles.size
                } : 'N/A'
            };
        }
    };

    // Inicializar
    const loader = new BotLoader();
    const updater = new AutoUpdater();
    
    window.TWBDebug.loader = loader;
    
    console.log('🏰 BOT-TWB Loader v' + CONFIG.version + ' ativo');
})();