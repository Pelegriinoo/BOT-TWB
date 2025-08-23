/**
 * Interface Principal do BOT-TWB
 * Sistema completo de UI com todas as funcionalidades
 */

class BotInterface {
    constructor(botInstance) {
        this.bot = botInstance;
        this.isVisible = false;
        this.currentPanel = 'main';
        this.attackResults = [];
        
        this.panels = {
            main: 'Painel Principal',
            troops: 'Tropas',
            attacks: 'Ataques',
            settings: 'Configurações'
        };
    }

    create() {
        this.createStyles();
        this.createMainInterface();
        this.createFloatingButton();
        this.attachEventListeners();
        
        console.log('🖥️ Interface do bot criada');
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos principais do bot */
            #tw-bot-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 400px;
                min-height: 500px;
                background: linear-gradient(135deg, #2c3e50, #3498db);
                border: 3px solid #34495e;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: white;
                display: none;
                overflow: hidden;
            }

            .bot-header {
                background: rgba(0,0,0,0.2);
                padding: 15px;
                border-bottom: 2px solid #34495e;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }

            .bot-title {
                font-size: 18px;
                font-weight: bold;
                color: #ecf0f1;
            }

            .bot-close {
                background: #e74c3c;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .bot-tabs {
                display: flex;
                background: rgba(0,0,0,0.1);
                border-bottom: 1px solid #34495e;
            }

            .bot-tab {
                flex: 1;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                border: none;
                background: transparent;
                color: #bdc3c7;
                transition: all 0.3s;
            }

            .bot-tab.active {
                background: rgba(52, 152, 219, 0.3);
                color: white;
                border-bottom: 2px solid #3498db;
            }

            .bot-content {
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
            }

            .input-group {
                margin-bottom: 15px;
            }

            .input-group label {
                display: block;
                margin-bottom: 5px;
                color: #ecf0f1;
                font-weight: 500;
            }

            .input-group input,
            .input-group select {
                width: 100%;
                padding: 8px 12px;
                border: 2px solid #34495e;
                border-radius: 6px;
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 14px;
            }

            .input-group input:focus,
            .input-group select:focus {
                border-color: #3498db;
                outline: none;
                box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s;
                margin: 5px;
            }

            .btn-primary {
                background: #3498db;
                color: white;
            }

            .btn-success {
                background: #27ae60;
                color: white;
            }

            .btn-danger {
                background: #e74c3c;
                color: white;
            }

            .btn-warning {
                background: #f39c12;
                color: white;
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }

            .village-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #34495e;
                border-radius: 6px;
                background: rgba(0,0,0,0.1);
            }

            .village-item {
                padding: 10px;
                border-bottom: 1px solid #34495e;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: background 0.3s;
            }

            .village-item:hover {
                background: rgba(52, 152, 219, 0.2);
            }

            .village-item.selected {
                background: rgba(52, 152, 219, 0.4);
            }

            .village-info {
                flex: 1;
            }

            .village-coords {
                font-weight: bold;
                color: #3498db;
            }

            .village-distance {
                font-size: 12px;
                color: #bdc3c7;
            }

            .troops-selector {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 10px;
            }

            .troop-input {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .troop-input img {
                width: 24px;
                height: 24px;
            }

            .troop-input input {
                flex: 1;
                width: auto !important;
            }

            .attack-results {
                max-height: 250px;
                overflow-y: auto;
                border: 1px solid #34495e;
                border-radius: 6px;
                background: rgba(0,0,0,0.1);
            }

            .attack-result {
                padding: 8px 12px;
                border-bottom: 1px solid #34495e;
                font-size: 13px;
            }

            .attack-result.success {
                border-left: 4px solid #27ae60;
                background: rgba(39, 174, 96, 0.1);
            }

            .attack-result.error {
                border-left: 4px solid #e74c3c;
                background: rgba(231, 76, 60, 0.1);
            }

            .floating-btn {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                transition: all 0.3s;
            }

            .floating-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            }

            .status-bar {
                padding: 10px;
                background: rgba(0,0,0,0.2);
                border-top: 1px solid #34495e;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
            }

            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                margin-right: 5px;
            }

            .status-online { background: #27ae60; }
            .status-busy { background: #f39c12; }
            .status-error { background: #e74c3c; }

            /* Scrollbar customizada */
            .bot-content::-webkit-scrollbar,
            .village-list::-webkit-scrollbar,
            .attack-results::-webkit-scrollbar {
                width: 6px;
            }

            .bot-content::-webkit-scrollbar-track,
            .village-list::-webkit-scrollbar-track,
            .attack-results::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
            }

            .bot-content::-webkit-scrollbar-thumb,
            .village-list::-webkit-scrollbar-thumb,
            .attack-results::-webkit-scrollbar-thumb {
                background: #3498db;
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);
    }

    createMainInterface() {
        const panel = document.createElement('div');
        panel.id = 'tw-bot-panel';
        panel.innerHTML = `
            <div class="bot-header">
                <div class="bot-title">🏰 BOT-TWB v2.0</div>
                <button class="bot-close">×</button>
            </div>
            
            <div class="bot-tabs">
                <button class="bot-tab active" data-panel="main">Principal</button>
                <button class="bot-tab" data-panel="troops">Tropas</button>
                <button class="bot-tab" data-panel="attacks">Ataques</button>
                <button class="bot-tab" data-panel="settings">Config</button>
            </div>

            <div class="bot-content">
                <div id="panel-main" class="panel-content">
                    <div class="input-group">
                        <label>🎯 Coordenadas do Alvo:</label>
                        <input type="text" id="target-coords" placeholder="500|500">
                    </div>
                    
                    <div class="input-group">
                        <label>⚔️ Tipo de Comando:</label>
                        <select id="attack-type">
                            <option value="attack">Ataque</option>
                            <option value="support">Apoio</option>
                            <option value="scout">Exploração</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-primary" id="find-villages">🔍 Buscar Vilas Próximas</button>
                    
                    <div id="villages-container" style="display:none;">
                        <h4>🏘️ Vilas Disponíveis:</h4>
                        <div class="village-list" id="villages-list"></div>
                    </div>
                    
                    <div id="troops-container" style="display:none;">
                        <h4>⚔️ Selecionar Tropas:</h4>
                        <div class="troops-selector" id="troops-selector"></div>
                        <button class="btn btn-success" id="send-attack">🚀 Enviar Ataque</button>
                        <button class="btn btn-warning" id="add-to-queue">📝 Adicionar à Fila</button>
                    </div>
                </div>

                <div id="panel-troops" class="panel-content" style="display:none;">
                    <button class="btn btn-primary" id="collect-troops">📊 Coletar Tropas</button>
                    <button class="btn btn-success" id="refresh-troops">🔄 Atualizar</button>
                    
                    <div id="troops-summary" style="margin-top: 15px;"></div>
                </div>

                <div id="panel-attacks" class="panel-content" style="display:none;">
                    <div style="margin-bottom: 15px;">
                        <button class="btn btn-success" id="process-queue">▶️ Processar Fila</button>
                        <button class="btn btn-danger" id="clear-queue">🗑️ Limpar Fila</button>
                        <button class="btn btn-warning" id="pause-queue">⏸️ Pausar</button>
                    </div>
                    
                    <div id="queue-status">
                        <h4>📋 Status da Fila: <span id="queue-count">0</span> ataques</h4>
                    </div>
                    
                    <div class="attack-results" id="attack-results"></div>
                </div>

                <div id="panel-settings" class="panel-content" style="display:none;">
                    <div class="input-group">
                        <label>⏱️ Intervalo entre ataques (ms):</label>
                        <input type="number" id="attack-interval" value="3000" min="1000" max="10000">
                    </div>
                    
                    <div class="input-group">
                        <label>🎯 Distância máxima para busca:</label>
                        <input type="number" id="max-distance" value="50" min="10" max="200">
                    </div>
                    
                    <div class="input-group">
                        <label>🛡️ Modo Anti-Detecção:</label>
                        <select id="anti-detection">
                            <option value="low">Baixo</option>
                            <option value="medium" selected>Médio</option>
                            <option value="high">Alto</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-success" id="save-settings">💾 Salvar Configurações</button>
                    <button class="btn btn-warning" id="reset-settings">🔄 Restaurar Padrão</button>
                </div>
            </div>

            <div class="status-bar">
                <div>
                    <span class="status-indicator status-online"></span>
                    Status: Online
                </div>
                <div id="last-update">Última atualização: --:--</div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
    }

    createFloatingButton() {
        const btn = document.createElement('button');
        btn.className = 'floating-btn';
        btn.innerHTML = '🏰';
        btn.title = 'Abrir BOT-TWB';
        btn.onclick = () => this.toggle();
        
        document.body.appendChild(btn);
        this.floatingBtn = btn;
    }

    attachEventListeners() {
        // Navegação entre abas
        this.panel.querySelectorAll('.bot-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const panel = tab.dataset.panel;
                this.switchPanel(panel);
            });
        });

        // Fechar painel
        this.panel.querySelector('.bot-close').onclick = () => this.hide();

        // Funcionalidades principais
        document.getElementById('find-villages').onclick = () => this.findNearestVillages();
        document.getElementById('send-attack').onclick = () => this.sendAttack();
        document.getElementById('add-to-queue').onclick = () => this.addToQueue();
        
        // Tropas
        document.getElementById('collect-troops').onclick = () => this.collectTroops();
        document.getElementById('refresh-troops').onclick = () => this.refreshTroops();
        
        // Fila de ataques
        document.getElementById('process-queue').onclick = () => this.processQueue();
        document.getElementById('clear-queue').onclick = () => this.clearQueue();
        document.getElementById('pause-queue').onclick = () => this.pauseQueue();
        
        // Configurações
        document.getElementById('save-settings').onclick = () => this.saveSettings();
        document.getElementById('reset-settings').onclick = () => this.resetSettings();

        // Tornar o painel arrastável
        this.makeDraggable();

        // Escutar resultados de ataques
        window.addEventListener('attackResult', (e) => {
            this.displayAttackResult(e.detail);
        });
    }

    switchPanel(panelName) {
        // Atualizar abas
        this.panel.querySelectorAll('.bot-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelName);
        });

        // Mostrar/ocultar conteúdo
        this.panel.querySelectorAll('.panel-content').forEach(content => {
            content.style.display = content.id === `panel-${panelName}` ? 'block' : 'none';
        });

        this.currentPanel = panelName;
    }

    async findNearestVillages() {
        const targetCoords = document.getElementById('target-coords').value.trim();
        
        if (!targetCoords.match(/^\d+\|\d+$/)) {
            alert('❌ Formato de coordenadas inválido! Use: 500|500');
            return;
        }

        try {
            // Obter dados das vilas do jogador
            const villageData = await this.getPlayerVillages();
            const [targetX, targetY] = targetCoords.split('|').map(Number);

            // Calcular distâncias
            const villagesWithDistance = villageData.map(village => ({
                ...village,
                distance: Math.sqrt(
                    Math.pow(targetX - village.x, 2) + 
                    Math.pow(targetY - village.y, 2)
                ).toFixed(2)
            }));

            // Ordenar por distância
            villagesWithDistance.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            // Mostrar na interface
            this.displayVillagesList(villagesWithDistance, targetCoords);

        } catch (error) {
            console.error('Erro ao buscar vilas:', error);
            alert('❌ Erro ao buscar vilas próximas');
        }
    }

    async getPlayerVillages() {
        // Obter lista de vilas do jogador
        try {
            const response = await fetch('/game.php?screen=overview_villages&mode=prod');
            const html = await response.text();
            
            const villages = [];
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            doc.querySelectorAll('tr[id*="village_"]').forEach(row => {
                const coordsEl = row.querySelector('.quickedit-label');
                const nameEl = row.querySelector('.quickedit-content');
                
                if (coordsEl && nameEl) {
                    const coords = coordsEl.textContent.match(/\((\d+)\|(\d+)\)/);
                    if (coords) {
                        villages.push({
                            id: row.id.replace('village_', ''),
                            name: nameEl.textContent.trim(),
                            x: parseInt(coords[1]),
                            y: parseInt(coords[2]),
                            coords: `${coords[1]}|${coords[2]}`
                        });
                    }
                }
            });

            return villages;
        } catch (error) {
            console.error('Erro ao obter vilas:', error);
            return [];
        }
    }

    displayVillagesList(villages, targetCoords) {
        const container = document.getElementById('villages-container');
        const list = document.getElementById('villages-list');
        
        list.innerHTML = '';
        
        villages.slice(0, 10).forEach(village => {
            const item = document.createElement('div');
            item.className = 'village-item';
            item.dataset.villageId = village.id;
            item.innerHTML = `
                <div class="village-info">
                    <div class="village-coords">${village.coords}</div>
                    <div style="font-size: 12px; color: #bdc3c7;">${village.name}</div>
                    <div class="village-distance">📏 ${village.distance} campos</div>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm">Selecionar</button>
                </div>
            `;
            
            item.onclick = () => this.selectVillage(village, targetCoords);
            list.appendChild(item);
        });
        
        container.style.display = 'block';
    }

    async selectVillage(village, targetCoords) {
        // Marcar vila como selecionada
        document.querySelectorAll('.village-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelector(`[data-village-id="${village.id}"]`).classList.add('selected');
        
        // Obter tropas disponíveis na vila
        try {
            const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
            const troops = await attackSystem.getAvailableTroops(village.id);
            
            this.selectedVillage = village;
            this.selectedTarget = targetCoords;
            this.availableTroops = troops;
            
            this.displayTroopsSelector(troops);
            
        } catch (error) {
            console.error('Erro ao obter tropas:', error);
            alert('❌ Erro ao carregar tropas da vila');
        }
    }

    displayTroopsSelector(troops) {
        const container = document.getElementById('troops-container');
        const selector = document.getElementById('troops-selector');
        
        const troopTypes = [
            { key: 'spear', name: 'Lanceiro', icon: '/graphic/unit/unit_spear.png' },
            { key: 'sword', name: 'Espadachim', icon: '/graphic/unit/unit_sword.png' },
            { key: 'axe', name: 'Bárbaro', icon: '/graphic/unit/unit_axe.png' },
            { key: 'archer', name: 'Arqueiro', icon: '/graphic/unit/unit_archer.png' },
            { key: 'spy', name: 'Explorador', icon: '/graphic/unit/unit_spy.png' },
            { key: 'light', name: 'Cav. Leve', icon: '/graphic/unit/unit_light.png' },
            { key: 'marcher', name: 'Arq. Cavalo', icon: '/graphic/unit/unit_marcher.png' },
            { key: 'heavy', name: 'Cav. Pesada', icon: '/graphic/unit/unit_heavy.png' },
            { key: 'ram', name: 'Aríete', icon: '/graphic/unit/unit_ram.png' },
            { key: 'catapult', name: 'Catapulta', icon: '/graphic/unit/unit_catapult.png' }
        ];
        
        selector.innerHTML = '';
        
        troopTypes.forEach(troop => {
            if (troops[troop.key] > 0) {
                const div = document.createElement('div');
                div.className = 'troop-input';
                div.innerHTML = `
                    <img src="${troop.icon}" alt="${troop.name}" title="${troop.name}">
                    <input type="number" 
                           id="troop-${troop.key}" 
                           min="0" 
                           max="${troops[troop.key]}" 
                           value="0"
                           placeholder="${troops[troop.key]}">
                `;
                selector.appendChild(div);
            }
        });
        
        container.style.display = 'block';
    }

    async sendAttack() {
        if (!this.selectedVillage || !this.selectedTarget) {
            alert('❌ Selecione uma vila e alvo primeiro');
            return;
        }

        const selectedTroops = this.getSelectedTroops();
        if (Object.values(selectedTroops).every(count => count === 0)) {
            alert('❌ Selecione pelo menos uma tropa');
            return;
        }

        const attackType = document.getElementById('attack-type').value;
        
        const attackData = {
            sourceVillage: this.selectedVillage.id,
            targetCoords: this.selectedTarget,
            troops: selectedTroops,
            attackType: attackType
        };

        try {
            const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
            const result = await attackSystem.sendSingleAttack(attackData);
            
            this.displayAttackResult(result);
            
            if (result.success) {
                alert('✅ Ataque enviado com sucesso!');
            } else {
                alert(`❌ Erro: ${result.error}`);
            }
            
        } catch (error) {
            console.error('Erro ao enviar ataque:', error);
            alert('❌ Erro ao enviar ataque');
        }
    }

    addToQueue() {
        if (!this.selectedVillage || !this.selectedTarget) {
            alert('❌ Selecione uma vila e alvo primeiro');
            return;
        }

        const selectedTroops = this.getSelectedTroops();
        if (Object.values(selectedTroops).every(count => count === 0)) {
            alert('❌ Selecione pelo menos uma tropa');
            return;
        }

        const attackType = document.getElementById('attack-type').value;
        
        const attackData = {
            sourceVillage: this.selectedVillage.id,
            sourceCoords: this.selectedVillage.coords,
            targetCoords: this.selectedTarget,
            troops: selectedTroops,
            attackType: attackType
        };

        const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
        attackSystem.addToQueue(attackData);
        
        this.updateQueueStatus();
        alert('✅ Ataque adicionado à fila!');
    }

    getSelectedTroops() {
        const troops = {};
        const inputs = document.querySelectorAll('#troops-selector input[type="number"]');
        
        inputs.forEach(input => {
            const troopType = input.id.replace('troop-', '');
            const count = parseInt(input.value) || 0;
            if (count > 0) {
                troops[troopType] = count;
            }
        });
        
        return troops;
    }

    async collectTroops() {
        try {
            const troopsCollector = this.bot.getModule('troopsCollector') || new TroopsCollector();
            const troopsData = await troopsCollector.collectAllVillagesTroops();
            
            this.displayTroopsSummary(troopsData);
            
        } catch (error) {
            console.error('Erro ao coletar tropas:', error);
            alert('❌ Erro ao coletar tropas');
        }
    }

    displayTroopsSummary(troopsData) {
        const summary = document.getElementById('troops-summary');
        
        let html = `
            <h4>📊 Resumo de Tropas (${troopsData.villageCount} vilas)</h4>
            <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 6px; margin: 10px 0;">
        `;
        
        troopsData.activeNames.forEach((name, i) => {
            const count = troopsData.total[i];
            if (count > 0) {
                html += `
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>⚔️ ${name}:</span>
                        <strong>${count.toLocaleString()}</strong>
                    </div>
                `;
            }
        });
        
        const grandTotal = troopsData.total.reduce((sum, count) => sum + count, 0);
        html += `
                <hr style="margin: 10px 0; border-color: #34495e;">
                <div style="display: flex; justify-content: space-between; font-size: 16px;">
                    <span>📊 <strong>Total Geral:</strong></span>
                    <strong>${grandTotal.toLocaleString()}</strong>
                </div>
            </div>
        `;
        
        summary.innerHTML = html;
        this.updateLastUpdate();
    }

    displayAttackResult(result) {
        const resultsContainer = document.getElementById('attack-results');
        const resultDiv = document.createElement('div');
        resultDiv.className = `attack-result ${result.success ? 'success' : 'error'}`;
        
        const time = new Date(result.timestamp).toLocaleTimeString();
        resultDiv.innerHTML = `
            <div><strong>${time}</strong> - ${result.target}</div>
            <div>${result.success ? result.message : `❌ ${result.error}`}</div>
        `;
        
        resultsContainer.insertBefore(resultDiv, resultsContainer.firstChild);
        
        // Manter apenas os últimos 50 resultados
        while (resultsContainer.children.length > 50) {
            resultsContainer.removeChild(resultsContainer.lastChild);
        }
        
        this.attackResults.push(result);
    }

    processQueue() {
        const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
        attackSystem.processQueue();
    }

    clearQueue() {
        if (confirm('❓ Tem certeza que deseja limpar a fila de ataques?')) {
            const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
            attackSystem.clearQueue();
            this.updateQueueStatus();
        }
    }

    updateQueueStatus() {
        const attackSystem = this.bot.getModule('attackSystem') || new AttackSystem();
        const status = attackSystem.getQueueStatus();
        
        document.getElementById('queue-count').textContent = status.total;
        
        // Atualizar indicador visual se estiver processando
        const statusIndicator = document.querySelector('.status-indicator');
        if (status.processing) {
            statusIndicator.className = 'status-indicator status-busy';
        } else {
            statusIndicator.className = 'status-indicator status-online';
        }
    }

    saveSettings() {
        const settings = {
            attackInterval: document.getElementById('attack-interval').value,
            maxDistance: document.getElementById('max-distance').value,
            antiDetection: document.getElementById('anti-detection').value
        };
        
        localStorage.setItem('twbot-settings', JSON.stringify(settings));
        alert('✅ Configurações salvas!');
    }

    resetSettings() {
        if (confirm('❓ Restaurar configurações padrão?')) {
            document.getElementById('attack-interval').value = '3000';
            document.getElementById('max-distance').value = '50';
            document.getElementById('anti-detection').value = 'medium';
            
            localStorage.removeItem('twbot-settings');
            alert('✅ Configurações restauradas!');
        }
    }

    makeDraggable() {
        const header = this.panel.querySelector('.bot-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - this.panel.offsetLeft;
            initialY = e.clientY - this.panel.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                this.panel.style.left = currentX + 'px';
                this.panel.style.top = currentY + 'px';
                this.panel.style.right = 'auto';
                this.panel.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    updateLastUpdate() {
        const now = new Date();
        document.getElementById('last-update').textContent = 
            `Última atualização: ${now.toLocaleTimeString()}`;
    }

    show() {
        this.panel.style.display = 'block';
        this.isVisible = true;
        this.updateLastUpdate();
    }

    hide() {
        this.panel.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BotInterface = BotInterface;
    console.log('✅ BotInterface exportado para window');
}

// Confirmar execução
console.log('📦 Arquivo src/ui/interface.js executado com sucesso');