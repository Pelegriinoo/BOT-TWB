/**
 * Tribal Wars Attack System - Sistema completo de envio de ataques
 * @version 2.0.0
 * @author BOT-TWB
 */

import { ATTACK_TYPES, STATUS_CODES } from '../config/constants.js';

export class AttackSystem {
    constructor(api, authManager, troopsManager) {
        this.api = api;
        this.auth = authManager;
        this.troops = troopsManager;
        this.attackHistory = [];
        this.isProcessing = false;
    }

    /**
     * Prepara ataque (primeiro passo)
     */
    async prepareAttack(attackData) {
        const { sourceVillage, targetCoords, troops, attackType = 'attack' } = attackData;

        // Validações
        const validation = this.validateAttackData(attackData);
        if (!validation.valid) {
            throw new Error(`Dados inválidos: ${validation.reason}`);
        }

        // Obter token CSRF
        const token = await this.auth.getCSRFToken(sourceVillage);
        if (!token) {
            throw new Error('Não foi possível obter token de autenticação');
        }

        // Preparar coordenadas
        const [x, y] = targetCoords.split('|');

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

        // Adicionar tipo de ataque
        const attackConfig = ATTACK_TYPES[attackType];
        if (attackConfig) {
            formData.append(attackConfig.param, this.getAttackButtonText(attackType));
        }

        // Determinar URL baseada no tipo
        const screenParam = attackType === 'support' ? 'mode=support' : '';
        const baseParams = {
            village: sourceVillage,
            screen: 'place'
        };

        if (screenParam) {
            baseParams.mode = 'support';
        }

        // Enviar para página de confirmação
        const confirmUrl = this.api.buildUrl('game.php', {
            ...baseParams,
            try: 'confirm'
        });

        try {
            const response = await fetch(confirmUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Verificar erros na resposta
            this.api.checkForErrors(html);

            // Extrair dados de confirmação
            const confirmData = this.api.extractHiddenInputs(html);

            // Extrair informações adicionais
            const attackInfo = this.extractAttackInfo(html);

            return {
                confirmData,
                token,
                html,
                attackInfo,
                status: STATUS_CODES.SUCCESS
            };

        } catch (error) {
            throw new Error(`Erro na preparação: ${error.message}`);
        }
    }

    /**
     * Confirma e envia ataque (segundo passo)
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

        const finalUrl = this.api.buildUrl('game.php', {
            village: sourceVillage,
            screen: 'place',
            action: 'command',
            h: token
        });

        try {
            const response = await fetch(finalUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Verificar sucesso
            const success = this.checkAttackSuccess(html);
            if (!success.isSuccess) {
                throw new Error(success.reason || 'Falha na confirmação do ataque');
            }

            // Extrair informações do resultado
            const resultInfo = this.extractResultInfo(html);

            return {
                success: true,
                ...resultInfo,
                status: STATUS_CODES.COMPLETED
            };

        } catch (error) {
            throw new Error(`Erro na confirmação: ${error.message}`);
        }
    }

    /**
     * Envia ataque completo (combina preparação + confirmação)
     */
    async sendAttack(attackData) {
        if (this.isProcessing) {
            throw new Error('Outro ataque está sendo processado');
        }

        this.isProcessing = true;

        try {
            // Log do início do ataque
            this.logAttack(attackData, STATUS_CODES.LOADING);

            // Verificar tropas disponíveis
            const availableTroops = await this.troops.getAvailableTroops(attackData.sourceVillage);
            const validation = this.troops.validateTroopData(attackData.troops, availableTroops);
            
            if (!validation.valid) {
                throw new Error(`Tropas insuficientes: ${validation.reason}`);
            }

            // Preparar ataque
            const prepareResult = await this.prepareAttack(attackData);

            // Confirmar ataque
            const confirmResult = await this.confirmAttack(
                attackData.sourceVillage,
                prepareResult.confirmData,
                prepareResult.token
            );

            // Criar resultado final
            const result = {
                success: true,
                message: `Ataque enviado para ${attackData.targetCoords}`,
                target: attackData.targetCoords,
                attackType: attackData.attackType,
                duration: confirmResult.duration,
                arrivalTime: confirmResult.arrivalTime,
                troops: attackData.troops,
                attackInfo: prepareResult.attackInfo,
                timestamp: new Date().toISOString()
            };

            // Log do sucesso
            this.logAttack({ ...attackData, result }, STATUS_CODES.SUCCESS);

            return result;

        } catch (error) {
            // Log do erro
            this.logAttack({ ...attackData, error: error.message }, STATUS_CODES.ERROR);

            return {
                success: false,
                error: error.message,
                target: attackData.targetCoords,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Envia múltiplos ataques em sequência
     */
    async sendMultipleAttacks(attacksList, options = {}) {
        const { delay = 1000, stopOnError = false } = options;
        const results = [];

        for (let i = 0; i < attacksList.length; i++) {
            const attackData = attacksList[i];

            try {
                const result = await this.sendAttack(attackData);
                results.push(result);

                if (!result.success && stopOnError) {
                    break;
                }

                // Delay entre ataques
                if (i < attacksList.length - 1 && delay > 0) {
                    await this.sleep(delay);
                }

            } catch (error) {
                const errorResult = {
                    success: false,
                    error: error.message,
                    target: attackData.targetCoords,
                    index: i
                };
                results.push(errorResult);

                if (stopOnError) {
                    break;
                }
            }
        }

        return {
            total: attacksList.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    /**
     * Valida dados do ataque
     */
    validateAttackData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, reason: 'Dados de ataque inválidos' };
        }

        // Verificar vila origem
        if (!data.sourceVillage) {
            return { valid: false, reason: 'Vila de origem não especificada' };
        }

        // Verificar coordenadas de destino
        const coordsValidation = this.api.validateCoordinates(data.targetCoords);
        if (!coordsValidation.valid) {
            return coordsValidation;
        }

        // Verificar tropas
        if (!data.troops || typeof data.troops !== 'object') {
            return { valid: false, reason: 'Tropas não especificadas' };
        }

        const troopsValidation = this.troops.validateTroopData(data.troops);
        if (!troopsValidation.valid) {
            return troopsValidation;
        }

        // Verificar tipo de ataque
        if (data.attackType && !ATTACK_TYPES[data.attackType]) {
            return { valid: false, reason: 'Tipo de ataque inválido' };
        }

        return { valid: true };
    }

    /**
     * Extrai informações do ataque da página de confirmação
     */
    extractAttackInfo(html) {
        const info = {};

        // Extrair tempo de viagem
        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        if (durationMatch) {
            info.duration = `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}`;
            
            // Calcular hora de chegada
            const [hours, minutes, seconds] = durationMatch.slice(1).map(Number);
            const durationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            info.arrivalTime = new Date(Date.now() + durationMs);
        }

        // Extrair informações do alvo
        const targetMatch = html.match(/(\d+\|\d+)/);
        if (targetMatch) {
            info.targetCoords = targetMatch[1];
        }

        // Extrair nome da vila alvo se disponível
        const villageNameMatch = html.match(/<span[^>]*>([^<]+)<\/span>[^<]*\(\d+\|\d+\)/);
        if (villageNameMatch) {
            info.targetVillageName = villageNameMatch[1].trim();
        }

        return info;
    }

    /**
     * Extrai informações do resultado do ataque
     */
    extractResultInfo(html) {
        const info = {};

        // Extrair tempo de viagem do resultado
        const durationMatch = html.match(/(\d+):(\d+):(\d+)/);
        if (durationMatch) {
            info.duration = `${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]}`;
        }

        // Extrair ID do comando se disponível
        const commandMatch = html.match(/command=(\d+)/);
        if (commandMatch) {
            info.commandId = commandMatch[1];
        }

        return info;
    }

    /**
     * Verifica se o ataque foi enviado com sucesso
     */
    checkAttackSuccess(html) {
        // Indicadores de sucesso
        const successIndicators = [
            'command_sent',
            'enviado',
            'sent',
            'gesendet',
            'wysłano'
        ];

        const isSuccess = successIndicators.some(indicator => 
            html.toLowerCase().includes(indicator)
        );

        if (isSuccess) {
            return { isSuccess: true };
        }

        // Verificar erros específicos
        if (html.includes('error_box')) {
            const errorMatch = html.match(/<div[^>]*class="error_box"[^>]*>(.*?)<\/div>/s);
            if (errorMatch) {
                const reason = errorMatch[1].replace(/<[^>]*>/g, '').trim();
                return { isSuccess: false, reason };
            }
        }

        return { isSuccess: false, reason: 'Falha na confirmação' };
    }

    /**
     * Obtém texto do botão de ataque baseado no tipo
     */
    getAttackButtonText(attackType) {
        const locale = this.api.gameData.locale || 'pt_BR';
        
        const buttonTexts = {
            'pt_BR': {
                attack: 'Atacar',
                support: 'Apoiar'
            },
            'en_DK': {
                attack: 'Attack',
                support: 'Support'
            },
            'de_DE': {
                attack: 'Angriff',
                support: 'Unterstützung'
            }
        };

        return buttonTexts[locale]?.[attackType] || buttonTexts['pt_BR'][attackType] || 'Atacar';
    }

    /**
     * Log de ataques
     */
    logAttack(attackData, status) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            status,
            sourceVillage: attackData.sourceVillage,
            targetCoords: attackData.targetCoords,
            attackType: attackData.attackType || 'attack',
            troops: attackData.troops,
            error: attackData.error,
            result: attackData.result
        };

        this.attackHistory.push(logEntry);

        // Manter apenas os últimos 100 logs
        if (this.attackHistory.length > 100) {
            this.attackHistory = this.attackHistory.slice(-100);
        }

        // Log no console se habilitado
        if (window.TWB_DEBUG) {
            console.log('Attack Log:', logEntry);
        }
    }

    /**
     * Obtém histórico de ataques
     */
    getAttackHistory() {
        return [...this.attackHistory];
    }

    /**
     * Limpa histórico de ataques
     */
    clearHistory() {
        this.attackHistory = [];
    }

    /**
     * Utility: Sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtém estatísticas dos ataques
     */
    getAttackStats() {
        const total = this.attackHistory.length;
        const successful = this.attackHistory.filter(log => log.status === STATUS_CODES.SUCCESS).length;
        const failed = this.attackHistory.filter(log => log.status === STATUS_CODES.ERROR).length;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? Math.round((successful / total) * 100) : 0
        };
    }
}