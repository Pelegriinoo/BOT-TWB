/**
 * Tribal Wars Bot Interface - Interface principal do sistema
 * @version 2.0.0
 * @author BOT-TWB
 */

import { TROOP_CONFIG, TROOP_TYPES, STATUS_CODES } from '../config/constants.js';
import { UIComponents } from './components.js';

export class TWBInterface {
    constructor(api, authManager, troopsManager, attackSystem) {
        this.api = api;
        this.auth = authManager;
        this.troops = troopsManager;
        this.attack = attackSystem;
        this.ui = new window.UIComponents();
        
        this.isVisible = false;
        this.currentTroops = {};
        this.selectedTroops = {};
        this.container = null;
        
        this.init();
    }

    /**
     * Inicializa a interface
     */
    async init() {
        if (!this.api.isReady()) {
            console.warn('TWB: Sistema não está pronto');
            return;
        }

        // Aguardar carregamento da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createInterface());
        } else {
            setTimeout(() => this.createInterface(), 1000);
        }
    }

    /**
     * Cria a interface principal
     */
    createInterface() {
        // Verificar se interface já existe
        if (document.getElementById('twb-interface')) {
            return;
        }

        // Criar estilos CSS
        this.injectStyles();

        // Criar container principal
        this.container = this.createMainContainer();
        document.body.appendChild(this.container);

        // Configurar event listeners
        this.setupEventListeners();

        // Auto-detectar tropas
        this.detectTroops();

        console.log('TWB: Interface criada com sucesso');
    }

    /**
     * Cria o container principal
     */
    createMainContainer() {
        const container = document.createElement('div');
        container.id = 'twb-interface';
        container.className = 'twb-container';
        
        container.innerHTML = `
            <div class="twb-header">
                <h3>🏰 TWB - Sistema de Ataques</h3>
                <button class="twb-close-btn" id="twb-close">×</button>
            </div>
            
            <div class="twb-content">
                <!-- Seção de Alvo -->
                <div class="twb-section">
                    <div class="twb-section-header">🎯 Alvo</div>
                    <div class="twb-form-row">
                        <input type="text" 
                               id="twb-target-coords" 
                               placeholder="500|500" 
                               class="twb-input">
                        <select id="twb-attack-type" class="twb-select">
                            <option value="attack">⚔️ Ataque</option>
                            <option value="support">🛡️ Apoio</option>
                        </select>
                    </div>
                </div>

                <!-- Seção de Tropas -->
                <div class="twb-section">
                    <div class="twb-section-header">
                        ⚔️ Tropas
                        <div class="twb-troop-actions">
                            <button class="twb-btn twb-btn-small" id="twb-detect-troops">🔍 Detectar</button>
                            <span id="twb-detect-status" class="twb-status-text"></span>
                        </div>
                    </div>
                    
                    <div class="twb-troop-presets">
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectAll()">Todas</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectNone()">Nenhuma</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectOffensive()">Ofensivas</button>
                        <button class="twb-btn twb-btn-small" onclick="window.TWB.selectDefensive()">Defensivas</button>
                    </div>
                    
                    <div class="twb-troop-grid" id="twb-troop-grid">
                        <!-- Tropas serão inseridas aqui -->
                    </div>
                </div>

                <!-- Seção de Informações -->
                <div class="twb-section">
                    <div class="twb-section-header">📊 Informações</div>
                    <div id="twb-attack-info" class="twb-info-grid">
                        <div class="twb-info-item">
                            <span class="twb-info-label">Distância:</span>
                            <span id="twb-info-distance">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">Tempo:</span>
                            <span id="twb-info-time">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">Chegada:</span>
                            <span id="twb-info-arrival">-</span>
                        </div>
                        <div class="twb-info-item">
                            <span class="twb-info-label">População:</span>
                            <span id="twb-info-population">-</span>
                        </div>
                    </div>
                </div>

                <!-- Seção de Ação -->
                <div class="twb-section">
                    <button class="twb-btn twb-btn-primary" id="twb-send-attack" disabled>
                        🚀 Enviar Ataque
                    </button>
                    <div class="twb-status" id="twb-status"></div>
                </div>
            </div>
        `;

        return container;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão fechar
        document.getElementById('twb-close').addEventListener('click', () => {
            this.toggleVisibility();
        });

        // Detectar tropas
        document.getElementById('twb-detect-troops').addEventListener('click', () => {
            this.detectTroops();
        });

        // Enviar ataque
        document.getElementById('twb-send-attack').addEventListener('click', () => {
            this.sendAttack();
        });

        // Coordenadas - calcular info ao digitar
        const coordsInput = document.getElementById('twb-target-coords');
        coordsInput.addEventListener('input', () => {
            this.updateAttackInfo();
        });

        // Tipo de ataque
        document.getElementById('twb-attack-type').addEventListener('change', () => {
            this.updateAttackInfo();
        });

        // Tecla de atalho para mostrar/ocultar (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                this.toggleVisibility();
            }
        });
    }

    /**
     * Detecta tropas disponíveis
     */
    async detectTroops() {
        const statusEl = document.getElementById('twb-detect-status');
        const detectBtn = document.getElementById('twb-detect-troops');
        
        try {
            statusEl.textContent = 'Detectando...';
            statusEl.className = 'twb-status-text twb-loading';
            detectBtn.disabled = true;

            this.currentTroops = await this.troops.getAvailableTroops();
            
            const totalTroops = this.troops.getTotalTroops(this.currentTroops);
            
            if (totalTroops === 0) {
                throw new Error('Nenhuma tropa encontrada');
            }

            this.renderTroopGrid();
            this.updateAttackInfo();
            
            statusEl.textContent = `✓ ${totalTroops} tropas`;
            statusEl.className = 'twb-status-text twb-success';
            
            document.getElementById('twb-send-attack').disabled = false;

        } catch (error) {
            statusEl.textContent = `✗ ${error.message}`;
            statusEl.className = 'twb-status-text twb-error';
            console.error('Erro na detecção de tropas:', error);
        } finally {
            detectBtn.disabled = false;
        }
    }

    /**
     * Renderiza o grid de tropas
     */
    renderTroopGrid() {
        const grid = document.getElementById('twb-troop-grid');
        grid.innerHTML = '';

        Object.entries(TROOP_CONFIG).forEach(([unit, config]) => {
            const available = this.currentTroops[unit] || 0;
            
            const troopItem = document.createElement('div');
            troopItem.className = 'twb-troop-item';
            
            troopItem.innerHTML = `
                <div class="twb-troop-icon">
                    <img src="/graphic/unit/unit_${unit}.png" 
                         alt="${config.name}" 
                         title="${config.name}"
                         onerror="this.style.display='none'">
                </div>
                <div class="twb-troop-info">
                    <label class="twb-troop-label">${config.name}</label>
                    <div class="twb-troop-controls">
                        <input type="number" 
                               id="twb-troop-${unit}" 
                               class="twb-troop-input"
                               min="0" 
                               max="${available}" 
                               value="0"
                               data-unit="${unit}">
                        <span class="twb-troop-available">(${available})</span>
                    </div>
                </div>
            `;

            // Event listener para atualizar informações
            const input = troopItem.querySelector('input');
            input.addEventListener('input', () => {
                this.updateSelectedTroops();
                this.updateAttackInfo();
            });

            grid.appendChild(troopItem);
        });
    }

    /**
     * Atualiza tropas selecionadas
     */
    updateSelectedTroops() {
        this.selectedTroops = {};
        
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) {
                const value = parseInt(input.value) || 0;
                if (value > 0) {
                    this.selectedTroops[unit] = value;
                }
            }
        });
    }

    /**
     * Atualiza informações do ataque
     */
    updateAttackInfo() {
        const coords = document.getElementById('twb-target-coords').value.trim();
        
        if (!coords.match(/^\d+\|\d+$/)) {
            this.clearAttackInfo();
            return;
        }

        this.updateSelectedTroops();
        
        if (Object.keys(this.selectedTroops).length === 0) {
            this.clearAttackInfo();
            return;
        }

        try {
            // Obter coordenadas da vila atual
            const currentVillageCoords = this.getCurrentVillageCoords();
            
            if (!currentVillageCoords) {
                this.clearAttackInfo();
                return;
            }

            // Calcular informações
            const travelInfo = this.troops.calculateTravelTime(
                currentVillageCoords, 
                coords, 
                this.selectedTroops
            );

            const power = this.troops.calculateOffensivePower(this.selectedTroops);
            const totalTroops = this.troops.getTotalTroops(this.selectedTroops);

            // Atualizar UI
            document.getElementById('twb-info-distance').textContent = 
                `${travelInfo.distance} campos`;
            document.getElementById('twb-info-time').textContent = 
                travelInfo.formattedTime;
            document.getElementById('twb-info-arrival').textContent = 
                travelInfo.arrivalTime.toLocaleTimeString();
            document.getElementById('twb-info-population').textContent = 
                `${totalTroops} (${power.population} pop)`;

        } catch (error) {
            console.warn('Erro ao calcular informações:', error);
            this.clearAttackInfo();
        }
    }

    /**
     * Limpa informações do ataque
     */
    clearAttackInfo() {
        ['distance', 'time', 'arrival', 'population'].forEach(field => {
            document.getElementById(`twb-info-${field}`).textContent = '-';
        });
    }

    /**
     * Obtém coordenadas da vila atual
     */
    getCurrentVillageCoords() {
        // Tentar obter das game_data
        if (window.game_data?.village?.coord) {
            return window.game_data.village.coord;
        }

        // Tentar obter da URL da página
        const coordsMatch = document.documentElement.innerHTML.match(/\((\d+\|\d+)\)/);
        return coordsMatch ? coordsMatch[1] : null;
    }

    /**
     * Envia o ataque
     */
    async sendAttack() {
        const targetCoords = document.getElementById('twb-target-coords').value.trim();
        const attackType = document.getElementById('twb-attack-type').value;
        
        // Validações
        if (!targetCoords.match(/^\d+\|\d+$/)) {
            this.showStatus('Coordenadas inválidas', STATUS_CODES.ERROR);
            return;
        }

        this.updateSelectedTroops();
        
        if (Object.keys(this.selectedTroops).length === 0) {
            this.showStatus('Selecione tropas', STATUS_CODES.ERROR);
            return;
        }

        const attackData = {
            sourceVillage: this.api.currentVillage,
            targetCoords,
            troops: this.selectedTroops,
            attackType
        };

        // Desabilitar botão
        const sendBtn = document.getElementById('twb-send-attack');
        sendBtn.disabled = true;
        
        this.showStatus('Enviando ataque...', STATUS_CODES.LOADING);

        try {
            const result = await this.attack.sendAttack(attackData);

            if (result.success) {
                this.showStatus(
                    `✓ Ataque enviado para ${result.target}`, 
                    STATUS_CODES.SUCCESS
                );
                
                // Limpar seleção e redetectar tropas
                this.clearTroopSelection();
                setTimeout(() => this.detectTroops(), 1000);
                
            } else {
                this.showStatus(`✗ ${result.error}`, STATUS_CODES.ERROR);
            }

        } catch (error) {
            this.showStatus(`✗ Erro: ${error.message}`, STATUS_CODES.ERROR);
        } finally {
            sendBtn.disabled = false;
        }
    }

    /**
     * Mostra status na interface
     */
    showStatus(message, type) {
        const statusEl = document.getElementById('twb-status');
        statusEl.textContent = message;
        statusEl.className = `twb-status twb-${type}`;
        statusEl.style.display = 'block';

        if (type === STATUS_CODES.SUCCESS) {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Limpa seleção de tropas
     */
    clearTroopSelection() {
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) input.value = 0;
        });
        this.selectedTroops = {};
        this.updateAttackInfo();
    }

    /**
     * Alterna visibilidade da interface
     */
    toggleVisibility() {
        if (this.container) {
            this.isVisible = !this.isVisible;
            this.container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * Injeta estilos CSS
     */
    injectStyles() {
        if (document.getElementById('twb-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'twb-styles';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }

    /**
     * Retorna CSS da interface
     */
    getCSS() {
        return `
            .twb-container {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 420px;
                max-height: 90vh;
                background: linear-gradient(135deg, #2c1810 0%, #3d2817 100%);
                border: 2px solid #d4af37;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 999999;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 12px;
                color: #d4af37;
                overflow-y: auto;
            }

            .twb-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(212, 175, 55, 0.1);
                border-bottom: 1px solid #8b6914;
                border-radius: 10px 10px 0 0;
            }

            .twb-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: bold;
                color: #d4af37;
            }

            .twb-close-btn {
                background: #8a4a4a;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            }

            .twb-close-btn:hover {
                background: #a55555;
            }

            .twb-content {
                padding: 15px;
            }

            .twb-section {
                margin-bottom: 20px;
                background: rgba(26, 15, 8, 0.6);
                border: 1px solid #8b6914;
                border-radius: 8px;
                overflow: hidden;
            }

            .twb-section-header {
                background: rgba(139, 105, 20, 0.3);
                padding: 8px 12px;
                font-weight: bold;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #8b6914;
            }

            .twb-form-row {
                display: flex;
                gap: 10px;
                padding: 12px;
                align-items: center;
            }

            .twb-input, .twb-select {
                padding: 6px 8px;
                border: 1px solid #8b6914;
                border-radius: 4px;
                background: #1a0f08;
                color: #d4af37;
                font-size: 12px;
                flex: 1;
            }

            .twb-input:focus, .twb-select:focus {
                outline: none;
                border-color: #d4af37;
                box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
            }

            .twb-troop-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .twb-troop-presets {
                padding: 8px 12px;
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                border-bottom: 1px solid rgba(139, 105, 20, 0.3);
            }

            .twb-troop-grid {
                padding: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .twb-troop-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px;
                background: rgba(60, 40, 23, 0.5);
                border: 1px solid rgba(139, 105, 20, 0.3);
                border-radius: 6px;
            }

            .twb-troop-icon img {
                width: 20px;
                height: 20px;
            }

            .twb-troop-info {
                flex: 1;
                min-width: 0;
            }

            .twb-troop-label {
                display: block;
                font-size: 10px;
                color: #d4af37;
                margin-bottom: 2px;
            }

            .twb-troop-controls {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .twb-troop-input {
                width: 40px;
                padding: 2px 4px;
                border: 1px solid #8b6914;
                border-radius: 3px;
                background: #1a0f08;
                color: #d4af37;
                font-size: 11px;
                text-align: center;
            }

            .twb-troop-available {
                font-size: 10px;
                color: #8b6914;
            }

            .twb-info-grid {
                padding: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .twb-info-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 8px;
                background: rgba(60, 40, 23, 0.3);
                border-radius: 4px;
            }

            .twb-info-label {
                font-size: 10px;
                color: #8b6914;
            }

            .twb-btn {
                background: #8b6914;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: background 0.2s;
            }

            .twb-btn:hover {
                background: #a67c00;
            }

            .twb-btn:disabled {
                background: #555;
                cursor: not-allowed;
            }

            .twb-btn-small {
                padding: 4px 8px;
                font-size: 10px;
            }

            .twb-btn-primary {
                background: #2d5a2d;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: bold;
                width: 100%;
                margin-bottom: 10px;
            }

            .twb-btn-primary:hover {
                background: #3a6b3a;
            }

            .twb-status {
                padding: 8px;
                border-radius: 4px;
                font-size: 11px;
                text-align: center;
                display: none;
            }

            .twb-status.twb-success {
                background: rgba(42, 74, 42, 0.8);
                border: 1px solid #4a8a4a;
                color: #8fbc8f;
            }

            .twb-status.twb-error {
                background: rgba(74, 42, 42, 0.8);
                border: 1px solid #8a4a4a;
                color: #f08080;
            }

            .twb-status.twb-loading {
                background: rgba(42, 52, 74, 0.8);
                border: 1px solid #4a6a8a;
                color: #8fb8f0;
            }

            .twb-status-text {
                font-size: 10px;
            }

            .twb-status-text.twb-success {
                color: #8fbc8f;
            }

            .twb-status-text.twb-error {
                color: #f08080;
            }

            .twb-status-text.twb-loading {
                color: #8fb8f0;
            }

            /* Scrollbar personalizada */
            .twb-container::-webkit-scrollbar {
                width: 6px;
            }

            .twb-container::-webkit-scrollbar-track {
                background: #2c1810;
            }

            .twb-container::-webkit-scrollbar-thumb {
                background: #8b6914;
                border-radius: 3px;
            }

            .twb-container::-webkit-scrollbar-thumb:hover {
                background: #d4af37;
            }
        `;
    }

    // Métodos para presets de tropas (expostos globalmente)
    selectAll() {
        Object.keys(TROOP_CONFIG).forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input) {
                input.value = this.currentTroops[unit] || 0;
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }

    selectNone() {
        this.clearTroopSelection();
    }

    selectOffensive() {
        this.selectNone();
        TROOP_TYPES.offensive.forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input && this.currentTroops[unit]) {
                input.value = this.currentTroops[unit];
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }

    selectDefensive() {
        this.selectNone();
        TROOP_TYPES.defensive.forEach(unit => {
            const input = document.getElementById(`twb-troop-${unit}`);
            if (input && this.currentTroops[unit]) {
                input.value = this.currentTroops[unit];
            }
        });
        this.updateSelectedTroops();
        this.updateAttackInfo();
    }
}