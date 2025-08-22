// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.1.0
// @description  Sistema modular para Tribal Wars - Loader Híbrido
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.plemiona.pl/game.php*
// @match        https://*.tribals.it/game.php*
// @match        https://*.guerretribali.it/game.php*
// @match        https://*.vojnaplemen.si/game.php*
// @grant        GM_xmlhttpRequest
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
        remoteBaseUrl: 'https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/dist/modules',
        githubPagesUrl: 'https://Pelegriinoo.github.io/BOT-TWB/dist/modules',
        version: '2.1.0',
        useLocalFallback: true,
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
     * Faz requisição com Tampermonkey (bypass CORS)
     */
    function fetchWithTampermonkey(url) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve({ ok: true, text: () => Promise.resolve(response.responseText) });
                        } else {
                            reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error('Network error'));
                    }
                });
            } else {
                // Fallback para fetch normal
                fetch(url).then(resolve).catch(reject);
            }
        });
    }
    
    /**
     * Carrega um módulo com múltiplas tentativas
     */
    async function loadModule(modulePath) {
        if (moduleCache.has(modulePath)) {
            return moduleCache.get(modulePath);
        }
        
        const urls = [
            `${CONFIG.remoteBaseUrl}/${modulePath}?v=${CONFIG.version}`,
            `${CONFIG.githubPagesUrl}/${modulePath}?v=${CONFIG.version}`,
            `${CONFIG.remoteBaseUrl}/${modulePath}`,
            `${CONFIG.githubPagesUrl}/${modulePath}`
        ];
        
        for (const url of urls) {
            try {
                console.log(`🔄 Tentando carregar: ${url}`);
                const response = await fetchWithTampermonkey(url);
                
                if (response.ok) {
                    const code = await response.text();
                    
                    // Executa o módulo no contexto global
                    const script = document.createElement('script');
                    script.textContent = code;
                    document.head.appendChild(script);
                    document.head.removeChild(script);
                    
                    moduleCache.set(modulePath, true);
                    console.log(`✅ Módulo carregado: ${modulePath}`);
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ Falha na URL ${url}:`, error.message);
            }
        }
        
        // Se chegou aqui, todas as tentativas falharam
        if (CONFIG.useLocalFallback) {
            return await loadLocalFallback(modulePath);
        }
        
        console.error(`❌ Falha completa ao carregar: ${modulePath}`);
        return false;
    }
    
    /**
     * Fallback local - inclui código diretamente
     */
    async function loadLocalFallback(modulePath) {
        console.log(`🔄 Usando fallback local para: ${modulePath}`);
        
        // Por enquanto, vamos usar o sistema completo como fallback
        if (modulePath === 'core/constants.min.js') {
            return loadBuiltinConstants();
        }
        
        // Para outros módulos, carrega o sistema completo como fallback
        return loadCompleteSystem();
    }
    
    /**
     * Carrega constantes embutidas
     */
    function loadBuiltinConstants() {
        // Inclui constantes básicas diretamente
        window.TROOP_CONFIG = {
            spear: { name: 'Lanceiro', type: 'infantry', attack: 10, defGeneral: 15, defCavalry: 45, defArcher: 20, carry: 25, speed: 18, pop: 1 },
            sword: { name: 'Espadachim', type: 'infantry', attack: 25, defGeneral: 50, defCavalry: 15, defArcher: 40, carry: 15, speed: 22, pop: 1 },
            axe: { name: 'Bárbaro', type: 'infantry', attack: 40, defGeneral: 10, defCavalry: 5, defArcher: 10, carry: 10, speed: 18, pop: 1 },
            archer: { name: 'Arqueiro', type: 'archer', attack: 15, defGeneral: 50, defCavalry: 40, defArcher: 5, carry: 10, speed: 18, pop: 1 },
            spy: { name: 'Batedor', type: 'infantry', attack: 0, defGeneral: 2, defCavalry: 1, defArcher: 2, carry: 0, speed: 9, pop: 2 },
            light: { name: 'Cavalaria Leve', type: 'cavalry', attack: 130, defGeneral: 30, defCavalry: 40, defArcher: 30, carry: 80, speed: 10, pop: 4 },
            marcher: { name: 'Arqueiro Montado', type: 'archer', attack: 120, defGeneral: 40, defCavalry: 30, defArcher: 50, carry: 50, speed: 10, pop: 5 },
            heavy: { name: 'Cavalaria Pesada', type: 'cavalry', attack: 150, defGeneral: 200, defCavalry: 80, defArcher: 180, carry: 50, speed: 11, pop: 6 },
            ram: { name: 'Aríete', type: 'siege', attack: 2, defGeneral: 20, defCavalry: 5, defArcher: 10, carry: 0, speed: 30, pop: 5 },
            catapult: { name: 'Catapulta', type: 'siege', attack: 100, defGeneral: 100, defCavalry: 50, defArcher: 100, carry: 0, speed: 30, pop: 8 },
            knight: { name: 'Paladino', type: 'cavalry', attack: 150, defGeneral: 250, defCavalry: 400, defArcher: 150, carry: 100, speed: 10, pop: 10 },
            snob: { name: 'Nobre', type: 'special', attack: 30, defGeneral: 100, defCavalry: 50, defArcher: 100, carry: 0, speed: 35, pop: 100 }
        };
        
        window.TROOP_TYPES = {
            offensive: ['axe', 'light', 'marcher', 'ram'],
            defensive: ['spear', 'sword', 'archer', 'heavy'],
            cavalry: ['light', 'marcher', 'heavy', 'knight'],
            archer: ['archer', 'marcher'],
            infantry: ['spear', 'sword', 'axe', 'spy'],
            siege: ['ram', 'catapult'],
            special: ['spy', 'knight', 'snob']
        };
        
        console.log('✅ Constantes carregadas (fallback local)');
        return true;
    }
    
    /**
     * Carrega sistema completo como fallback final
     */
    async function loadCompleteSystem() {
        console.log('🔄 Ativando sistema completo como fallback...');
        
        try {
            // Carrega o UserScript completo como fallback
            const completeUrl = `${CONFIG.remoteBaseUrl}/../bot-twb.user.js`;
            const response = await fetchWithTampermonkey(completeUrl);
            
            if (response.ok) {
                const code = await response.text();
                // Remove o cabeçalho UserScript e executa apenas o código
                const cleanCode = code.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/m, '');
                
                const script = document.createElement('script');
                script.textContent = cleanCode;
                document.head.appendChild(script);
                document.head.removeChild(script);
                
                console.log('✅ Sistema completo carregado como fallback');
                return true;
            }
        } catch (error) {
            console.error('❌ Falha no fallback completo:', error);
        }
        
        return false;
    }
    
    /**
     * Carrega todos os módulos sequencialmente
     */
    async function loadAllModules() {
        console.log('📦 Carregando módulos...');
        
        // Primeiro, tenta carregar apenas as constantes
        const constantsLoaded = await loadModule('core/constants.min.js');
        if (!constantsLoaded) {
            console.log('⚠️ Módulos remotos indisponíveis, usando sistema completo...');
            return await loadCompleteSystem();
        }
        
        // Se constantes carregaram, tenta carregar outros módulos
        let failureCount = 0;
        for (const module of CONFIG.modules.slice(1)) { // Pula constants que já carregamos
            const success = await loadModule(module);
            if (success) {
                console.log(`✅ ${module}`);
            } else {
                console.error(`❌ Falha ao carregar ${module}`);
                failureCount++;
            }
        }
        
        // Se muitos módulos falharam, usa fallback completo
        if (failureCount > CONFIG.modules.length / 2) {
            console.log('⚠️ Muitas falhas, usando sistema completo como fallback...');
            return await loadCompleteSystem();
        }
        
        return failureCount === 0;
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
            
            // Aguarda um pouco para garantir que todos os módulos foram processados
            setTimeout(() => {
                // Inicializa o sistema principal
                if (window.TWBSystem) {
                    const twb = new window.TWBSystem();
                    twb.init();
                } else if (window.main) {
                    // Fallback para função main do sistema completo
                    window.main();
                } else {
                    console.log('✅ Sistema carregado e pronto para uso');
                }
            }, 500);
            
        } else {
            console.error('💥 Falha crítica no carregamento');
        }
    }
    
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
})();
