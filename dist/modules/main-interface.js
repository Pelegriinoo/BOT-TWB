/**
 * BOT-TWB Main Interface - Interface principal do sistema (Versão Limpa)
 * @version 2.1.0
 * @author BOT-TWB
 */

window.TWBInterface = class TWBInterface {
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
        
        // Configuração dos caminhos
        this.config = {
            paths: {
                html: './templates/interface.html',
                css: './styles/interface.css'
            },
            fallbackMode: false // Se true, usa HTML/CSS inline como fallback
        };
        
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
     * Carrega arquivo externo via fetch
     */
    async loadFile(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`TWB: Erro ao carregar ${path}:`, error);
            
            if (this.config.fallbackMode) {
                console.warn('TWB: Tentando modo fallback...');
                return null;
            } else {
                throw error;
            }
        }
    }

    /**
     * Carrega e injeta estilos CSS
     */
    async loadStyles() {
        if (document.getElementById('twb-styles')) {
            console.log('TWB: CSS já carregado');
            return;
        }

        try {
            const cssContent = await this.loadFile(this.config.paths.css);
            
            const style = document.createElement('style');
            style.id = 'twb-styles';
            style.textContent = cssContent;
            document.head.appendChild(style);
            
            console.log('TWB: CSS carregado com sucesso');
        } catch (error) {
            console.error('TWB: Falha ao carregar CSS:', error);
            throw new Error('Não foi possível carregar os estilos da interface');
        }
    }

    /**
     * Carrega template HTML
     */
    async loadTemplate() {
        try {
            const htmlContent = await this.loadFile(this.config.paths.html);
            console.log('TWB: Template HTML carregado com sucesso');
            return htmlContent;
        } catch (error) {
            console.error('TWB: Falha ao carregar template HTML:', error);
            throw new Error('Não foi possível carregar o template da interface');
        }
    }

    /**
     * Cria a interface principal
     */
    async createInterface() {
        // Verificar se interface já existe
        if (document.getElementById('twb-interface')) {
            console.warn('TWB: Interface já existe');
            return;
        }

        try {
            // Carregar recursos externos
            await this.loadStyles();
            const htmlTemplate = await this.loadTemplate();
            
            // Criar container principal
            this.container = document.createElement('div');
            this.container.id = 'twb-interface';
            this.container.className = 'twb-container';
            this.container.innerHTML = htmlTemplate;
            
            document.body.appendChild(this.container);

            // Configurar funcionalidades
            this.setupEventListeners();
            this.detectTroops();

            console.log('TWB: Interface criada com sucesso');
            
        } catch (error) {
            console.error('TWB: Erro ao criar interface:', error);
            this.showErrorMessage(error.message);
        }
    }

    /**
     * Mostra mensagem de erro quando falha no carregamento
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #721c24;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #dc3545;
            z-index: 999999;
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        errorDiv.innerHTML = `
            <strong>❌ TWB - Erro de Interface</strong><br>
            ${message}<br><br>
            <small>Verifique se os arquivos template estão no local correto.</small>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 8000);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão fechar
        const closeBtn = document.getElementById('twb-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleVisibility());
        }

        // Detectar tropas
        const detectBtn = document.getElementById('twb-detect-troops');
        if (detectBtn) {
            detectBtn.addEventListener('click', () => this.detectTroops());
        }

        // Enviar ataque
        const sendBtn = document.getElementById('twb-send-attack');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendAttack());
        }

        // Coordenadas - calcular info ao digitar
        const coordsInput = document.getElementById('twb-target-coords');
        if (coordsInput) {
            coordsInput.addEventListener('input', () => this.updateAttackInfo());
        }

        // Tecla de atalho (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                this.toggleVisibility();
            }
        });

        console.log('TWB: Event listeners configurados');
    }

    /**
     * Detecta tropas disponíveis
     */
    async detectTroops() {
        const statusEl = document.getElementById('twb-detect-status');
        const detectBtn = document.getElementById('twb-detect-troops');
        
        if (!statusEl || !detectBtn) {
            console.error('TWB: Elementos da interface não encontrados');
            return;
        }
        
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
            
            const sendBtn = document.getElementById('twb-send-attack');
            if (sendBtn) sendBtn.disabled = false;

        } catch (error) {
            statusEl.textContent = `✗ ${error.message}`;
            statusEl.className = 'twb-status-text twb-error';
            console.error('TWB: Erro na detecção de tropas:', error);
        } finally {
            detectBtn.disabled = false;
        }
    }

    /**
     * Renderiza o grid de tropas
     */
    renderTroopGrid() {
        const grid = document.getElementById('twb-troop-grid');
        if (!grid) {
            console.error('TWB: Grid de tropas não encontrado');
            return;
        }
        
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
        const coordsInput = document.getElementById('twb-target-coords');
        if (!coordsInput) return;
        
        const coords = coordsInput.value.trim();
        
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
            this.setElementText('twb-info-distance', `${travelInfo.distance} campos`);
            this.setElementText('twb-info-time', travelInfo.formattedTime);
            this.setElementText('twb-info-arrival', travelInfo.arrivalTime.toLocaleTimeString());
            this.setElementText('twb-info-population', `${totalTroops} (${power.population} pop)`);

        } catch (error) {
            console.warn('TWB: Erro ao calcular informações:', error);
            this.clearAttackInfo();
        }
    }

    /**
     * Helper para definir texto de elemento
     */
    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    /**
     * Limpa informações do ataque
     */
    clearAttackInfo() {
        ['distance', 'time', 'arrival', 'population'].forEach(field => {
            this.setElementText(`twb-info-${field}`, '-');
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
        const targetCoordsInput = document.getElementById('twb-target-coords');
        const attackTypeSelect = document.getElementById('twb-attack-type');
        
        if (!targetCoordsInput || !attackTypeSelect) {
            console.error('TWB: Elementos do formulário não encontrados');
            return;
        }
        
        const targetCoords = targetCoordsInput.value.trim();
        const attackType = attackTypeSelect.value;
        
        // Validações
        if (!targetCoords.match(/^\d+\|\d+$/)) {
            this.showStatus('Coordenadas inválidas', 'error');
            return;
        }

        this.updateSelectedTroops();
        
        if (Object.keys(this.selectedTroops).length === 0) {
            this.showStatus('Selecione tropas', 'error');
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
        if (sendBtn) sendBtn.disabled = true;
        
        this.showStatus('Enviando ataque...', 'loading');

        try {
            const result = await this.attack.sendAttack(attackData);

            if (result.success) {
                this.showStatus(`✓ Ataque enviado para ${result.target}`, 'success');
                
                // Limpar seleção e redetectar tropas
                this.clearTroopSelection();
                setTimeout(() => this.detectTroops(), 1000);
                
            } else {
                this.showStatus(`✗ ${result.error}`, 'error');
            }

        } catch (error) {
            this.showStatus(`✗ Erro: ${error.message}`, 'error');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    /**
     * Mostra status na interface
     */
    showStatus(message, type) {
        const statusEl = document.getElementById('twb-status');
        if (!statusEl) return;
        
        statusEl.textContent = message;
        statusEl.className = `twb-status twb-${type}`;
        statusEl.style.display = 'block';

        if (type === 'success') {
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
};

console.log('🖥️ TWB Main Interface (Versão Limpa) carregada');