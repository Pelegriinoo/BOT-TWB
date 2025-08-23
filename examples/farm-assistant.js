/**
 * Exemplo: Assistente de Farm
 * Automatização de farm em bárbaros próximos
 */

class FarmAssistant {
    constructor() {
        this.bot = window.twBot;
        this.isRunning = false;
        this.farmConfig = {
            maxDistance: 20,
            troopsPerAttack: { light: 50, spy: 1 },
            intervalBetweenAttacks: 5000,
            maxAttacksPerHour: 50
        };
    }
    
    async startFarming() {
        if (this.isRunning) {
            console.log('⚠️ Farm já está rodando');
            return;
        }
        
        this.isRunning = true;
        console.log('🚀 Iniciando farm automático...');
        
        try {
            // Obter vilas do jogador
            const gameData = this.bot.getGameData();
            const myVillages = gameData.villages;
            
            // Para cada vila, buscar alvos próximos
            for (const village of myVillages) {
                if (!this.isRunning) break;
                
                await this.farmAroundVillage(village);
                
                // Pausa entre vilas
                await this.sleep(2000);
            }
            
        } catch (error) {
            console.error('❌ Erro no farm:', error);
        } finally {
            this.isRunning = false;
            console.log('✅ Farm finalizado');
        }
    }
    
    async farmAroundVillage(village) {
        console.log(`🏘️ Fazendo farm ao redor de ${village.name} (${village.coords})`);
        
        // Buscar alvos bárbaros (simulação - dependeria de API externa)
        const barbarianTargets = await this.findBarbarianTargets(village);
        
        for (const target of barbarianTargets) {
            if (!this.isRunning) break;
            
            try {
                // Verificar se tem tropas disponíveis
                const availableTroops = await this.bot.getModule('attackSystem')
                    .getAvailableTroops(village.id);
                
                if (availableTroops.light >= this.farmConfig.troopsPerAttack.light) {
                    // Enviar ataque
                    await this.bot.getModule('attackSystem').sendSingleAttack({
                        sourceVillage: village.id,
                        targetCoords: target,
                        troops: this.farmConfig.troopsPerAttack,
                        attackType: 'attack'
                    });
                    
                    console.log(`⚔️ Farm enviado: ${village.coords} → ${target}`);
                    
                    // Intervalo anti-detecção
                    await this.sleep(this.farmConfig.intervalBetweenAttacks);
                } else {
                    console.log(`⚠️ Tropas insuficientes em ${village.name}`);
                }
                
            } catch (error) {
                console.warn(`❌ Erro no farm ${target}:`, error);
            }
        }
    }
    
    async findBarbarianTargets(village) {
        // Simulação de busca de bárbaros
        // Na prática, precisaria de API externa ou scraping
        const targets = [];
        
        const [vX, vY] = [village.x, village.y];
        
        // Gerar coordenadas aleatórias próximas (simulação)
        for (let i = 0; i < 5; i++) {
            const x = vX + (Math.random() - 0.5) * this.farmConfig.maxDistance * 2;
            const y = vY + (Math.random() - 0.5) * this.farmConfig.maxDistance * 2;
            
            const target = `${Math.floor(x)}|${Math.floor(y)}`;
            
            // Verificar se é coordenada válida
            if (this.bot.getModule('distanceCalculator').calculateDistance(village.coords, target) <= this.farmConfig.maxDistance) {
                targets.push(target);
            }
        }
        
        return targets;
    }
    
    stop() {
        this.isRunning = false;
        console.log('🛑 Farm parado pelo usuário');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Disponibilizar globalmente
window.FarmAssistant = FarmAssistant;

// Exemplo de uso:
// const farm = new FarmAssistant();
// farm.startFarming();