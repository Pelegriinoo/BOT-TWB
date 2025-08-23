/**
 * Controlador de Timing
 * Gerencia delays e sincronização de ações
 */

class TimingController {
    constructor() {
        this.activeTimers = new Map();
        this.delayQueue = [];
        this.isProcessing = false;
    }

    /**
     * Cria um delay com callback
     */
    createDelay(milliseconds, callback = null) {
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                if (callback) callback();
                resolve();
            }, milliseconds);
            
            this.activeTimers.set(timer, { 
                type: 'delay', 
                duration: milliseconds, 
                created: Date.now() 
            });
        });
    }

    /**
     * Adiciona ação à fila com delay
     */
    addToQueue(action, delay = 1000) {
        this.delayQueue.push({ action, delay, timestamp: Date.now() });
        
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Processa fila de delays
     */
    async processQueue() {
        this.isProcessing = true;
        
        while (this.delayQueue.length > 0) {
            const item = this.delayQueue.shift();
            
            try {
                await this.createDelay(item.delay);
                await item.action();
            } catch (error) {
                console.error('❌ Erro ao processar item da fila:', error);
            }
        }
        
        this.isProcessing = false;
    }

    /**
     * Cancela todos os timers ativos
     */
    clearAllTimers() {
        this.activeTimers.forEach((info, timer) => {
            clearTimeout(timer);
        });
        this.activeTimers.clear();
        this.delayQueue = [];
        this.isProcessing = false;
    }

    /**
     * Delay aleatório dentro de um range
     */
    randomDelay(min = 500, max = 2000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.createDelay(delay);
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.TimingController = TimingController;
    window.timingController = new TimingController();
}
