/*
 * Coletor de Tropas na Aldeia - Console Only
 * Imprime resultado diretamente no console do navegador
 */

javascript:
(function() {
    // Tipos de tropas (ordem padrão do Tribal Wars)
    var troopTypes = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
    
    // Nomes das unidades
    var unitNames = {
        'pt_BR': ['Lanceiro', 'Espadachim', 'Bárbaro', 'Arqueiro', 'Explorador', 'Cavalaria Leve', 'Arqueiro a Cavalo', 'Cavalaria Pesada', 'Aríete', 'Catapulta', 'Paladino', 'Nobres'],
        'en_DK': ['Spear fighter', 'Swordsman', 'Axeman', 'Archer', 'Scout', 'Light cavalry', 'Mounted archer', 'Heavy cavalry', 'Ram', 'Catapult', 'Paladin', 'Nobleman']
    };

    var currentUnitNames = unitNames[game_data.locale] || unitNames['en_DK'];

    function coletarTropasNaAldeia() {
        console.log("🏰 Coletando tropas na aldeia...");
        
        var url = "/game.php?village=" + game_data.village.id + "&type=complete&mode=units&group=0&page=-1&screen=overview_villages";
        
        if (game_data.player.sitter != 0) {
            url = "/game.php?t=" + game_data.player.id + "&village=" + game_data.village.id + "&type=complete&mode=units&group=0&page=-1&screen=overview_villages";
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                processarDados(xhr.responseText);
            }
        };
        
        xhr.send();
    }

    function processarDados(responseText) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = responseText;
        
        var tabela = tempDiv.querySelector('#units_table');
        
        if (!tabela) {
            console.error("❌ Não foi possível encontrar tabela de tropas");
            return;
        }

        var tropasNaAldeia = [];
        var totalAldeias = 0;
        
        // Inicializar array de tropas
        for (var i = 0; i < troopTypes.length; i++) {
            tropasNaAldeia[i] = 0;
        }

        // Verificar disponibilidade de archer/marcher e knight
        var temArcher = tabela.rows[0].innerHTML.indexOf('archer') !== -1;
        var temKnight = tabela.rows[0].innerHTML.indexOf('knight') !== -1;
        
        var tiposAtivos = [...troopTypes];
        var nomesAtivos = [...currentUnitNames];
        
        if (!temArcher) {
            tiposAtivos = tiposAtivos.filter(type => type !== 'archer' && type !== 'marcher');
            nomesAtivos = nomesAtivos.filter((name, index) => index !== 3 && index !== 6);
        }
        
        if (!temKnight) {
            tiposAtivos = tiposAtivos.filter(type => type !== 'knight');
            nomesAtivos = nomesAtivos.filter((name, index) => index !== 10);
        }

        // Processar tabela - pegar apenas tropas "na aldeia" (linha índice 1 de cada grupo de 5)
        for (var i = 1; i < tabela.rows.length; i++) {
            if ((i - 1) % 5 === 1) { // Linha "In Villages" / "Nas Aldeias"
                totalAldeias++;
                var linha = tabela.rows[i];
                var offset = (tabela.rows[1].cells.length == linha.cells.length) ? 2 : 1;
                
                for (var j = 0; j < tiposAtivos.length && (j + offset) < linha.cells.length; j++) {
                    var valor = parseInt(linha.cells[j + offset].textContent) || 0;
                    tropasNaAldeia[j] += valor;
                }
            }
        }

        // Imprimir resultados no console
        imprimirResultados(tropasNaAldeia, tiposAtivos, nomesAtivos, totalAldeias);
    }

    function imprimirResultados(tropas, tipos, nomes, totalAldeias) {
        console.log("\n" + "=".repeat(50));
        console.log("🏰 TROPAS NA ALDEIA - TOTAL: " + totalAldeias + " aldeias");
        console.log("=".repeat(50));
        
        var tropasTotais = 0;
        
        for (var i = 0; i < tropas.length; i++) {
            var quantidade = tropas[i];
            tropasTotais += quantidade;
            
            console.log(
                "⚔️  " + 
                nomes[i].padEnd(18) + 
                ": " + 
                quantidade.toLocaleString().padStart(8)
            );
        }
        
        console.log("-".repeat(30));
        console.log("📊 TOTAL DE TROPAS: " + tropasTotais.toLocaleString());
        console.log("=".repeat(50));
        
        // Gerar código BB para exportação
        var codigoBB = "";
        for (var i = 0; i < tropas.length; i++) {
            codigoBB += "[unit]" + tipos[i] + "[/unit]" + tropas[i];
            if (i % 2 === 0) {
                codigoBB += Array(Math.max(1, 15 - String(tropas[i]).length)).join(' ');
            } else {
                codigoBB += "\n";
            }
        }
        
        console.log("📋 CÓDIGO BB PARA EXPORTAR:");
        console.log(codigoBB);
        
        // Criar objeto JavaScript para facilitar acesso aos dados
        window.tropasColetadas = {
            tropas: tropas,
            tipos: tipos,
            nomes: nomes,
            total: totalAldeias,
            codigoBB: codigoBB,
            tropasTotais: tropasTotais
        };
        
        console.log("💾 Dados salvos em: window.tropasColetadas");
        console.log("=".repeat(50) + "\n");
    }

    // Executar coleta
    coletarTropasNaAldeia();
})();
void 0;