# 📥 Guia de Instalação - BOT-TWB

## 🔧 Pré-requisitos

1. **Tampermonkey** (recomendado) ou **Greasemonkey**
   - Chrome: [Tampermonkey na Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Tampermonkey no Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - Edge: [Tampermonkey na Microsoft Store](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

## 📱 Instalação

### Método 1: Instalação Direta (GitHub Pages)
1. Certifique-se que o Tampermonkey está instalado
2. Clique no link: [Instalar BOT-TWB](https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb.user.js)
3. O Tampermonkey abrirá automaticamente
4. Clique em "Install" para confirmar

### Método 2: Instalação Manual
1. Abra o Tampermonkey Dashboard
2. Clique na aba "Utilities"
3. Cole a URL no campo "Install from URL":
   ```
   https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb.user.js
   ```
4. Clique em "Install"

### Método 3: Cópia Manual do Código
1. Abra o arquivo: [`dist/bot-twb.user.js`](../dist/bot-twb.user.js)
2. Copie todo o conteúdo (Ctrl+A, Ctrl+C)
3. Abra o Tampermonkey Dashboard
4. Clique em "Create a new script"
5. Cole o código (Ctrl+V)
6. Salve (Ctrl+S)

## ✅ Verificação da Instalação

1. Abra qualquer mundo do Tribal Wars
2. Você deve ver no console do navegador:
   ```
   🏰 BOT-TWB v2.0.0 - Iniciado
   ```
3. O ícone ⚔️ do bot deve aparecer na interface do jogo

## 🔄 Atualizações Automáticas

O script está configurado para atualizar automaticamente via GitHub Pages. 
Para forçar uma atualização:

1. Abra o Tampermonkey Dashboard
2. Encontre "BOT-TWB - Tribal Wars Bot System"
3. Clique em "Check for updates"

## 🌍 Mundos Suportados

- 🇧🇷 **Brasil**: `*.tribalwars.com.br`
- 🇺🇸 **Internacional**: `*.tribalwars.net`
- 🇩🇪 **Alemanha**: `*.die-staemme.de`
- 🇵🇱 **Polônia**: `*.plemiona.pl`
- 🇮🇹 **Itália**: `*.tribals.it`, `*.guerretribali.it`
- 🇸🇮 **Eslovênia**: `*.vojnaplemen.si`

## ❓ Problemas na Instalação?

### Script não carrega
1. Verifique se o Tampermonkey está ativo
2. Recarregue a página do Tribal Wars
3. Verifique o console (F12) para erros

### Funcionalidades não aparecem
1. Aguarde o carregamento completo da página
2. Verifique se está em `game.php` (não na página inicial)
3. Tente recarregar o script no Tampermonkey

### Ainda com problemas?
- [Abra uma issue no GitHub](https://github.com/Pelegriinoo/BOT-TWB/issues)
- Inclua: navegador, versão do Tampermonkey, mundo do jogo

## 🔒 Segurança

✅ **O script é seguro:**
- Código aberto no GitHub
- Não coleta dados pessoais
- Não se conecta a servidores externos
- Funciona apenas localmente no seu navegador
