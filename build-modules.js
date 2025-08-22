/**
 * BOT-TWB Module Builder - Copia módulos para distribuição
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');

// Diretórios
const modulesDir = path.join(__dirname, 'modules');
const distModulesDir = path.join(__dirname, 'dist', 'modules');

// Garantir que o diretório de destino existe
if (!fs.existsSync(distModulesDir)) {
    fs.mkdirSync(distModulesDir, { recursive: true });
}

// Lista de módulos em ordem de carregamento
const modules = [
    'constants.js',
    'api.js', 
    'auth.js',
    'troops.js',
    'utils.js',
    'attack-system.js',
    'troop-counter.js',
    'village-manager.js',
    'ui-components.js',
    'main-interface.js',
    'system.js'
];

console.log('🔄 Copiando módulos para distribuição...');

modules.forEach(module => {
    const srcPath = path.join(modulesDir, module);
    const destPath = path.join(distModulesDir, module);
    
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ ${module} copiado`);
        } else {
            console.warn(`⚠️ ${module} não encontrado`);
        }
    } catch (error) {
        console.error(`❌ Erro ao copiar ${module}:`, error.message);
    }
});

console.log('\n🎉 Módulos copiados com sucesso!');
console.log(`📁 Diretório: ${distModulesDir}`);

// Criar arquivo de manifesto
const manifest = {
    version: '2.0.0',
    modules: modules,
    baseUrl: 'https://Pelegriinoo.github.io/BOT-TWB/dist/modules/',
    description: 'BOT-TWB Modular System - Tribal Wars Bot',
    lastUpdated: new Date().toISOString()
};

fs.writeFileSync(
    path.join(distModulesDir, 'manifest.json'), 
    JSON.stringify(manifest, null, 2)
);

console.log('📋 Manifesto criado: manifest.json');
