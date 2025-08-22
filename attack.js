/**
 * TribalWars Attack API - Core Functions Only
 * Versão limpa para integração com interfaces externas
 */

class TribalWarsAttackAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentVillage = this.getCurrentVillage();
    }

    /**
     * Obtém a vila atual da URL
     */
    getCurrentVillage() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('village') || game_data?.village?.id;
    }

    /**
     * Extrai token CSRF da página atual
     */
    async getCSRFToken(villageId = null) {
        const village = villageId || this.currentVillage;
        
        // Tentar obter token da página atual
        let token = document.querySelector('input[name="h"]')?.value;
        if (token) return token;
        
        // Buscar em scripts da página
        const pageHTML = document.documentElement.innerHTML;
        let match = pageHTML.match(/[&?]h=([a-f0-9]+)/);
        if (match) return match[1];
        
        match = pageHTML.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
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

    /**
     * Preparar dados de ataque (primeiro passo)
     * 
     * @param {Object} attackData
     * @param {string} attackData.sourceVillage - ID da vila origem
     * @param {string} attackData.targetCoords - Coordenadas "x|y"
     * @param {Object} attackData.troops - {spear: 10, sword: 5, ...}
     * @param {string} attackData.attackType - 'attack', 'support', 'scout'
     */
    async prepareAttack(attackData) {
        const { sourceVillage, targetCoords, troops, attackType = 'attack' } = attackData;
        
        if (!this.validateAttackData(attackData)) {
            throw new Error('Dados de ataque inválidos');
        }

        const [x, y] = targetCoords.split('|');
        const token = await this.getCSRFToken(sourceVillage);
        
        if (!token) {
            throw new Error('Token CSRF não encontrado');
        }

        // Preparar URL baseado no tipo
        const url = attackType === 'support' 
            ? `game.php?village=${sourceVillage}&screen=place&mode=support`
            : `game.php?village=${sourceVillage}&screen=place`;

        // Criar FormData
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
        if (attackType === 'support') {
            formData.append('support', 'Apoiar');
        } else {
            formData.append('attack', 'Atacar');
        }

        // Enviar para página de confirmação
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

        // Extrair dados de confirmação
        const confirmData = this.extractConfirmationData(html);

        return {
            confirmData,
            token,
            html
        };
    }

    /**
     * Confirmar e enviar ataque (segundo passo)
     */
    async confirmAttack(sourceVillage, confirmData, token) {
        const formData = new FormData();
        formData.append('h', token);

        // Adicionar dados de confirmação
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

        // Verificar sucesso
        const isSuccess = html.includes('command_sent') || 
                         html.includes('enviado') || 
                         html.includes('sent');

        if (!isSuccess) {
            throw new Error('Falha na confirmação - verifique tropas disponíveis');
        }

        // Extrair duração se disponível
        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        const duration = durationMatch ? `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}` : null;

        return {
            success: true,
            duration
        };
    }

    /**
     * Enviar ataque completo (combina preparação + confirmação)
     */
    async sendAttack(attackData) {
        try {
            // Preparar
            const prepareResult = await this.prepareAttack(attackData);
            
            // Confirmar
            const confirmResult = await this.confirmAttack(
                attackData.sourceVillage,
                prepareResult.confirmData,
                prepareResult.token
            );

            return {
                success: true,
                message: `Ataque enviado para ${attackData.targetCoords}`,
                duration: confirmResult.duration,
                target: attackData.targetCoords
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extrair dados de confirmação do HTML
     */
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

    /**
     * Validar dados de entrada
     */
    validateAttackData(data) {
        if (!data || !data.sourceVillage || !data.targetCoords || !data.troops) {
            return false;
        }

        // Verificar formato de coordenadas
        if (!data.targetCoords.match(/^\d+\|\d+$/)) {
            return false;
        }

        // Verificar se há pelo menos uma tropa
        const hasTroops = Object.values(data.troops).some(count => count > 0);
        return hasTroops;
    }

    /**
     * Obter tropas disponíveis na vila
     */
    async getAvailableTroops(villageId = null) {
        const village = villageId || this.currentVillage;
        
        try {
            const response = await fetch(`game.php?village=${village}&screen=place`);
            const html = await response.text();
            
            const troops = {};
            const unitTypes = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
            
            unitTypes.forEach(unit => {
                const match = html.match(new RegExp(`name="${unit}"[^>]*>\\s*(\\d+)`, 'i'));
                if (match) {
                    troops[unit] = parseInt(match[1]);
                }
            });
            
            return troops;
        } catch (error) {
            throw new Error(`Erro ao obter tropas: ${error.message}`);
        }
    }

    /**
     * Verificar se coordenadas são válidas
     */
    async validateTarget(targetCoords) {
        const [x, y] = targetCoords.split('|');
        
        // Validação básica de range (mapas Tribal Wars geralmente são até 1000x1000)
        if (x < 0 || x > 1000 || y < 0 || y > 1000) {
            return { valid: false, reason: 'Coordenadas fora do mapa' };
        }

        return { valid: true };
    }

    /**
     * Calcular tempo de viagem entre coordenadas
     */
    calculateTravelTime(sourceCoords, targetCoords, slowestUnit) {
        const [x1, y1] = sourceCoords.split('|').map(Number);
        const [x2, y2] = targetCoords.split('|').map(Number);
        
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Velocidades básicas (minutos por campo)
        const speeds = {
            snob: 35, ram: 30, catapult: 30, knight: 10, heavy: 11,
            sword: 22, axe: 18, archer: 18, spy: 9, light: 10,
            marcher: 5, spear: 18
        };
        
        const speed = speeds[slowestUnit] || 18;
        const travelMinutes = Math.round(distance * speed);
        
        return {
            distance: Math.round(distance * 100) / 100,
            travelTime: travelMinutes,
            arrivalTime: new Date(Date.now() + travelMinutes * 60 * 1000)
        };
    }
}

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

/**
 * Criar instância global
 */
function createAttackAPI() {
    return new TribalWarsAttackAPI();
}

/**
 * Envio rápido de ataque
 */
async function quickAttack(targetCoords, troops, attackType = 'attack') {
    const api = new TribalWarsAttackAPI();
    
    return await api.sendAttack({
        sourceVillage: api.getCurrentVillage(),
        targetCoords,
        troops,
        attackType
    });
}

/**
 * Verificar se sistema está disponível
 */
function isSystemReady() {
    return !!(window.game_data && window.game_data.village);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TribalWarsAttackAPI = TribalWarsAttackAPI;
    window.createAttackAPI = createAttackAPI;
    window.quickAttack = quickAttack;
    window.isSystemReady = isSystemReady;
}
