/**
 * BOT-TWB Utils - Utilitários gerais
 * @version 2.0.0
 * @author BOT-TWB
 */

window.TWBUtils = {
    /**
     * Sleep/delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Formata número com separadores
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    /**
     * Formata data/hora
     */
    formatDateTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleString('pt-BR');
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Gera ID único
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    /**
     * Sanitiza HTML
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Copia texto para clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    },

    /**
     * Valida se é um número válido
     */
    isValidNumber(value) {
        return !isNaN(value) && isFinite(value) && value >= 0;
    },

    /**
     * Converte string para número seguro
     */
    safeParseInt(value, defaultValue = 0) {
        const parsed = parseInt(value);
        return this.isValidNumber(parsed) ? parsed : defaultValue;
    },

    /**
     * Calcula porcentagem
     */
    percentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },

    /**
     * Cria elemento DOM com propriedades
     */
    createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Remove todos os filhos de um elemento
     */
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Converte coordenadas para string
     */
    coordsToString(x, y) {
        return `${x}|${y}`;
    },

    /**
     * Converte string para coordenadas
     */
    stringToCoords(str) {
        const match = str.match(/^(\d+)\|(\d+)$/);
        if (match) {
            return {
                x: parseInt(match[1]),
                y: parseInt(match[2])
            };
        }
        return null;
    },

    /**
     * Validação de email simples
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Escape de caracteres especiais para regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Trunca texto com elipses
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength - 3) + '...';
    },

    /**
     * Converte millisegundos para formato legível
     */
    msToTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },

    /**
     * Detecta se está em mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Log com timestamp
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] TWB:`;
        
        switch (type) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'success':
                console.log(`%c${prefix}`, 'color: green', message);
                break;
            default:
                console.log(prefix, message);
        }
    }
};

console.log('🛠️ TWB Utils carregadas');
