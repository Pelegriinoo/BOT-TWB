/**
 * BOT-TWB Village Manager - Gerenciador de aldeias
 * @version 2.0.0
 * @author BOT-TWB
 */

window.VillageManager = class VillageManager {
    constructor(api) {
        this.api = api;
        this.villages = new Map();
    }

    /**
     * Obtém lista de aldeias do jogador
     */
    async getVillageList() {
        try {
            const html = await this.api.get({
                screen: 'overview_villages'
            });

            const villages = [];
            const villageRows = html.match(/<tr[^>]*class="[^"]*village[^"]*"[^>]*>.*?<\/tr>/gs) || [];

            villageRows.forEach(row => {
                const idMatch = row.match(/village=(\d+)/);
                const nameMatch = row.match(/>([^<]+)<\/a>/);
                const coordsMatch = row.match(/\((\d+\|\d+)\)/);

                if (idMatch && nameMatch && coordsMatch) {
                    villages.push({
                        id: idMatch[1],
                        name: nameMatch[1].trim(),
                        coords: coordsMatch[1]
                    });
                }
            });

            return villages;
        } catch (error) {
            throw new Error(`Erro ao obter lista de aldeias: ${error.message}`);
        }
    }

    /**
     * Obtém informações de uma vila específica
     */
    async getVillageInfo(villageId = null) {
        const village = villageId || this.api.currentVillage;
        
        try {
            const html = await this.api.get({
                village,
                screen: 'overview'
            });

            // Extrair coordenadas da vila
            const coordsMatch = html.match(/\((\d+)\|(\d+)\)/);
            const coords = coordsMatch ? `${coordsMatch[1]}|${coordsMatch[2]}` : null;

            // Extrair nome da vila
            const nameMatch = html.match(/<span[^>]*class="[^"]*village[^"]*"[^>]*>([^<]+)<\/span>/i);
            const name = nameMatch ? nameMatch[1].trim() : null;

            return {
                id: village,
                name,
                coords,
                raw: html
            };
        } catch (error) {
            throw new Error(`Erro ao obter informações da vila: ${error.message}`);
        }
    }

    /**
     * Gerencia múltiplas aldeias
     */
    async manageVillages() {
        // Implementação futura para gerenciamento avançado
        console.log('VillageManager: Gerenciamento avançado será implementado');
        return [];
    }
};

console.log('🏘️ TWB Village Manager carregada');
