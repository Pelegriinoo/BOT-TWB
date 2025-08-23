/**
 * Calculadora de Distância
 * Calcula distâncias entre aldeias e tempos de viagem
 */

class DistanceCalculator {
    constructor() {
        this.unitSpeeds = {
            spear: 18,      // Lanceiro
            sword: 22,      // Espadachim
            axe: 18,        // Bárbaro
            archer: 18,     // Arqueiro
            spy: 9,         // Explorador
            light: 10,      // Cavalaria Leve
            marcher: 10,    // Arqueiro a Cavalo
            heavy: 11,      // Cavalaria Pesada
            ram: 30,        // Aríete
            catapult: 30,   // Catapulta
            knight: 10,     // Paladino
            snob: 35        // Nobres
        };
    }

    /**
     * Calcula distância euclidiana entre duas coordenadas
     */
    calculateDistance(coord1, coord2) {
        const dx = coord1.x - coord2.x;
        const dy = coord1.y - coord2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula distância em campos (Manhattan)
     */
    calculateFieldDistance(coord1, coord2) {
        const dx = Math.abs(coord1.x - coord2.x);
        const dy = Math.abs(coord1.y - coord2.y);
        return Math.max(dx, dy);
    }

    /**
     * Calcula tempo de viagem para uma unidade específica
     */
    calculateTravelTime(coord1, coord2, unitType = 'spear', worldSpeed = 1) {
        const distance = this.calculateFieldDistance(coord1, coord2);
        const unitSpeed = this.unitSpeeds[unitType] || 18;
        
        // Tempo base em minutos = distância * velocidade da unidade
        const baseTimeMinutes = distance * unitSpeed;
        
        // Ajustar pela velocidade do mundo
        const adjustedTimeMinutes = baseTimeMinutes / worldSpeed;
        
        return {
            minutes: adjustedTimeMinutes,
            milliseconds: adjustedTimeMinutes * 60 * 1000,
            formatted: this.formatTime(adjustedTimeMinutes)
        };
    }

    /**
     * Calcula tempo de viagem para o tipo de unidade mais lenta
     */
    calculateSlowestTravelTime(coord1, coord2, unitTypes = [], worldSpeed = 1) {
        if (unitTypes.length === 0) {
            unitTypes = ['spear']; // Default
        }

        let slowestTime = 0;
        let slowestUnit = '';

        unitTypes.forEach(unitType => {
            const travelTime = this.calculateTravelTime(coord1, coord2, unitType, worldSpeed);
            if (travelTime.minutes > slowestTime) {
                slowestTime = travelTime.minutes;
                slowestUnit = unitType;
            }
        });

        return {
            minutes: slowestTime,
            milliseconds: slowestTime * 60 * 1000,
            formatted: this.formatTime(slowestTime),
            slowestUnit: slowestUnit
        };
    }

    /**
     * Formata tempo em formato legível
     */
    formatTime(minutes) {
        const totalSeconds = Math.round(minutes * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Converte string de coordenadas para objeto
     */
    parseCoordinates(coordString) {
        const match = coordString.match(/(\d+)\|(\d+)/);
        if (match) {
            return {
                x: parseInt(match[1]),
                y: parseInt(match[2])
            };
        }
        throw new Error(`Formato de coordenadas inválido: ${coordString}`);
    }

    /**
     * Verifica se as coordenadas estão dentro do alcance
     */
    isWithinRange(coord1, coord2, maxDistance) {
        const distance = this.calculateDistance(coord1, coord2);
        return distance <= maxDistance;
    }

    /**
     * Encontra aldeias dentro de um raio específico
     */
    findVillagesInRadius(centerCoord, villages, radius) {
        return villages.filter(village => {
            const villageCoord = typeof village.coord === 'string' 
                ? this.parseCoordinates(village.coord) 
                : village.coord;
            
            return this.isWithinRange(centerCoord, villageCoord, radius);
        }).map(village => {
            const villageCoord = typeof village.coord === 'string' 
                ? this.parseCoordinates(village.coord) 
                : village.coord;
            
            return {
                ...village,
                distance: this.calculateDistance(centerCoord, villageCoord),
                fieldDistance: this.calculateFieldDistance(centerCoord, villageCoord)
            };
        }).sort((a, b) => a.distance - b.distance);
    }

    /**
     * Calcula horário de chegada baseado no tempo de viagem
     */
    calculateArrivalTime(travelTimeMinutes, departureTime = null) {
        const departure = departureTime || new Date();
        const arrival = new Date(departure.getTime() + (travelTimeMinutes * 60 * 1000));
        
        return {
            departure: departure,
            arrival: arrival,
            travelTime: travelTimeMinutes,
            formatted: {
                departure: departure.toLocaleString('pt-BR'),
                arrival: arrival.toLocaleString('pt-BR')
            }
        };
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.DistanceCalculator = DistanceCalculator;
    window.distanceCalculator = new DistanceCalculator();
}
