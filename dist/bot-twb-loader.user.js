// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.1.0
// @description  Sistema modular para Tribal Wars - Loader
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.plemiona.pl/game.php*
// @match        https://*.tribals.it/game.php*
// @match        https://*.guerretribali.it/game.php*
// @match        https://*.vojnaplemen.si/game.php*
// @grant        none
// @updateURL    https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb-loader.user.js
// @downloadURL  https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb-loader.user.js
// @supportURL   https://github.com/Pelegriinoo/BOT-TWB/issues
// @homepageURL  https://github.com/Pelegriinoo/BOT-TWB
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🏰 BOT-TWB Loader v2.1.0 - Iniciando...');
    
    // Configuração do loader
    const CONFIG = {
        baseUrl: 'https://Pelegriinoo.github.io/BOT-TWB',
        version: '2.1.0',
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
    
    // Cache dos módulos carregados
    const moduleCache = new Map();
    
    /**
     * Carrega um módulo remotamente
     */
    async function loadModule(modulePath) {
        if (moduleCache.has(modulePath)) {
            return moduleCache.get(modulePath);
        }
        
        try {
            const url = `${CONFIG.baseUrl}/dist/modules/${modulePath}?v=${CONFIG.version}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const code = await response.text();
            
            // Executa o módulo no contexto global
            const script = document.createElement('script');
            script.textContent = code;
            document.head.appendChild(script);
            document.head.removeChild(script);
            
            moduleCache.set(modulePath, true);
            return true;
            
        } catch (error) {
            console.error(`❌ Erro ao carregar módulo ${modulePath}:`, error);
            return false;
        }
    }
    
    /**
     * Carrega todos os módulos sequencialmente
     */
    async function loadAllModules() {
        console.log('📦 Carregando módulos...');
        
        for (const module of CONFIG.modules) {
            const success = await loadModule(module);
            if (success) {
                console.log(`✅ ${module}`);
            } else {
                console.error(`❌ Falha ao carregar ${module}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Verifica se está na página correta do jogo
     */
    function isGamePage() {
        return window.location.pathname.includes('game.php') && 
               document.querySelector('#content_value') !== null;
    }
    
    /**
     * Inicialização principal
     */
    async function init() {
        if (!isGamePage()) {
            console.log('⏳ Aguardando página do jogo...');
            setTimeout(init, 1000);
            return;
        }
        
        console.log('🎮 Página do jogo detectada');
        
        const success = await loadAllModules();
        if (success) {
            console.log('🚀 BOT-TWB carregado com sucesso!');
            
            // Inicializa o sistema principal (será definido nos módulos carregados)
            if (window.TWBSystem) {
                const twb = new window.TWBSystem();
                await twb.init();
            }
        } else {
            console.error('💥 Falha no carregamento dos módulos');
        }
    }
    
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
})();
