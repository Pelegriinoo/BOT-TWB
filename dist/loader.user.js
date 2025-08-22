// ==UserScript==
// @name         BOT-TWB Loader - Minimal Script Loader
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.0
// @description  Carregador mínimo para o sistema BOT-TWB - Importa módulos remotamente
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.plemiona.pl/game.php*
// @match        https://*.tribals.it/game.php*
// @match        https://*.guerretribali.it/game.php*
// @match        https://*.vojnaplemen.si/game.php*
// @grant        none
// @updateURL    https://Pelegriinoo.github.io/BOT-TWB/dist/loader.user.js
// @downloadURL  https://Pelegriinoo.github.io/BOT-TWB/dist/loader.user.js
// @supportURL   https://github.com/Pelegriinoo/BOT-TWB/issues
// @homepageURL  https://github.com/Pelegriinoo/BOT-TWB
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🚀 BOT-TWB Loader v2.0.0 - Iniciando...');
    
    // Configuração do loader
    const LOADER_CONFIG = {
        baseUrl: 'https://Pelegriinoo.github.io/BOT-TWB/modules/',
        version: '2.0.0',
        timeout: 15000, // 15 segundos
        retries: 3
    };

    // Módulos para carregar em ordem
    const MODULES = [
        'constants.js',
        'api.js', 
        'auth.js',
        'troops.js',
        'utils.js',
        'attack-system.js',
        'troop-counter.js',
        'village-manager.js',
        'ui-components.js',
        'main-interface.js',
        'system.js'
    ];

    /**
     * Carrega um script remoto
     */
    async function loadScript(url, retries = LOADER_CONFIG.retries) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`Timeout ao carregar: ${url}`));
            }, LOADER_CONFIG.timeout);

            script.onload = () => {
                clearTimeout(timeout);
                console.log(`✅ Carregado: ${url.split('/').pop()}`);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeout);
                script.remove();
                
                if (retries > 0) {
                    console.warn(`⚠️ Erro ao carregar ${url}, tentando novamente... (${retries} tentativas restantes)`);
                    setTimeout(() => {
                        loadScript(url, retries - 1).then(resolve).catch(reject);
                    }, 1000);
                } else {
                    reject(new Error(`Falha ao carregar: ${url}`));
                }
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Carrega todos os módulos
     */
    async function loadAllModules() {
        const loadingIndicator = createLoadingIndicator();
        
        try {
            console.log('📦 Carregando módulos do BOT-TWB...');
            
            for (let i = 0; i < MODULES.length; i++) {
                const module = MODULES[i];
                const url = LOADER_CONFIG.baseUrl + module;
                
                updateLoadingProgress(loadingIndicator, i, MODULES.length, module);
                
                await loadScript(url);
                
                // Pequeno delay para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            updateLoadingProgress(loadingIndicator, MODULES.length, MODULES.length, 'Concluído');
            
            // Aguardar um pouco antes de remover
            setTimeout(() => {
                loadingIndicator.remove();
                showSuccessMessage();
            }, 1000);
            
            console.log('🎉 Todos os módulos carregados com sucesso!');
            
        } catch (error) {
            console.error('💥 Erro ao carregar módulos:', error);
            loadingIndicator.remove();
            showErrorMessage(error.message);
        }
    }

    /**
     * Cria indicador de carregamento
     */
    function createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'twb-loading';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
            padding: 15px;
            background: linear-gradient(135deg, #2c1810 0%, #3d2817 100%);
            border: 2px solid #d4af37;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #d4af37;
            font-size: 12px;
        `;
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 14px; font-weight: bold;">🏰 BOT-TWB</div>
                <div style="margin-left: auto; font-size: 10px;">v${LOADER_CONFIG.version}</div>
            </div>
            <div style="margin-bottom: 8px;">Carregando módulos...</div>
            <div style="background: #1a0f08; border: 1px solid #8b6914; border-radius: 4px; height: 8px; overflow: hidden;">
                <div id="twb-progress" style="background: #d4af37; height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="twb-status" style="margin-top: 8px; font-size: 10px; color: #8b6914;">Preparando...</div>
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }

    /**
     * Atualiza progresso de carregamento
     */
    function updateLoadingProgress(indicator, current, total, currentModule) {
        const progress = (current / total) * 100;
        const progressBar = indicator.querySelector('#twb-progress');
        const status = indicator.querySelector('#twb-status');
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (status) {
            if (current === total) {
                status.textContent = '✅ Carregamento concluído!';
                status.style.color = '#8fbc8f';
            } else {
                status.textContent = `📦 ${currentModule} (${current}/${total})`;
            }
        }
    }

    /**
     * Mostra mensagem de sucesso
     */
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            background: linear-gradient(135deg, #2d5a2d, #3a6b3a);
            color: white;
            border: 2px solid #4a8a4a;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        `;
        
        message.innerHTML = `
            🏰 <strong>BOT-TWB v${LOADER_CONFIG.version}</strong> carregado!<br>
            <small>Pressione Ctrl+Shift+T para abrir a interface</small>
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 4000);
    }

    /**
     * Mostra mensagem de erro
     */
    function showErrorMessage(error) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            background: linear-gradient(135deg, #5a2d2d, #6b3a3a);
            color: white;
            border: 2px solid #8a4a4a;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        `;
        
        message.innerHTML = `
            ❌ <strong>Erro ao carregar BOT-TWB</strong><br>
            <small>${error}</small><br>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 8px; padding: 4px 8px; background: #8a4a4a; 
                color: white; border: none; border-radius: 4px; cursor: pointer;
            ">Fechar</button>
        `;
        
        document.body.appendChild(message);
    }

    /**
     * Verifica se está no jogo
     */
    function isInGame() {
        return window.location.pathname.includes('game.php') && 
               document.querySelector('#content_value');
    }

    /**
     * Inicialização principal
     */
    function init() {
        if (!isInGame()) {
            console.log('⏭️ TWB Loader: Não está na página do jogo, pulando carregamento');
            return;
        }

        // Aguardar carregamento básico da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(loadAllModules, 500);
            });
        } else {
            setTimeout(loadAllModules, 500);
        }
    }

    // Expor loader no window para debug
    window.TWBLoader = {
        version: LOADER_CONFIG.version,
        reload: loadAllModules,
        config: LOADER_CONFIG
    };

    // Iniciar
    init();

})();
