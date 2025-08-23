/**
 * Sistema de Ataques Avançado
 * Versão melhorada do attack.js original com recursos extras
 */

class AttackSystem {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentVillage = this.getCurrentVillage();
        this.attackQueue = [];
        this.isProcessing = false;
        this.minInterval = 2000; // 2 segundos mínimo entre ataques
        this.maxInterval = 5000; // 5 segundos máximo
    }

    getCurrentVillage() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('village') || game_data?.village?.id;
    }

    async getCSRFToken(villageId = null) {
        const village = villageId || this.currentVillage;
        
        // Métodos múltiplos para obter token
        let token = document.querySelector('input[name="h"]')?.value ||
                   document.querySelector('meta[name="csrf-token"]')?.content;
                   
        if (token) return token;
        
        // Buscar em scripts da página
        const pageHTML = document.documentElement.innerHTML;
        let match = pageHTML.match(/[&?]h=([a-f0-9]+)/) || 
                   pageHTML.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
        
        if (match) return match[1];
        
        // Último recurso: carregar página de ataque
        try {
            const response = await fetch(`game.php?village=${village}&screen=place`);
            const html = await response.text();
            const tokenMatch = html.match(/name="h" value="([^"]+)"/);
            return tokenMatch ? tokenMatch[1] : null;
        } catch {
            return null;
        }
    }

    async sendSingleAttack(attackData) {
        const { sourceVillage, targetCoords, troops, attackType = 'attack' } = attackData;
        
        if (!this.validateAttackData(attackData)) {
            throw new Error('Dados de ataque inválidos');
        }

        try {
            // Preparar ataque
            const prepareResult = await this.prepareAttack(attackData);
            
            // Confirmar ataque
            const confirmResult = await this.confirmAttack(
                sourceVillage,
                prepareResult.confirmData,
                prepareResult.token
            );

            return {
                success: true,
                message: `✅ Ataque enviado para ${targetCoords}`,
                duration: confirmResult.duration,
                target: targetCoords,
                timestamp: new Date()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                target: targetCoords,
                timestamp: new Date()
            };
        }
    }

    async prepareAttack(attackData) {
        const { sourceVillage, targetCoords, troops, attackType } = attackData;
        const [x, y] = targetCoords.split('|');
        const token = await this.getCSRFToken(sourceVillage);
        
        if (!token) {
            throw new Error('Token CSRF não encontrado');
        }

        const url = attackType === 'support' 
            ? `game.php?village=${sourceVillage}&screen=place&mode=support`
            : `game.php?village=${sourceVillage}&screen=place`;

        const formData = new FormData();
        formData.append('x', x);
        formData.append('y', y);
        formData.append('target_type', 'coord');
        formData.append('h', token);

        // Adicionar tropas
        Object.entries(troops).forEach(([unit, count]) => {
            if (count > 0) {
                formData.append(unit, count.toString());
            }
        });

        // Adicionar comando
        formData.append(attackType === 'support' ? 'support' : 'attack', 
                       attackType === 'support' ? 'Apoiar' : 'Atacar');

        const confirmUrl = `game.php?village=${sourceVillage}&screen=place&try=confirm`;
        const response = await fetch(confirmUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro na preparação do ataque');
        }

        const html = await response.text();

        // Verificar erros
        if (html.includes('error_box')) {
            const errorMatch = html.match(/<div[^>]*class="error_box"[^>]*>(.*?)<\/div>/s);
            const errorMsg = errorMatch 
                ? errorMatch[1].replace(/<[^>]*>/g, '').trim() 
                : 'Erro desconhecido';
            throw new Error(errorMsg);
        }

        return {
            confirmData: this.extractConfirmationData(html),
            token,
            html
        };
    }

    async confirmAttack(sourceVillage, confirmData, token) {
        const formData = new FormData();
        formData.append('h', token);

        Object.entries(confirmData).forEach(([key, value]) => {
            if (key !== 'h') {
                formData.append(key, value);
            }
        });

        const finalUrl = `game.php?village=${sourceVillage}&screen=place&action=command&h=${token}`;
        const response = await fetch(finalUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro na confirmação do ataque');
        }

        const html = await response.text();

        const isSuccess = html.includes('command_sent') || 
                         html.includes('enviado') || 
                         html.includes('sent');

        if (!isSuccess) {
            throw new Error('Falha na confirmação - verifique tropas disponíveis');
        }

        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        const duration = durationMatch ? `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}` : null;

        return { success: true, duration };
    }

    // Sistema de fila para ataques múltiplos
    addToQueue(attackData) {
        this.attackQueue.push({
            ...attackData,
            id: Date.now() + Math.random(),
            addedAt: new Date()
        });

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.attackQueue.length === 0 || this.isProcessing) return;

        this.isProcessing = true;
        console.log(`🎯 Processando ${this.attackQueue.length} ataques na fila...`);

        while (this.attackQueue.length > 0) {
            const attack = this.attackQueue.shift();
            
            try {
                const result = await this.sendSingleAttack(attack);
                console.log(result.success ? result.message : `❌ ${result.error}`);
                
                // Dispatch evento para UI
                window.dispatchEvent(new CustomEvent('attackResult', { 
                    detail: result 
                }));
                
            } catch (error) {
                console.error(`❌ Erro no ataque ${attack.targetCoords}:`, error);
            }

            // Intervalo aleatório entre ataques
            if (this.attackQueue.length > 0) {
                const delay = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        this.isProcessing = false;
        console.log('✅ Fila de ataques processada');
    }

    // Ataques coordenados com timing específico
    scheduleCoordinatedAttacks(attacks, arrivalTime) {
        const results = [];
        
        attacks.forEach(attack => {
            const distance = this.calculateDistance(attack.sourceCoords, attack.targetCoords);
            const travelTime = this.calculateTravelTime(distance, attack.slowestUnit);
            const sendTime = arrivalTime - travelTime;
            const delay = sendTime - Date.now();
            
            if (delay > 0) {
                setTimeout(() => {
                    this.addToQueue(attack);
                }, delay);
                
                results.push({
                    target: attack.targetCoords,
                    sendTime: new Date(sendTime),
                    arrivalTime: new Date(arrivalTime),
                    status: 'agendado'
                });
            } else {
                results.push({
                    target: attack.targetCoords,
                    status: 'muito tarde',
                    error: 'Tempo insuficiente para enviar'
                });
            }
        });
        
        return results;
    }

    calculateDistance(coord1, coord2) {
        const [x1, y1] = typeof coord1 === 'string' ? coord1.split('|').map(Number) : [coord1.x, coord1.y];
        const [x2, y2] = typeof coord2 === 'string' ? coord2.split('|').map(Number) : [coord2.x, coord2.y];
        
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    calculateTravelTime(distance, unitType = 'light') {
        const speeds = {
            spear: 18, sword: 22, axe: 18, archer: 18,
            scout: 9, light: 10, marcher: 10, heavy: 11,
            ram: 30, catapult: 30, knight: 10, nobleman: 35
        };
        
        const baseSpeed = speeds[unitType] || 18;
        const worldSpeed = game_data?.speed || 1;
        const unitSpeed = game_data?.config?.unit_speed || 1;
        
        return Math.round(distance * baseSpeed / (worldSpeed * unitSpeed) * 60 * 1000); // em milissegundos
    }

    extractConfirmationData(html) {
        const confirmData = {};
        const hiddenInputs = html.match(/<input[^>]*type="hidden"[^>]*>/g) || [];
        
        hiddenInputs.forEach(input => {
            const nameMatch = input.match(/name="([^"]+)"/);
            const valueMatch = input.match(/value="([^"]*)"/);
            if (nameMatch && valueMatch) {
                confirmData[nameMatch[1]] = valueMatch[1];
            }
        });

        return confirmData;
    }

    validateAttackData(data) {
        if (!data || !data.sourceVillage || !data.targetCoords || !data.troops) {
            return false;
        }

        if (!data.targetCoords.match(/^\d+\|\d+$/)) {
            return false;
        }

        const hasTroops = Object.values(data.troops).some(count => count > 0);
        return hasTroops;
    }

    // Obter tropas disponíveis
    async getAvailableTroops(villageId = null) {
        const village = villageId || this.currentVillage;
        
        try {
            const response = await fetch(`game.php?village=${village}&screen=place`);
            const html = await response.text();
            
            const troops = {};
            const unitTypes = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
            
            unitTypes.forEach(unit => {
                const match = html.match(new RegExp(`name="${unit}"[^>]*>\\s*(\\d+)`, 'i'));
                troops[unit] = match ? parseInt(match[1]) : 0;
            });
            
            return troops;
        } catch (error) {
            throw new Error(`Erro ao obter tropas: ${error.message}`);
        }
    }

    // Status da fila
    getQueueStatus() {
        return {
            total: this.attackQueue.length,
            processing: this.isProcessing,
            queue: this.attackQueue.map(attack => ({
                id: attack.id,
                target: attack.targetCoords,
                addedAt: attack.addedAt
            }))
        };
    }

    // Limpar fila
    clearQueue() {
        this.attackQueue = [];
        console.log('🧹 Fila de ataques limpa');
    }
}

// Registrar módulo globalmente
if (typeof window !== 'undefined') {
    window.AttackSystem = AttackSystem;
    
    if (window.twBot) {
        window.twBot.registerModule('attackSystem', new AttackSystem());
    }
}