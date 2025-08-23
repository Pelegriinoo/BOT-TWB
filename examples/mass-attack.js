/**
 * Exemplo: Ataque em Massa
 * Como configurar múltiplos ataques automatizados
 */

async function massAttackExample() {
    const attackSystem = window.twBot.getModule('attackSystem');
    const villageFinder = window.twBot.getModule('villageFinder');
    
    // Lista de alvos
    const targets = ['500|500', '501|501', '502|502'];
    
    // Configuração de tropas padrão
    const defaultTroops = {
        light: 50,
        spy: 1
    };
    
    // Para cada alvo, encontrar vila mais próxima e adicionar à fila
    for (const target of targets) {
        try {
            // Buscar vilas próximas
            const nearestVillages = await villageFinder.findNearestVillages(target, {
                maxResults: 1,
                maxDistance: 30
            });
            
            if (nearestVillages.length > 0) {
                const village = nearestVillages[0];
                
                // Adicionar ataque à fila
                attackSystem.addToQueue({
                    sourceVillage: village.id,
                    targetCoords: target,
                    troops: defaultTroops,
                    attackType: 'attack'
                });
                
                console.log(`✅ Ataque agendado: ${village.coords} → ${target}`);
            } else {
                console.warn(`⚠️ Nenhuma vila próxima encontrada para ${target}`);
            }
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${target}:`, error);
        }
    }
    
    // Processar fila
    console.log('🚀 Iniciando processamento da fila...');
    attackSystem.processQueue();
}

// Executar exemplo
// massAttackExample();