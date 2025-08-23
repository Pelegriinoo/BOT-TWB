/**
 * Funções Utilitárias Gerais
 * Helpers e funções auxiliares
 */

class BotUtils {
    
    /**
     * Formata números com separadores de milhares
     */
    static formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    /**
     * Formata tempo em string legível
     */
    static formatTime(milliseconds) {
        if (milliseconds < 1000) return '0s';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Formata data/hora
     */
    static formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(date);
    }

    /**
     * Parse coordenadas em diferentes formatos
     */
    static parseCoords(coords) {
        if (typeof coords === 'string') {
            const match = coords.match(/(\d+)[|,\s]+(\d+)/);
            if (match) {
                return { x: parseInt(match[1]), y: parseInt(match[2]) };
            }
        }
        
        if (typeof coords === 'object' && coords.x !== undefined && coords.y !== undefined) {
            return { x: parseInt(coords.x), y: parseInt(coords.y) };
        }
        
        return null;
    }

    /**
     * Formata coordenadas como string
     */
    static formatCoords(coords, separator = '|') {
        const parsed = this.parseCoords(coords);
        return parsed ? `${parsed.x}${separator}${parsed.y}` : '';
    }

    /**
     * Valida coordenadas
     */
    static isValidCoords(coords, maxX = 1000, maxY = 1000) {
        const parsed = this.parseCoords(coords);
        if (!parsed) return false;
        
        return parsed.x >= 0 && parsed.x <= maxX && parsed.y >= 0 && parsed.y <= maxY;
    }

    /**
     * Gera delay aleatório
     */
    static randomDelay(min = 1000, max = 3000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Sleep assíncrono
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry com backoff exponencial
     */
    static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxAttempts) {
                    break;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.warn(`⚠️ Tentativa ${attempt}/${maxAttempts} falhou, tentando novamente em ${delay}ms`);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * Debounce function
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit = 100) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Gera ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Clone profundo de objeto
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        
        return obj;
    }

    /**
     * Mescla objetos profundamente
     */
    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.deepMerge(target, ...sources);
    }

    /**
     * Verifica se é objeto
     */
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Ordena array de objetos por propriedade
     */
    static sortBy(array, property, ascending = true) {
        return array.sort((a, b) => {
            const aVal = this.getNestedProperty(a, property);
            const bVal = this.getNestedProperty(b, property);
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    /**
     * Obtém propriedade aninhada de objeto
     */
    static getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Define propriedade aninhada em objeto
     */
    static setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            current[key] = current[key] || {};
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    /**
     * Remove elementos duplicados de array
     */
    static unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const val = this.getNestedProperty(item, key);
                if (seen.has(val)) {
                    return false;
                } else {
                    seen.add(val);
                    return true;
                }
            });
        }
        
        return [...new Set(array)];
    }

    /**
     * Agrupa array por propriedade
     */
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = this.getNestedProperty(item, key);
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    /**
     * Calcula média de array numérico
     */
    static average(numbers) {
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }

    /**
     * Calcula mediana de array numérico
     */
    static median(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];
    }

    /**
     * Converte bytes para formato legível
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Escapa HTML
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Remove HTML tags
     */
    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Capitaliza primeira letra
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Trunca string
     */
    static truncate(str, length = 50, suffix = '...') {
        if (str.length <= length) return str;
        return str.slice(0, length) + suffix;
    }

    /**
     * Valida email
     */
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Gera cor aleatória
     */
    static randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    /**
     * Converte RGB para HEX
     */
    static rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Converte HEX para RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Download de arquivo
     */
    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Copia texto para clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Fallback para clipboard');
            
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return result;
        }
    }

    /**
     * Detecta dispositivo móvel
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Obtém informações do navegador
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /Chrome/.test(ua) && !/Edge/.test(ua),
            firefox: /Firefox/.test(ua),
            safari: /Safari/.test(ua) && !/Chrome/.test(ua),
            edge: /Edge/.test(ua)
        };
        
        return Object.keys(browsers).find(key => browsers[key]) || 'unknown';
    }

    /**
     * Logger personalizado
     */
    static createLogger(prefix = 'Bot') {
        return {
            debug: (...args) => console.log(`🐛 [${prefix}]`, ...args),
            info: (...args) => console.log(`ℹ️ [${prefix}]`, ...args),
            warn: (...args) => console.warn(`⚠️ [${prefix}]`, ...args),
            error: (...args) => console.error(`❌ [${prefix}]`, ...args),
            success: (...args) => console.log(`✅ [${prefix}]`, ...args)
        };
    }

    /**
     * Performance monitor
     */
    static createPerformanceMonitor(name) {
        const start = performance.now();
        
        return {
            end: () => {
                const duration = performance.now() - start;
                console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
                return duration;
            }
        };
    }

    /**
     * Cache simples com TTL
     */
    static createCache(ttl = 300000) { // 5 minutos padrão
        const cache = new Map();
        
        return {
            set: (key, value) => {
                cache.set(key, {
                    value,
                    expires: Date.now() + ttl
                });
            },
            
            get: (key) => {
                const item = cache.get(key);
                if (!item) return null;
                
                if (Date.now() > item.expires) {
                    cache.delete(key);
                    return null;
                }
                
                return item.value;
            },
            
            has: (key) => {
                const item = cache.get(key);
                if (!item) return false;
                
                if (Date.now() > item.expires) {
                    cache.delete(key);
                    return false;
                }
                
                return true;
            },
            
            clear: () => cache.clear(),
            size: () => cache.size
        };
    }

    /**
     * Validador de coordenadas Tribal Wars
     */
    static validateTWCoords(coords, worldSize = { width: 1000, height: 1000 }) {
        const parsed = this.parseCoords(coords);
        if (!parsed) return { valid: false, error: 'Formato inválido' };
        
        if (parsed.x < 0 || parsed.x > worldSize.width) {
            return { valid: false, error: `X deve estar entre 0 e ${worldSize.width}` };
        }
        
        if (parsed.y < 0 || parsed.y > worldSize.height) {
            return { valid: false, error: `Y deve estar entre 0 e ${worldSize.height}` };
        }
        
        return { valid: true, coords: parsed };
    }

    /**
     * Calcula distância entre duas coordenadas
     */
    static calculateDistance(coord1, coord2) {
        const c1 = this.parseCoords(coord1);
        const c2 = this.parseCoords(coord2);
        
        if (!c1 || !c2) return null;
        
        return Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2));
    }

    /**
     * Gera coordenadas aleatórias próximas
     */
    static generateNearbyCoords(centerCoords, maxDistance = 10, count = 5) {
        const center = this.parseCoords(centerCoords);
        if (!center) return [];
        
        const coords = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * maxDistance;
            
            const x = Math.round(center.x + distance * Math.cos(angle));
            const y = Math.round(center.y + distance * Math.sin(angle));
            
            coords.push({ x, y, coords: `${x}|${y}` });
        }
        
        return coords;
    }

    /**
     * Formata BBCode para TW
     */
    static formatBBCode(type, content, params = {}) {
        switch (type) {
            case 'coord':
                return `[coord]${content}[/coord]`;
            case 'village':
                return `[village]${content}[/village]`;
            case 'player':
                return `[player]${content}[/player]`;
            case 'tribe':
                return `[tribe]${content}[/tribe]`;
            case 'unit':
                return `[unit]${content}[/unit]`;
            case 'building':
                return `[building]${content}[/building]`;
            case 'url':
                return `[url${params.target ? '=' + params.target : ''}]${content}[/url]`;
            case 'b':
                return `[b]${content}[/b]`;
            case 'i':
                return `[i]${content}[/i]`;
            case 'color':
                return `[color=${params.color || 'red'}]${content}[/color]`;
            default:
                return content;
        }
    }

    /**
     * Parse BBCode básico
     */
    static parseBBCode(text) {
        const replacements = {
            '\\[b\\](.*?)\\[/b\\]': '<strong>$1</strong>',
            '\\[i\\](.*?)\\[/i\\]': '<em>$1</em>',
            '\\[u\\](.*?)\\[/u\\]': '<u>$1</u>',
            '\\[url=([^\\]]+)\\](.*?)\\[/url\\]': '<a href="$1" target="_blank">$2</a>',
            '\\[url\\](.*?)\\[/url\\]': '<a href="$1" target="_blank">$1</a>',
            '\\[color=([^\\]]+)\\](.*?)\\[/color\\]': '<span style="color: $1">$2</span>'
        };
        
        let result = text;
        for (const [pattern, replacement] of Object.entries(replacements)) {
            result = result.replace(new RegExp(pattern, 'gi'), replacement);
        }
        
        return result;
    }

    /**
     * Simula digitação humana
     */
    static async humanTypeText(element, text, options = {}) {
        const { minDelay = 50, maxDelay = 150, mistakes = 0.02 } = options;
        
        element.focus();
        element.value = '';
        
        for (let i = 0; i < text.length; i++) {
            // Simular erro de digitação ocasional
            if (Math.random() < mistakes && i > 0) {
                const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                element.value += wrongChar;
                await this.sleep(this.randomDelay(minDelay, maxDelay));
                
                // Corrigir erro (backspace + char correto)
                element.value = element.value.slice(0, -1);
                await this.sleep(this.randomDelay(minDelay, maxDelay));
            }
            
            element.value += text[i];
            
            // Trigger events para simular digitação real
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            
            await this.sleep(this.randomDelay(minDelay, maxDelay));
        }
    }

    /**
     * Simula clique humano
     */
    static async humanClick(element, options = {}) {
        const { delay = 100 } = options;
        
        // Simular movimento do mouse
        element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        await this.sleep(this.randomDelay(50, 100));
        
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await this.sleep(this.randomDelay(50, delay));
        
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        await this.sleep(this.randomDelay(100, 200));
    }

    /**
     * Monitora mudanças em elemento DOM
     */
    static observeElement(element, callback, options = {}) {
        const { childList = true, subtree = true, attributes = false } = options;
        
        const observer = new MutationObserver(callback);
        observer.observe(element, { childList, subtree, attributes });
        
        return observer;
    }

    /**
     * Aguarda elemento aparecer no DOM
     */
    static waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Obtém informações detalhadas do sistema
     */
    static getSystemInfo() {
        const nav = navigator;
        
        return {
            userAgent: nav.userAgent,
            language: nav.language,
            languages: nav.languages,
            platform: nav.platform,
            cookieEnabled: nav.cookieEnabled,
            onLine: nav.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // Propriedades que podem não existir em todos os navegadores
            memory: nav.deviceMemory || 'unknown',
            cores: nav.hardwareConcurrency || 'unknown',
            connection: nav.connection || null
        };
    }
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.BotUtils = BotUtils;
    console.log('✅ BotUtils exportado para window');
    
    // Aliases para conveniência
    window.formatNumber = BotUtils.formatNumber;
    window.formatTime = BotUtils.formatTime;
    window.parseCoords = BotUtils.parseCoords;
    window.formatCoords = BotUtils.formatCoords;
    window.sleep = BotUtils.sleep;
}

// Confirmar execução
console.log('📦 Arquivo src/core/utils.js executado com sucesso');