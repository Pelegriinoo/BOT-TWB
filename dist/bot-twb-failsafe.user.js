// ==UserScript==
// @name         BOT-TWB - Tribal Wars Bot System (Fail-Safe)
// @namespace    https://github.com/Pelegriinoo/BOT-TWB
// @version      2.1.0
// @description  Sistema completo para Tribal Wars - Versão Fail-Safe
// @author       Pelegriinoo
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.tribalwars.net/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.plemiona.pl/game.php*
// @match        https://*.tribals.it/game.php*
// @match        https://*.guerretribali.it/game.php*
// @match        https://*.vojnaplemen.si/game.php*
// @updateURL    https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb-failsafe.user.js
// @downloadURL  https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb-failsafe.user.js
// @supportURL   https://github.com/Pelegriinoo/BOT-TWB/issues
// @homepageURL  https://github.com/Pelegriinoo/BOT-TWB
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🏰 BOT-TWB Fail-Safe v2.1.0 - Sistema completo incorporado');
    
    // SISTEMA COMPLETO INCLUÍDO DIRETAMENTE
    // ====================================
    
    // Constantes do sistema
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
    
    // Componentes de Interface
    window.UIComponents = class {
        static createButton(text, onClick, className = 'btn') {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = className;
            button.addEventListener('click', onClick);
            return button;
        }
        
        static createInput(type = 'text', placeholder = '', value = '') {
            const input = document.createElement('input');
            input.type = type;
            input.placeholder = placeholder;
            input.value = value;
            return input;
        }
        
        static createModal(title, content) {
            const modal = document.createElement('div');
            modal.className = 'twb-modal';
            modal.innerHTML = `
                <div class="twb-modal-content">
                    <div class="twb-modal-header">
                        <h3>${title}</h3>
                        <span class="twb-modal-close">&times;</span>
                    </div>
                    <div class="twb-modal-body">${content}</div>
                </div>
            `;
            
            const closeBtn = modal.querySelector('.twb-modal-close');
            closeBtn.onclick = () => modal.remove();
            
            return modal;
        }
        
        static createTooltip(element, text) {
            element.title = text;
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'twb-tooltip';
                tooltip.textContent = text;
                document.body.appendChild(tooltip);
            });
        }
    };
    
    // Sistema de API
    window.TWBApi = class {
        static async request(url, options = {}) {
            try {
                const response = await fetch(url, {
                    credentials: 'same-origin',
                    ...options
                });
                return response.json();
            } catch (error) {
                console.error('Erro na requisição:', error);
                throw error;
            }
        }
        
        static getGameData() {
            return window.game_data || {};
        }
        
        static getVillageData() {
            return window.village || {};
        }
        
        static getCurrentPage() {
            const url = new URL(window.location.href);
            return url.searchParams.get('screen') || 'overview';
        }
    };
    
    // Sistema de Tropas
    window.TWBTroops = class {
        static getCurrentTroops() {
            const troops = {};
            const troopElements = document.querySelectorAll('#units_entry_all .units-entry-all');
            
            troopElements.forEach(element => {
                const troopType = element.getAttribute('data-unit');
                const troopCount = parseInt(element.textContent) || 0;
                if (troopType) {
                    troops[troopType] = troopCount;
                }
            });
            
            return troops;
        }
        
        static calculateTotalAttack(troops) {
            let totalAttack = 0;
            Object.entries(troops).forEach(([type, count]) => {
                if (window.TROOP_CONFIG[type]) {
                    totalAttack += window.TROOP_CONFIG[type].attack * count;
                }
            });
            return totalAttack;
        }
        
        static calculateTravelTime(troops, distance) {
            const speeds = Object.entries(troops)
                .filter(([type, count]) => count > 0)
                .map(([type]) => window.TROOP_CONFIG[type]?.speed || 0);
            
            const slowestSpeed = Math.max(...speeds);
            return distance * slowestSpeed; // Tempo em minutos
        }
    };
    
    // Sistema de Ataques
    window.TWBAttackSystem = class {
        constructor() {
            this.queue = [];
            this.isRunning = false;
        }
        
        addAttack(target, troops, type = 'attack') {
            this.queue.push({
                target,
                troops,
                type,
                timestamp: Date.now()
            });
        }
        
        async executeAttack(attack) {
            try {
                console.log('Executando ataque:', attack);
                // Simulação de envio de ataque
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, attack };
            } catch (error) {
                console.error('Erro ao executar ataque:', error);
                return { success: false, error };
            }
        }
        
        async processQueue() {
            if (this.isRunning) return;
            this.isRunning = true;
            
            while (this.queue.length > 0) {
                const attack = this.queue.shift();
                await this.executeAttack(attack);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Delay entre ataques
            }
            
            this.isRunning = false;
        }
    };
    
    // Contador de Tropas
    window.TWBTroopCounter = class {
        constructor() {
            this.initialize();
        }
        
        initialize() {
            this.addTroopCounter();
        }
        
        addTroopCounter() {
            const troopElements = document.querySelectorAll('.units-entry-all');
            troopElements.forEach(element => {
                if (!element.querySelector('.twb-troop-info')) {
                    const troopType = element.getAttribute('data-unit');
                    const count = parseInt(element.textContent) || 0;
                    
                    if (troopType && window.TROOP_CONFIG[troopType]) {
                        const info = document.createElement('div');
                        info.className = 'twb-troop-info';
                        info.innerHTML = `
                            <small>
                                Ataque: ${window.TROOP_CONFIG[troopType].attack * count}<br>
                                Pop: ${window.TROOP_CONFIG[troopType].pop * count}
                            </small>
                        `;
                        element.appendChild(info);
                    }
                }
            });
        }
    };
    
    // Interface Principal
    window.TWBInterface = class {
        constructor() {
            this.attackSystem = new window.TWBAttackSystem();
            this.troopCounter = new window.TWBTroopCounter();
            this.initialize();
        }
        
        initialize() {
            this.createMainInterface();
            this.addStyles();
        }
        
        createMainInterface() {
            const mainDiv = document.createElement('div');
            mainDiv.id = 'twb-main-interface';
            mainDiv.innerHTML = `
                <div class="twb-panel">
                    <h3>🏰 BOT-TWB v2.1.0</h3>
                    <div class="twb-buttons">
                        <button id="twb-troop-overview" class="btn">Visão Geral</button>
                        <button id="twb-attack-planner" class="btn">Planejador</button>
                        <button id="twb-settings" class="btn">Configurações</button>
                    </div>
                    <div id="twb-content" class="twb-content"></div>
                </div>
            `;
            
            document.body.appendChild(mainDiv);
            this.bindEvents();
        }
        
        bindEvents() {
            document.getElementById('twb-troop-overview')?.addEventListener('click', () => {
                this.showTroopOverview();
            });
            
            document.getElementById('twb-attack-planner')?.addEventListener('click', () => {
                this.showAttackPlanner();
            });
            
            document.getElementById('twb-settings')?.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        showTroopOverview() {
            const content = document.getElementById('twb-content');
            const troops = window.TWBTroops.getCurrentTroops();
            const totalAttack = window.TWBTroops.calculateTotalAttack(troops);
            
            content.innerHTML = `
                <h4>Tropas Disponíveis</h4>
                <div class="twb-troop-list">
                    ${Object.entries(troops).map(([type, count]) => `
                        <div class="twb-troop-item">
                            <span>${window.TROOP_CONFIG[type]?.name || type}: ${count}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="twb-stats">
                    <p><strong>Ataque Total:</strong> ${totalAttack}</p>
                </div>
            `;
        }
        
        showAttackPlanner() {
            const content = document.getElementById('twb-content');
            content.innerHTML = `
                <h4>Planejador de Ataques</h4>
                <div class="twb-attack-form">
                    <input type="text" id="target-coords" placeholder="Coordenadas (xxx|yyy)" />
                    <button id="add-attack" class="btn">Adicionar Ataque</button>
                </div>
                <div id="attack-queue" class="twb-queue"></div>
            `;
            
            document.getElementById('add-attack')?.addEventListener('click', () => {
                const coords = document.getElementById('target-coords').value;
                if (coords) {
                    this.attackSystem.addAttack(coords, window.TWBTroops.getCurrentTroops());
                    this.updateAttackQueue();
                }
            });
        }
        
        showSettings() {
            const content = document.getElementById('twb-content');
            content.innerHTML = `
                <h4>Configurações</h4>
                <div class="twb-settings">
                    <label>
                        <input type="checkbox" id="auto-attack" />
                        Ataques Automáticos
                    </label>
                    <label>
                        <input type="number" id="attack-delay" value="2000" />
                        Delay entre Ataques (ms)
                    </label>
                    <button id="save-settings" class="btn">Salvar</button>
                </div>
            `;
        }
        
        updateAttackQueue() {
            const queueDiv = document.getElementById('attack-queue');
            if (queueDiv) {
                queueDiv.innerHTML = this.attackSystem.queue.map((attack, index) => `
                    <div class="twb-queue-item">
                        Ataque #${index + 1}: ${attack.target}
                    </div>
                `).join('');
            }
        }
        
        addStyles() {
            const style = document.createElement('style');
            style.textContent = `
                #twb-main-interface {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 300px;
                    background: #f4f4f4;
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    z-index: 10000;
                    font-family: Verdana, Arial, sans-serif;
                    font-size: 11px;
                }
                
                .twb-panel {
                    padding: 10px;
                }
                
                .twb-panel h3 {
                    margin: 0 0 10px 0;
                    color: #8b4513;
                    text-align: center;
                }
                
                .twb-buttons {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                
                .twb-buttons .btn {
                    flex: 1;
                    padding: 5px;
                    background: #8b4513;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                }
                
                .twb-buttons .btn:hover {
                    background: #a0522d;
                }
                
                .twb-content {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .twb-troop-item {
                    padding: 3px;
                    border-bottom: 1px solid #ddd;
                }
                
                .twb-stats {
                    margin-top: 10px;
                    padding: 5px;
                    background: #e8e8e8;
                    border-radius: 3px;
                }
                
                .twb-attack-form {
                    margin-bottom: 10px;
                }
                
                .twb-attack-form input {
                    width: 60%;
                    padding: 5px;
                    margin-right: 5px;
                }
                
                .twb-queue-item {
                    padding: 5px;
                    background: #fff;
                    margin: 2px 0;
                    border-radius: 3px;
                    border-left: 3px solid #8b4513;
                }
                
                .twb-troop-info {
                    font-size: 9px;
                    color: #666;
                    margin-top: 2px;
                }
                
                .twb-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 20000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .twb-modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                }
                
                .twb-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                
                .twb-modal-close {
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                
                .twb-modal-close:hover {
                    color: #000;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Sistema Principal
    window.TWBSystem = class {
        constructor() {
            this.interface = null;
            this.isInitialized = false;
        }
        
        init() {
            if (this.isInitialized) {
                console.log('BOT-TWB já foi inicializado');
                return;
            }
            
            console.log('🚀 Inicializando BOT-TWB...');
            
            // Aguarda o DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }
        
        setup() {
            try {
                // Verifica se está na página correta
                if (!this.isGamePage()) {
                    console.log('❌ Não está na página do jogo');
                    return;
                }
                
                // Inicializa a interface
                this.interface = new window.TWBInterface();
                this.isInitialized = true;
                
                console.log('✅ BOT-TWB inicializado com sucesso!');
                
                // Notificação de carregamento
                this.showNotification('🏰 BOT-TWB v2.1.0 carregado!', 'success');
                
            } catch (error) {
                console.error('❌ Erro ao inicializar BOT-TWB:', error);
                this.showNotification('❌ Erro ao carregar BOT-TWB', 'error');
            }
        }
        
        isGamePage() {
            return window.location.pathname.includes('game.php') && 
                   document.querySelector('#content_value') !== null;
        }
        
        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `twb-notification twb-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 30000;
                font-family: Verdana, sans-serif;
                font-size: 12px;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    };
    
    // Função principal de inicialização
    function main() {
        console.log('🏰 BOT-TWB Fail-Safe v2.1.0 - Iniciando sistema...');
        
        // Cria e inicializa o sistema
        const twbSystem = new window.TWBSystem();
        twbSystem.init();
        
        // Expõe globalmente para debug
        window.TWB = twbSystem;
    }
    
    // Verifica se está na página correta e inicializa
    function isGamePage() {
        return window.location.pathname.includes('game.php') && 
               document.querySelector('#content_value') !== null;
    }
    
    if (!isGamePage()) {
        console.log('⏳ Aguardando página do jogo...');
        const checkInterval = setInterval(() => {
            if (isGamePage()) {
                clearInterval(checkInterval);
                main();
            }
        }, 1000);
    } else {
        // Se já está na página correta, aguarda um pouco e executa
        setTimeout(main, 500);
    }
    
})();
