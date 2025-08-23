# 📥 Instalação do BOT-TWB

## Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- Extensão Tampermonkey instalada

## Passo a Passo

### 1. Instalar Tampermonkey

**Chrome/Edge:**
1. Acesse: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Clique em "Adicionar ao Chrome"

**Firefox:**
1. Acesse: https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/
2. Clique em "Adicionar ao Firefox"

### 2. Instalar o Bot

1. **Clique neste link:** [Instalar BOT-TWB](https://raw.githubusercontent.com/Pelegriinoo/BOT-TWB/main/tampermonkey/bot-loader.user.js)
2. O Tampermonkey abrirá automaticamente
3. Clique em **"Instalar"**
4. Acesse o Tribal Wars

### 3. Usar o Bot

1. Entre no Tribal Wars normalmente
2. Aguarde o carregamento (aparecerá uma notificação)
3. Clique no botão flutuante **🏰** no canto direito
4. A interface do bot abrirá

## Configuração Inicial

### Primeira Utilização

1. **Coletar Tropas**: Clique em "Tropas" → "Coletar Tropas"
2. **Configurar Intervalos**: Vá em "Config" e ajuste o intervalo entre ataques
3. **Testar Sistema**: Digite uma coordenada e teste "Buscar Vilas Próximas"

### Configurações Recomendadas

- **Intervalo entre ataques**: 3000ms (3 segundos)
- **Distância máxima**: 50 campos
- **Anti-Detecção**: Médio

## Verificação

Para verificar se o bot está funcionando:

```javascript
// Cole no console do navegador (F12)
console.log(window.twBot ? '✅ Bot carregado' : '❌ Bot não encontrado');