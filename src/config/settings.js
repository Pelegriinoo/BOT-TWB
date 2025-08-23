/**
 * Configurações do Bot
 * Gerencia todas as configurações e preferências
 */

class BotSettings {
    constructor() {
        this.defaultSettings = {
            // Configurações de ataque
            attack: {
                defaultInterval: 3000,
                minInterval: 1000,
                maxInterval: 10000,
                maxDistance: 50,
                autoQueue: false,
                confirmBeforeSend: true
            },
            
            // Anti-detecção
            antiDetection: {
                enabled: true,
                level: 'medium', // low, medium, high
                randomFactor: 0.5,
                humanizeClicks: true,
                randomPauses: true
            },
            
            // Interface
            ui: {
                theme: 'dark',
                position: { x: null, y: null },
                autoHide: false,
                notifications: true,
                soundAlerts: false
            },
            
            // Coleta de dados
            dataCollection: {
                autoUpdate: true,
                updateInterval: 60000, // 1 minuto
                cacheTimeout: 300000, // 5 minutos
                collectTroopsOnLoad: true
            },
            
            // Funcionalidades
            features: {
                massAttack: true,
                coordinatedAttacks: true,
                farmAssist: false,
                reportAnalysis: false
            },
            
            // Debug e logs
            debug: {
                enabled: false,
                logLevel: 'info', // debug, info, warn, error
                saveToFile: false,
                maxLogSize: 1000
            }
        };
        
        this.currentSettings = this.loadSettings();
        this.observers = new Map();
    }

    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('twbot-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.mergeSettings(this.defaultSettings, parsed);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar configurações:', error);
        }
        
        return { ...this.defaultSettings };
    }

    /**
     * Salva configurações
     */
    saveSettings() {
        try {
            localStorage.setItem('twbot-settings', JSON.stringify(this.currentSettings));
            console.log('💾 Configurações salvas');
            this.notifyObservers('settingsSaved');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            return false;
        }
    }

    /**
     * Mescla configurações recursivamente
     */
    mergeSettings(defaults, custom) {
        const result = { ...defaults };
        
        for (const key in custom) {
            if (custom[key] !== null && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
                result[key] = this.mergeSettings(defaults[key] || {}, custom[key]);
            } else {
                result[key] = custom[key];
            }
        }
        
        return result;
    }

    /**
     * Obtém configuração específica
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let current = this.currentSettings;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }

    /**
     * Define configuração específica
     */
    set(path, value) {
        const keys = path.split('.');
        let current = this.currentSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        this.notifyObservers('settingChanged', { path, oldValue, newValue: value });
        
        return this;
    }

    /**
     * Reseta configurações para padrão
     */
    reset() {
        this.currentSettings = { ...this.defaultSettings };
        this.saveSettings();
        this.notifyObservers('settingsReset');
        console.log('🔄 Configurações resetadas');
    }

    /**
     * Reseta seção específica
     */
    resetSection(section) {
        if (this.defaultSettings[section]) {
            this.currentSettings[section] = { ...this.defaultSettings[section] };
            this.saveSettings();
            this.notifyObservers('sectionReset', { section });
            console.log(`🔄 Seção ${section} resetada`);
        }
    }

    /**
     * Valida configurações
     */
    validate() {
        const errors = [];
        
        // Validar intervalos
        const minInterval = this.get('attack.minInterval');
        const maxInterval = this.get('attack.maxInterval');
        const defaultInterval = this.get('attack.defaultInterval');
        
        if (defaultInterval < minInterval || defaultInterval > maxInterval) {
            errors.push('Intervalo padrão deve estar entre mínimo e máximo');
        }
        
        // Validar distância
        const maxDistance = this.get('attack.maxDistance');
        if (maxDistance < 1 || maxDistance > 1000) {
            errors.push('Distância máxima deve estar entre 1 e 1000');
        }
        
        // Validar fator de aleatoriedade
        const randomFactor = this.get('antiDetection.randomFactor');
        if (randomFactor < 0 || randomFactor > 1) {
            errors.push('Fator aleatório deve estar entre 0 e 1');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Registra observador para mudanças
     */
    onChange(callback) {
        const id = Date.now() + Math.random();
        this.observers.set(id, callback);
        return id;
    }

    /**
     * Remove observador
     */
    removeObserver(id) {
        return this.observers.delete(id);
    }

    /**
     * Notifica observadores
     */
    notifyObservers(event, data = null) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.warn('⚠️ Erro em observer:', error);
            }
        });
    }

    /**
     * Exporta configurações
     */
    export() {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    /**
     * Importa configurações
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.currentSettings = this.mergeSettings(this.defaultSettings, imported);
            
            const validation = this.validate();
            if (!validation.isValid) {
                console.warn('⚠️ Configurações importadas contêm erros:', validation.errors);
            }
            
            this.saveSettings();
            this.notifyObservers('settingsImported');
            
            return validation.isValid;
            
        } catch (error) {
            console.error('❌ Erro ao importar configurações:', error);
            return false;
        }
    }

    /**
     * Cria preset de configurações
     */
    createPreset(name, settings = null) {
        const presetSettings = settings || this.currentSettings;
        const presets = this.getPresets();
        
        presets[name] = {
            settings: presetSettings,
            created: new Date().toISOString(),
            description: `Preset criado em ${new Date().toLocaleString()}`
        };
        
        localStorage.setItem('twbot-presets', JSON.stringify(presets));
        console.log(`💾 Preset "${name}" criado`);
    }

    /**
     * Aplica preset
     */
    applyPreset(name) {
        const presets = this.getPresets();
        if (presets[name]) {
            this.currentSettings = this.mergeSettings(this.defaultSettings, presets[name].settings);
            this.saveSettings();
            this.notifyObservers('presetApplied', { name });
            console.log(`✅ Preset "${name}" aplicado`);
            return true;
        }
        return false;
    }

    /**
     * Obtém lista de presets
     */
    getPresets() {
        try {
            const presets = localStorage.getItem('twbot-presets');
            return presets ? JSON.parse(presets) : {};
        } catch (error) {
            console.warn('⚠️ Erro ao carregar presets:', error);
            return {};
        }
    }

    /**
     * Remove preset
     */
    deletePreset(name) {
        const presets = this.getPresets();
        if (presets[name]) {
            delete presets[name];
            localStorage.setItem('twbot-presets', JSON.stringify(presets));
            console.log(`🗑️ Preset "${name}" removido`);
            return true;
        }
        return false;
    }

    /**
     * Obtém todas as configurações atuais
     */
    getAll() {
        return { ...this.currentSettings };
    }

    /**
     * Aplica configurações em lote
     */
    setBatch(settings) {
        for (const [path, value] of Object.entries(settings)) {
            this.set(path, value);
        }
        this.saveSettings();
    }
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.BotSettings = BotSettings;
}