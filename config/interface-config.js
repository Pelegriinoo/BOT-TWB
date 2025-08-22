/**
 * TWB Interface Configuration
 * @version 1.0.0
 */

window.TWBConfig = {
    // Caminhos dos arquivos
    paths: {
        templates: './templates/',
        styles: './styles/',
        assets: './assets/'
    },
    
    // Arquivos específicos
    files: {
        interfaceHTML: 'interface.html',
        interfaceCSS: 'interface.css'
    },
    
    // Configurações da interface
    interface: {
        position: 'top-right', // top-right, top-left, bottom-right, bottom-left
        width: 420,
        maxHeight: '90vh',
        zIndex: 999999,
        autoShow: false,
        enableKeyboardShortcut: true,
        keyboardShortcut: 'Ctrl+Shift+T'
    },
    
    // Configurações de comportamento
    behavior: {
        autoDetectTroops: true,
        autoUpdateInfo: true,
        enableFallback: true,
        showErrorMessages: true,
        animationsEnabled: true
    },
    
    // Configurações de desenvolvimento
    debug: {
        enabled: false,
        logLevel: 'warn', // error, warn, info, debug
        showLoadTimes: false
    },
    
    // URLs e endpoints (se necessário)
    api: {
        baseURL: window.location.origin,
        timeout: 5000
    },
    
    // Função para obter caminho completo
    getPath: function(type, file) {
        const basePath = this.paths[type] || '';
        return basePath + (file || '');
    },
    
    // Função para obter caminho da interface
    getInterfacePaths: function() {
        return {
            html: this.getPath('templates', this.files.interfaceHTML),
            css: this.getPath('styles', this.files.interfaceCSS)
        };
    },
    
    // Função para verificar se está em modo debug
    isDebug: function() {
        return this.debug.enabled || window.location.search.includes('debug=true');
    },
    
    // Função para log condicional
    log: function(level, message, ...args) {
        if (!this.isDebug()) return;
        
        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevelIndex = levels.indexOf(this.debug.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex <= currentLevelIndex) {
            console[level](`[TWB-${level.toUpperCase()}]`, message, ...args);
        }
    }
};

// Exportar configuração globalmente
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TWBConfig;
}

console.log('⚙️ TWB Configuration loaded');