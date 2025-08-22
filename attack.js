/**
 * Módulo Independente de Ataque para Tribal Wars (JavaScript)
 * Pode ser usado por qualquer sistema de agendamento externo
 * 
 * Uso:
 * const attacker = new TribalWarsAttacker();
 * const result = await attacker.sendAttack({
 *   sourceVillage: '12345',
 *   targetCoords: '611|544',
 *   troops: { sword: 1, spear: 100 },
 *   attackType: 'attack'
 * });
 */

class TribalWarsAttacker {
    constructor() {
        this.lastToken = null;
        this.baseUrl = window.location.origin;
        this.currentVillage = this.getCurrentVillage();
        
        // Event listeners para logs
        this.onLog = null;
        this.onError = null;
        this.onSuccess = null;
    }

    /**
     * Obtém a vila atual da URL
     */
    getCurrentVillage() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('village');
    }

    /**
     * Extrai token CSRF da página
     */
    async getToken(villageId = null) {
        try {
            const village = villageId || this.currentVillage;
            
            // Múltiplas tentativas de extrair token H
            let token = document.querySelector('input[name="h"]')?.value;
            if (token) return token;
            
            const pageText = document.documentElement.innerHTML;
            let match = pageText.match(/[&?]h=([a-f0-9]+)/);
            if (match) return match[1];
            
            const scripts = [...document.querySelectorAll('script')];
            for (let script of scripts) {
                match = script.textContent.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
                if (match) return match[1];
                
                match = script.textContent.match(/&h=([a-f0-9]+)/);
                if (match) return match[1];
            }
            
            // Se não encontrou, carrega página para obter token
            const placeUrl = `game.php?village=${village}&screen=place`;
            const response = await fetch(placeUrl);
            const html = await response.text();
            
            const tokenMatch = html.match(/name="h" value="([^"]+)"/);
            return tokenMatch ? tokenMatch[1] : null;
            
        } catch (error) {
            this.log('error', `Erro ao obter token: ${error.message}`);
            return null;
        }
    }

    /**
     * Envia ataque para coordenadas específicas
     * 
     * @param {Object} attackData - Dados do ataque
     * @param {string} attackData.sourceVillage - ID da vila de origem
     * @param {string} attackData.targetCoords - Coordenadas no formato "x|y"
     * @param {string} attackData.targetVillageId - ID da vila alvo (alternativa às coordenadas)
     * @param {Object} attackData.troops - Tropas {spear: 10, sword: 5, etc.}
     * @param {string} attackData.attackType - Tipo: 'attack', 'support', 'scout'
     * @returns {Promise<Object>} Resultado do ataque
     */
    async sendAttack(attackData) {
        try {
            this.log('info', `Iniciando ataque: ${JSON.stringify(attackData)}`);

            // Validação básica
            if (!this.validateAttackData(attackData)) {
                throw new Error('Dados de ataque inválidos');
            }

            const { sourceVillage, targetCoords, targetVillageId, troops, attackType = 'attack' } = attackData;

            // Determinar coordenadas
            let x, y;
            if (targetCoords) {
                if (!targetCoords.match(/^\d+\|\d+$/)) {
                    throw new Error('Formato de coordenadas inválido (use x|y)');
                }
                [x, y] = targetCoords.split('|');
            } else if (targetVillageId) {
                // Para ID de vila, precisaríamos consultar a API para obter coordenadas
                // Por simplicidade, vamos assumir que temos as coordenadas
                throw new Error('Suporte a targetVillageId requer implementação adicional');
            } else {
                throw new Error('Especifique targetCoords ou targetVillageId');
            }

            // Obter token CSRF
            const token = await this.getToken(sourceVillage);
            if (!token) {
                throw new Error('Token CSRF não encontrado');
            }

            // Passo 1: Preparar ataque
            const prepareResult = await this.prepareAttack(sourceVillage, x, y, troops, attackType, token);
            if (!prepareResult.success) {
                throw new Error(`Erro na preparação: ${prepareResult.error}`);
            }

            // Passo 2: Confirmar ataque
            const confirmResult = await this.confirmAttack(sourceVillage, prepareResult.confirmData, token);
            if (!confirmResult.success) {
                throw new Error(`Erro na confirmação: ${confirmResult.error}`);
            }

            this.log('success', `Ataque enviado com sucesso para ${targetCoords || targetVillageId}!`);
            return {
                success: true,
                message: `Ataque enviado para ${targetCoords || targetVillageId}`,
                duration: confirmResult.duration,
                target: targetCoords || targetVillageId
            };

        } catch (error) {
            this.log('error', `Erro no envio do ataque: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Prepara o ataque (primeiro passo)
     */
    async prepareAttack(villageId, x, y, troops, attackType, token) {
        try {
            // Preparar URL baseado no tipo de ataque
            let url;
            if (attackType === 'support') {
                url = `game.php?village=${villageId}&screen=place&mode=support`;
            } else {
                url = `game.php?village=${villageId}&screen=place`;
            }

            // Preparar dados do formulário
            const formData = new FormData();
            formData.append('x', x);
            formData.append('y', y);
            formData.append('target_type', 'coord');
            formData.append('h', token);

            // Adicionar tropas
            Object.entries(troops).forEach(([unit, count]) => {
                if (count > 0) {
                    formData.append(unit, count);
                }
            });

            // Adicionar comando baseado no tipo
            if (attackType === 'support') {
                formData.append('support', 'Ondersteunen');
            } else {
                formData.append('attack', 'Atacar');
            }

            // Enviar para confirmação
            const confirmUrl = `game.php?village=${villageId}&screen=place&try=confirm`;
            const response = await fetch(confirmUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro na requisição de preparação');
            }

            const html = await response.text();

            // Verificar erros
            if (html.includes('error_box') || html.includes('Erro')) {
                const errorMatch = html.match(/<div[^>]*class="error_box"[^>]*>(.*?)<\/div>/s);
                const errorMsg = errorMatch ? errorMatch[1].replace(/<[^>]*>/g, '').trim() : 'Erro desconhecido';
                throw new Error(`Erro do jogo: ${errorMsg}`);
            }

            // Extrair dados de confirmação
            const confirmData = this.extractConfirmData(html);

            return {
                success: true,
                confirmData: confirmData,
                html: html
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Confirma o ataque (segundo passo)
     */
    async confirmAttack(villageId, confirmData, token) {
        try {
            const finalData = new FormData();
            finalData.append('h', token);

            // Adicionar todos os dados de confirmação
            Object.entries(confirmData).forEach(([key, value]) => {
                if (key !== 'h') {
                    finalData.append(key, value);
                }
            });

            // Confirmar ataque
            const finalUrl = `game.php?village=${villageId}&screen=place&action=command&h=${token}`;
            const response = await fetch(finalUrl, {
                method: 'POST',
                body: finalData
            });

            if (!response.ok) {
                throw new Error('Erro na confirmação do ataque');
            }

            const html = await response.text();

            // Verificar se foi bem-sucedido
            if (html.includes('command_sent') || html.includes('enviado')) {
                // Extrair duração se possível
                const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
                let duration = null;
                if (durationMatch) {
                    const [, hours, minutes, seconds] = durationMatch;
                    duration = `${hours}:${minutes}:${seconds}`;
                }

                return {
                    success: true,
                    duration: duration
                };
            } else {
                throw new Error('Confirmação falhou - verifique se há tropas suficientes');
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extrai dados de confirmação do HTML
     */
    extractConfirmData(html) {
        const confirmData = {};
        
        // Extrair todos os inputs hidden
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

    /**
     * Valida dados do ataque
     */
    validateAttackData(data) {
        if (!data) return false;
        if (!data.sourceVillage) return false;
        if (!data.targetCoords && !data.targetVillageId) return false;
        if (!data.troops || Object.keys(data.troops).length === 0) return false;

        // Verificar se há pelo menos 1 tropa
        const hasTroops = Object.values(data.troops).some(count => count > 0);
        if (!hasTroops) return false;

        return true;
    }

    /**
     * Sistema de logging
     */
    log(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(`[TWAttacker] ${logMessage}`);
        
        // Disparar eventos personalizados
        switch (type) {
            case 'error':
                if (this.onError) this.onError(logMessage);
                break;
            case 'success':
                if (this.onSuccess) this.onSuccess(logMessage);
                break;
            default:
                if (this.onLog) this.onLog(logMessage);
        }
    }

    /**
     * Configurar callbacks de eventos
     */
    setEventListeners(callbacks) {
        this.onLog = callbacks.onLog || null;
        this.onError = callbacks.onError || null;
        this.onSuccess = callbacks.onSuccess || null;
    }
}

// ==========================================
// EXEMPLO DE USO COM AGENDADOR
// ==========================================

/**
 * Classe de exemplo para agendamento de ataques
 */
class AttackScheduler {
    constructor() {
        this.attacker = new TribalWarsAttacker();
        this.scheduledAttacks = new Map();
        this.isRunning = false;

        // Configurar callbacks
        this.attacker.setEventListeners({
            onLog: (msg) => this.log(`INFO: ${msg}`),
            onError: (msg) => this.log(`ERROR: ${msg}`),
            onSuccess: (msg) => this.log(`SUCCESS: ${msg}`)
        });
    }

    /**
     * Agendar um ataque
     * 
     * @param {string} id - ID único do ataque
     * @param {Date} scheduledTime - Horário agendado
     * @param {Object} attackData - Dados do ataque
     */
    scheduleAttack(id, scheduledTime, attackData) {
        this.scheduledAttacks.set(id, {
            id,
            scheduledTime,
            attackData,
            status: 'scheduled'
        });

        this.log(`Ataque agendado: ${id} para ${scheduledTime.toLocaleString()}`);
        
        if (!this.isRunning) {
            this.startScheduler();
        }
    }

    /**
     * Iniciar o agendador
     */
    startScheduler() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.log('Agendador iniciado');
        
        this.schedulerInterval = setInterval(() => {
            this.checkScheduledAttacks();
        }, 1000); // Verificar a cada segundo
    }

    /**
     * Parar o agendador
     */
    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
        }
        this.isRunning = false;
        this.log('Agendador parado');
    }

    /**
     * Verificar ataques agendados
     */
    async checkScheduledAttacks() {
        const now = new Date();
        
        for (const [id, attack] of this.scheduledAttacks) {
            if (attack.status === 'scheduled' && now >= attack.scheduledTime) {
                attack.status = 'executing';
                this.log(`Executando ataque: ${id}`);
                
                try {
                    const result = await this.attacker.sendAttack(attack.attackData);
                    
                    if (result.success) {
                        attack.status = 'completed';
                        this.log(`Ataque ${id} enviado com sucesso!`);
                    } else {
                        attack.status = 'failed';
                        this.log(`Ataque ${id} falhou: ${result.error}`);
                    }
                } catch (error) {
                    attack.status = 'failed';
                    this.log(`Erro ao executar ataque ${id}: ${error.message}`);
                }
            }
        }
    }

    /**
     * Remover ataque agendado
     */
    removeAttack(id) {
        if (this.scheduledAttacks.has(id)) {
            this.scheduledAttacks.delete(id);
            this.log(`Ataque removido: ${id}`);
        }
    }

    /**
     * Listar ataques agendados
     */
    listAttacks() {
        return Array.from(this.scheduledAttacks.values());
    }

    /**
     * Logging
     */
    log(message) {
        console.log(`[AttackScheduler] ${new Date().toLocaleTimeString()} - ${message}`);
    }
}

// ==========================================
// EXEMPLO DE USO PRÁTICO
// ==========================================

/*
// Exemplo 1: Uso direto
const attacker = new TribalWarsAttacker();

const result = await attacker.sendAttack({
    sourceVillage: '12345',
    targetCoords: '611|544',
    troops: { sword: 1, spear: 100 },
    attackType: 'attack'
});

console.log(result);

// Exemplo 2: Uso com agendador
const scheduler = new AttackScheduler();

// Agendar ataque para daqui a 5 minutos
const attackTime = new Date(Date.now() + 5 * 60 * 1000);

scheduler.scheduleAttack('farm_001', attackTime, {
    sourceVillage: '12345',
    targetCoords: '611|544',
    troops: { sword: 1 },
    attackType: 'attack'
});

// Exemplo 3: Interface simples
function createSimpleInterface() {
    const button = document.createElement('button');
    button.textContent = 'Enviar Ataque Teste';
    button.onclick = async () => {
        const attacker = new TribalWarsAttacker();
        const result = await attacker.sendAttack({
            sourceVillage: attacker.getCurrentVillage(),
            targetCoords: '611|544',
            troops: { sword: 1 },
            attackType: 'attack'
        });
        alert(result.success ? 'Sucesso!' : `Erro: ${result.error}`);
    };
    document.body.appendChild(button);
}
*/

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TribalWarsAttacker = TribalWarsAttacker;
    window.AttackScheduler = AttackScheduler;
}