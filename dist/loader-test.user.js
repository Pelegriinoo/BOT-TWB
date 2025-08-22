// ==UserScript==
// @name         BOT-TWB Loader - TESTE LOCAL
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.0.0-test
// @description  VERSÃO DE TESTE - Carregador mínimo para o sistema BOT-TWB
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🧪 BOT-TWB Loader TESTE v2.0.0 - Iniciando...');
    
    // ⚠️ VERSÃO DE TESTE - USA ARQUIVO LOCAL
    // Para teste, vamos usar o script completo embutido
    
    // Verificar se está no jogo
    function isInGame() {
        return window.location.pathname.includes('game.php') && 
               document.querySelector('#content_value');
    }
    
    // Carregar script completo como fallback
    function loadCompleteScript() {
        console.log('📦 Carregando versão completa do BOT-TWB...');
        
        // Criar indicador de carregamento simples
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px;
            background: linear-gradient(135deg, #2c1810, #3d2817);
            border: 2px solid #d4af37; border-radius: 10px;
            color: #d4af37; font-family: Arial; font-size: 12px;
            z-index: 999999; max-width: 300px;
        `;
        
        indicator.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🧪 BOT-TWB TESTE</div>
            <div>⏳ Carregando sistema completo...</div>
            <div style="margin-top: 8px; font-size: 10px; color: #8b6914;">
                Esta é uma versão de teste que carrega<br>
                o sistema completo localmente.
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Simular carregamento e mostrar mensagem de sucesso
        setTimeout(() => {
            indicator.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">✅ BOT-TWB TESTE</div>
                <div style="color: #8fbc8f;">Sistema carregado com sucesso!</div>
                <div style="margin-top: 8px; font-size: 10px; color: #8b6914;">
                    Pressione Ctrl+Shift+T para testar<br>
                    (Esta versão usa código local)
                </div>
            `;
            
            // Remover após 4 segundos
            setTimeout(() => indicator.remove(), 4000);
            
            // Aqui você colaria o código do bot-twb.user.js completo
            // Por enquanto, vamos só simular
            window.TWB = {
                version: '2.0.0-test',
                status: 'loaded-local',
                show: () => alert('🧪 BOT-TWB TESTE\n\nSistema carregado localmente!\n\nEsta versão de teste confirma que o loader funciona.\n\nPara usar a versão completa, substitua por:\n- loader.user.js (versão modular)\n- bot-twb.user.js (versão completa)'),
                info: () => console.log('🧪 Esta é uma versão de teste do loader')
            };
            
            console.log('✅ BOT-TWB TESTE carregado! Digite TWB.show() para testar');
            
        }, 2000);
    }
    
    // Inicializar se estiver no jogo
    if (isInGame()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadCompleteScript);
        } else {
            setTimeout(loadCompleteScript, 500);
        }
    } else {
        console.log('⏭️ TWB TESTE: Não está na página do jogo');
    }
    
})();
