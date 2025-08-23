/**
 * Cliente HTTP Avançado para Tribal Wars
 * Gerencia todas as requisições HTTP com recursos de cache, retry e anti-detecção
 */

class HttpClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || window.location.origin;
        this.timeout = options.timeout || 30000; // 30 segundos
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        
        // Cache de requisições
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutos
        
        // Rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.minRequestInterval = options.minRequestInterval || 500; // 500ms entre requests
        this.lastRequestTime = 0;
        
        // Headers padrão
        this.defaultHeaders = {
            'User-Agent': navigator.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': navigator.language || 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
        
        // Interceptors
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        this.init();
    }

    /**
     * Inicializa o cliente HTTP
     */
    init() {
        // Adicionar interceptor padrão para CSRF token
        this.addRequestInterceptor(this.addCSRFToken.bind(this));
        
        // Adicionar interceptor de resposta para detectar erros
        this.addResponseInterceptor(this.handleResponseErrors.bind(this));
        
        console.log('🌐 HttpClient inicializado');
    }

    /**
     * Adiciona interceptor de requisição
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Adiciona interceptor de resposta
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Adiciona token CSRF automaticamente
     */
    async addCSRFToken(config) {
        if (config.method && config.method.toUpperCase() === 'POST') {
            const token = this.extractCSRFToken();
            if (token) {
                if (config.body instanceof FormData) {
                    config.body.append('h', token);
                } else if (typeof config.body === 'string') {
                    config.body += (config.body ? '&' : '') + `h=${token}`;
                } else {
                    config.body = config.body || {};
                    config.body.h = token;
                }
            }
        }
        return config;
    }

    /**
     * Extrai token CSRF da página atual
     */
    extractCSRFToken() {
        // Múltiplos métodos para encontrar o token
        let token = document.querySelector('input[name="h"]')?.value ||
                   document.querySelector('meta[name="csrf-token"]')?.content ||
                   document.querySelector('[name="h"]')?.value;
        
        if (!token) {
            // Buscar em scripts ou no HTML
            const pageHTML = document.documentElement.innerHTML;
            let match = pageHTML.match(/[&?]h=([a-f0-9]+)/) || 
                       pageHTML.match(/['"]h['"]:\s*['"]([^'"]+)['"]/);
            
            if (match) {
                token = match[1];
            }
        }
        
        return token;
    }

    /**
     * Trata erros de resposta
     */
    async handleResponseErrors(response, config) {
        // Detectar se precisa de captcha
        if (response.status === 200 && response.url) {
            const text = await response.clone().text();
            
            if (text.includes('bot_check') || text.includes('captcha')) {
                console.warn('🤖 Captcha detectado!');
                this.dispatchEvent('captchaRequired', { response, config });
                throw new Error('Captcha required');
            }
        }
        
        return response;
    }

    /**
     * Requisição GET com cache
     */
    async get(url, options = {}) {
        const fullUrl = this.resolveURL(url);
        const cacheKey = `GET:${fullUrl}:${JSON.stringify(options)}`;
        
        // Verificar cache
        if (options.cache !== false && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Cache hit:', url);
                return cached.data;
            } else {
                this.cache.delete(cacheKey);
            }
        }
        
        const config = {
            method: 'GET',
            url: fullUrl,
            ...options
        };
        
        const response = await this.request(config);
        const data = await this.parseResponse(response, options.responseType);
        
        // Cachear resultado
        if (options.cache !== false && response.ok) {
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    }

    /**
     * Requisição POST
     */
    async post(url, data = null, options = {}) {
        const config = {
            method: 'POST',
            url: this.resolveURL(url),
            body: this.preparePostData(data),
            ...options
        };
        
        const response = await this.request(config);
        return await this.parseResponse(response, options.responseType);
    }

    /**
     * Requisição PUT
     */
    async put(url, data = null, options = {}) {
        const config = {
            method: 'PUT',
            url: this.resolveURL(url),
            body: this.preparePostData(data),
            ...options
        };
        
        const response = await this.request(config);
        return await this.parseResponse(response, options.responseType);
    }

    /**
     * Requisição DELETE
     */
    async delete(url, options = {}) {
        const config = {
            method: 'DELETE',
            url: this.resolveURL(url),
            ...options
        };
        
        const response = await this.request(config);
        return await this.parseResponse(response, options.responseType);
    }

    /**
     * Requisição principal com retry e rate limiting
     */
    async request(config) {
        // Aplicar interceptors de requisição
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }
        
        // Adicionar à fila para rate limiting
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                config,
                resolve,
                reject,
                attempts: 0
            });
            
            this.processQueue();
        });
    }

    /**
     * Processa fila de requisições com rate limiting
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const queueItem = this.requestQueue.shift();
            
            try {
                // Rate limiting - aguardar intervalo mínimo
                const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                if (timeSinceLastRequest < this.minRequestInterval) {
                    await this.sleep(this.minRequestInterval - timeSinceLastRequest);
                }
                
                // Executar requisição
                const response = await this.executeRequest(queueItem.config);
                
                // Aplicar interceptors de resposta
                let finalResponse = response;
                for (const interceptor of this.responseInterceptors) {
                    finalResponse = await interceptor(finalResponse, queueItem.config);
                }
                
                this.lastRequestTime = Date.now();
                queueItem.resolve(finalResponse);
                
            } catch (error) {
                // Tentar retry se necessário
                if (queueItem.attempts < this.maxRetries && this.shouldRetry(error)) {
                    queueItem.attempts++;
                    const delay = this.retryDelay * Math.pow(2, queueItem.attempts - 1);
                    
                    console.warn(`⚠️ Retry ${queueItem.attempts}/${this.maxRetries} em ${delay}ms:`, error.message);
                    
                    setTimeout(() => {
                        this.requestQueue.unshift(queueItem);
                        this.processQueue();
                    }, delay);
                    
                    break; // Sair do loop para processar retry
                } else {
                    queueItem.reject(error);
                }
            }
            
            // Pequena pausa entre requisições para parecer mais humano
            await this.sleep(Math.random() * 200 + 100);
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Executa requisição HTTP real
     */
    async executeRequest(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const fetchOptions = {
                method: config.method || 'GET',
                headers: { ...this.defaultHeaders, ...config.headers },
                body: config.body,
                signal: controller.signal,
                credentials: 'same-origin', // Importante para cookies de sessão
                redirect: 'follow'
            };
            
            // Log da requisição (apenas em desenvolvimento)
            if (this.isDebugMode()) {
                console.log(`🌐 ${config.method} ${config.url}`, fetchOptions);
            }
            
            const response = await fetch(config.url, fetchOptions);
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Verifica se deve tentar novamente baseado no erro
     */
    shouldRetry(error) {
        // Retry em erros de rede, timeout, ou códigos 5xx
        return error.message.includes('timeout') ||
               error.message.includes('network') ||
               error.message.includes('fetch') ||
               (error.status && error.status >= 500);
    }

    /**
     * Prepara dados para POST/PUT
     */
    preparePostData(data) {
        if (!data) return null;
        
        if (data instanceof FormData) {
            return data;
        }
        
        if (typeof data === 'object') {
            const formData = new FormData();
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }
            return formData;
        }
        
        return data;
    }

    /**
     * Faz parse da resposta baseado no tipo esperado
     */
    async parseResponse(response, responseType = 'text') {
        switch (responseType) {
            case 'json':
                return await response.json();
            case 'blob':
                return await response.blob();
            case 'arrayBuffer':
                return await response.arrayBuffer();
            case 'formData':
                return await response.formData();
            case 'text':
            default:
                return await response.text();
        }
    }

    /**
     * Resolve URL completa
     */
    resolveURL(url) {
        if (url.startsWith('http')) {
            return url;
        }
        
        if (url.startsWith('/')) {
            return this.baseURL + url;
        }
        
        return this.baseURL + '/' + url;
    }

    /**
     * Utilitário de sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica se está em modo debug
     */
    isDebugMode() {
        return window.localStorage?.getItem('twbot-debug') === 'true';
    }

    /**
     * Dispatch de eventos personalizados
     */
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`httpClient:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Métodos específicos para Tribal Wars
     */

    /**
     * Carrega página de visão geral de vilas
     */
    async getVillageOverview(mode = 'prod') {
        return await this.get(`/game.php?screen=overview_villages&mode=${mode}`);
    }

    /**
     * Carrega página de comando/ataque
     */
    async getAttackPage(villageId) {
        return await this.get(`/game.php?village=${villageId}&screen=place`);
    }

    /**
     * Envia comando de ataque
     */
    async sendAttackCommand(villageId, attackData) {
        const url = `/game.php?village=${villageId}&screen=place&action=command`;
        return await this.post(url, attackData);
    }

    /**
     * Prepara ataque (primeiro passo)
     */
    async prepareAttack(villageId, attackData) {
        const url = `/game.php?village=${villageId}&screen=place&try=confirm`;
        return await this.post(url, attackData);
    }

    /**
     * Carrega informações de tropas
     */
    async getTroopsInfo(villageId) {
        return await this.get(`/game.php?village=${villageId}&screen=place`);
    }

    /**
     * Carrega relatórios
     */
    async getReports(page = 1, mode = 'attack') {
        return await this.get(`/game.php?screen=report&mode=${mode}&from=${(page-1) * 12}`);
    }

    /**
     * Carrega mapa
     */
    async getMapData(x, y) {
        return await this.get(`/map.php?x=${x}&y=${y}`, { responseType: 'json' });
    }

    /**
     * Interface.php para dados XML
     */
    async getInterface(func, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `/interface.php?func=${func}${queryString ? '&' + queryString : ''}`;
        return await this.get(url);
    }

    /**
     * Estatísticas e rankings
     */
    async getStats(type = 'player', page = 1) {
        return await this.get(`/game.php?screen=ranking&mode=${type}&from=${(page-1) * 25}`);
    }

    /**
     * Configurações do mundo
     */
    async getWorldConfig() {
        try {
            return await this.getInterface('get_config', {}, { responseType: 'text' });
        } catch (error) {
            console.warn('⚠️ Não foi possível obter config do mundo:', error);
            return null;
        }
    }

    /**
     * Limpa cache
     */
    clearCache(pattern = null) {
        if (pattern) {
            const regex = new RegExp(pattern);
            for (const [key] of this.cache) {
                if (regex.test(key)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
        
        console.log('🧹 Cache limpo');
    }

    /**
     * Obtém estatísticas do cliente
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessingQueue,
            lastRequestTime: this.lastRequestTime,
            config: {
                timeout: this.timeout,
                maxRetries: this.maxRetries,
                minInterval: this.minRequestInterval,
                cacheTimeout: this.cacheTimeout
            }
        };
    }

    /**
     * Atualiza configurações
     */
    updateConfig(newConfig) {
        Object.assign(this, newConfig);
        console.log('⚙️ HttpClient configurações atualizadas');
    }

    /**
     * Monitora performance das requisições
     */
    startPerformanceMonitoring() {
        this.performanceData = [];
        
        this.addRequestInterceptor(async (config) => {
            config._startTime = performance.now();
            return config;
        });
        
        this.addResponseInterceptor(async (response, config) => {
            const duration = performance.now() - (config._startTime || 0);
            
            this.performanceData.push({
                url: config.url,
                method: config.method,
                duration,
                status: response.status,
                timestamp: Date.now()
            });
            
            // Manter apenas últimas 100 requisições
            if (this.performanceData.length > 100) {
                this.performanceData.shift();
            }
            
            return response;
        });
        
        console.log('📊 Monitoramento de performance iniciado');
    }

    /**
     * Obtém dados de performance
     */
    getPerformanceData() {
        if (!this.performanceData) return null;
        
        const data = this.performanceData;
        const avgDuration = data.reduce((sum, req) => sum + req.duration, 0) / data.length;
        const slowRequests = data.filter(req => req.duration > 5000);
        const errorRate = data.filter(req => req.status >= 400).length / data.length;
        
        return {
            totalRequests: data.length,
            averageDuration: Math.round(avgDuration),
            slowRequests: slowRequests.length,
            errorRate: (errorRate * 100).toFixed(2) + '%',
            recentRequests: data.slice(-10)
        };
    }

    /**
     * Destructor - limpa recursos
     */
    destroy() {
        this.cache.clear();
        this.requestQueue.length = 0;
        this.requestInterceptors.length = 0;
        this.responseInterceptors.length = 0;
        
        console.log('🗑️ HttpClient destruído');
    }
}

// Factory function para criar instância configurada
function createHttpClient(options = {}) {
    return new HttpClient(options);
}

// Instância global padrão
let defaultHttpClient = null;

function getHttpClient() {
    if (!defaultHttpClient) {
        defaultHttpClient = new HttpClient();
    }
    return defaultHttpClient;
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.HttpClient = HttpClient;
    window.createHttpClient = createHttpClient;
    window.getHttpClient = getHttpClient;
    
    // Instância global para conveniência
    window.httpClient = getHttpClient();
    
    // Registrar no sistema do bot se existir
    if (window.twBot) {
        window.twBot.registerModule('httpClient', window.httpClient);
    }
}

// Para Node.js/CommonJS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HttpClient, createHttpClient };
}