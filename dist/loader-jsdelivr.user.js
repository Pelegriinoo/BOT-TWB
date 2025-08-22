// ==UserScript==
// @name         BOT-TWB Loader - jsDelivr CDN ONLY
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.1.0
// @description  Loader otimizado - USA APENAS jsDelivr CDN (funciona sempre!)
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/Pelegriinoo/BOT-TWB@main/dist/loader-jsdelivr.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/Pelegriinoo/BOT-TWB@main/dist/loader-jsdelivr.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    const LOADER_CONFIG = {
        baseUrl: 'https://cdn.jsdelivr.net/gh/Pelegriinoo/BOT-TWB@main/dist/modules/',
        version: '2.1.0'
    };

    const MODULES = [
        'constants.js', 'api.js', 'auth.js', 'troops.js', 'utils.js',
        'attack-system.js', 'troop-counter.js', 'village-manager.js',
        'ui-components.js', 'main-interface.js', 'system.js'
    ];

    async function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function loadAllModules() {
        console.log('🚀 BOT-TWB Loader jsDelivr v2.1.0');
        
        try {
            for (const module of MODULES) {
                await loadScript(LOADER_CONFIG.baseUrl + module);
                console.log(`✅ ${module}`);
            }
            console.log('🎉 BOT-TWB carregado via jsDelivr!');
        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    if (window.location.pathname.includes('game.php')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllModules);
        } else {
            loadAllModules();
        }
    }
})();
