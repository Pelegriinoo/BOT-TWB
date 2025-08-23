/**
 * Coletor de Tropas Avançado
 * Versão melhorada do troops_count.js original
 */

class TroopsCollector {
    constructor() {
        this.troopTypes = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
        this.unitNames = {
            'pt_BR': ['Lanceiro', 'Espadachim', 'Bárbaro', 'Arqueiro', 'Explorador', 'Cavalaria Leve', 'Arqueiro a Cavalo', 'Cavalaria Pesada', 'Aríete', 'Catapulta', 'Paladino', 'Nobres'],
            'en_DK': ['Spear fighter', 'Swordsman', 'Axeman', 'Archer', 'Scout', 'Light cavalry', 'Mounted archer', 'Heavy cavalry', 'Ram', 'Catapult', 'Paladin', 'Nobleman']
        };
        this.currentUnitNames = this.unitNames[game_data.locale] || this.unitNames['en_DK'];
        this.troopsData = null;
    }

    async collectAllVillagesTroops() {
        console.log("🏰 Coletando tropas de todas as aldeias...");
        
        const url = this.buildTroopsUrl();
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            this.troopsData = this.processTroopsData(html);
            this.displayResults();
            
            return this.troopsData;
        } catch (error) {
            console.error("❌ Erro ao coletar tropas:", error);
            throw error;
        }
    }

    buildTroopsUrl() {
        let url = `/game.php?village=${game_data.village.id}&type=complete&mode=units&group=0&page=-1&screen=overview_villages`;
        
        if (game_data.player.sitter != 0) {
            url = `/game.php?t=${game_data.player.id}&village=${game_data.village.id}&type=complete&mode=units&group=0&page=-1&screen=overview_villages`;
        }
        
        return url;
    }

    processTroopsData(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const table = tempDiv.querySelector('#units_table');
        if (!table) {
            throw new Error("Tabela de tropas não encontrada");
        }

        const villagesTroops = [];
        const totalTroops = new Array(this.troopTypes.length).fill(0);
        const activeTroops = this.getActiveTroopTypes(table);
        
        // Processar cada aldeia
        let villageCount = 0;
        for (let i = 1; i < table.rows.length; i += 5) {
            if (i + 1 < table.rows.length) {
                const villageData = this.processVillageRow(table.rows[i + 1], activeTroops);
                villagesTroops.push(villageData);
                
                // Somar ao total
                villageData.troops.forEach((count, index) => {
                    totalTroops[index] += count;
                });
                
                villageCount++;
            }
        }

        return {
            villages: villagesTroops,
            total: totalTroops,
            activeTypes: activeTroops.types,
            activeNames: activeTroops.names,
            villageCount: villageCount,
            lastUpdate: new Date(),
            bbCode: this.generateBBCode(totalTroops, activeTroops.types)
        };
    }

    getActiveTroopTypes(table) {
        const hasArcher = table.rows[0].innerHTML.includes('archer');
        const hasKnight = table.rows[0].innerHTML.includes('knight');
        
        let activeTypes = [...this.troopTypes];
        let activeNames = [...this.currentUnitNames];
        
        if (!hasArcher) {
            activeTypes = activeTypes.filter(type => type !== 'archer' && type !== 'marcher');
            activeNames = activeNames.filter((name, index) => index !== 3 && index !== 6);
        }
        
        if (!hasKnight) {
            activeTypes = activeTypes.filter(type => type !== 'knight');
            activeNames = activeNames.filter((name, index) => index !== 10);
        }

        return { types: activeTypes, names: activeNames };
    }

    processVillageRow(row, activeTroops) {
        const troops = new Array(activeTroops.types.length).fill(0);
        const offset = (row.cells.length > 10) ? 2 : 1;
        
        for (let j = 0; j < activeTroops.types.length && (j + offset) < row.cells.length; j++) {
            troops[j] = parseInt(row.cells[j + offset].textContent) || 0;
        }
        
        return { troops };
    }

    displayResults() {
        if (!this.troopsData) return;

        console.log("\n" + "=".repeat(60));
        console.log(`🏰 RELATÓRIO DE TROPAS - ${this.troopsData.villageCount} aldeias`);
        console.log("=".repeat(60));
        
        let grandTotal = 0;
        
        this.troopsData.activeNames.forEach((name, i) => {
            const count = this.troopsData.total[i];
            grandTotal += count;
            
            console.log(`⚔️  ${name.padEnd(20)}: ${count.toLocaleString().padStart(10)}`);
        });
        
        console.log("-".repeat(40));
        console.log(`📊 TOTAL GERAL: ${grandTotal.toLocaleString()}`);
        console.log("=".repeat(60));
        
        // Salvar dados globalmente
        window.troopsData = this.troopsData;
        console.log("💾 Dados salvos em: window.troopsData");
    }

    generateBBCode(troops, types) {
        let bbCode = "";
        for (let i = 0; i < troops.length; i++) {
            bbCode += `[unit]${types[i]}[/unit]${troops[i]}`;
            bbCode += (i % 2 === 0) ? "    " : "\n";
        }
        return bbCode;
    }

    // Método para obter tropas de uma vila específica
    async getVillageTroops(villageId) {
        const url = `/game.php?village=${villageId}&screen=place`;
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            const troops = {};
            this.troopTypes.forEach(unit => {
                const match = html.match(new RegExp(`name="${unit}"[^>]*>\\s*(\\d+)`, 'i'));
                troops[unit] = match ? parseInt(match[1]) : 0;
            });
            
            return troops;
        } catch (error) {
            console.error(`Erro ao obter tropas da vila ${villageId}:`, error);
            return null;
        }
    }

    // Método para obter apenas tropas disponíveis (não em movimento)
    getAvailableTroops() {
        return this.troopsData ? this.troopsData.total : null;
    }
}

// Registrar módulo globalmente
if (typeof window !== 'undefined') {
    window.TroopsCollector = TroopsCollector;
    console.log('✅ TroopsCollector exportado para window');
    
    // Registrar no sistema principal se existir
    if (window.twBot) {
        window.twBot.registerModule('troopsCollector', new TroopsCollector());
    }
}

// Confirmar execução
console.log('📦 Arquivo src/modules/troops-collector.js executado com sucesso');