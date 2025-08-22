# BOT-TWB - Sistema Modular

## 🚨 **IMPORTANTE - Escolha sua versão:**

### ✅ **FUNCIONA AGORA: Script Completo**
- **Arquivo**: `bot-twb.user.js` (2917 linhas)
- **Status**: ✅ Funcionando 100%
- **Uso**: Copie e cole no Tampermonkey

### ⏳ **FUTURO: Script Modular** 
- **Arquivo**: `loader.user.js` (287 linhas)
- **Status**: ⏳ Requer GitHub Pages ativo
- **Uso**: Aguardar configuração do GitHub Pages

## 🚀 Instalação Rápida (Recomendada)

### Para usar AGORA:

1. **Copie o conteúdo de `bot-twb.user.js`**
2. **Cole no Tampermonkey** 
3. **Pronto!** Sistema completo funcionando

### Para usar no FUTURO (quando GitHub Pages estiver ativo):

1. **Ative GitHub Pages** (Settings → Pages → Deploy from branch main)
2. **Aguarde 5-10 minutos**
3. **Teste a URL**: `https://Pelegriinoo.github.io/BOT-TWB/dist/modules/constants.js`
4. **Se funcionar**, use `loader.user.js`

## ✨ Vantagens da Versão Modular (Futuro)

- ✅ **Script 90% menor** (287 vs 2917 linhas)
- ✅ **Atualizações automáticas** 
- ✅ **Carregamento dinâmico**
- ✅ **Melhor organização**

## 🛠️ Como Funciona o Sistema Modular

1. Loader carrega módulos remotamente via HTTPS
2. Sistema monta automaticamente no navegador
3. Interface fica disponível como antes
4. Atualizações são automáticas

## 📁 Arquivos Disponíveis

| Arquivo | Tamanho | Status | Uso |
|---------|---------|--------|-----|
| `bot-twb.user.js` | 2917 linhas | ✅ Funciona | Use agora |
| `loader.user.js` | 287 linhas | ⏳ GitHub Pages | Use depois |
| `loader-test.user.js` | 100 linhas | 🧪 Teste | Testar conceito |

## 🎮 Uso (Igual em Todas as Versões)

### Abrir Interface
- **Ctrl + Shift + T** ou `TWB.show()`

### API Disponível

```javascript
// Enviar ataque
TWB.sendAttack('500|500', { axe: 100, light: 50 }, 'attack');

// Obter tropas
const troops = await TWB.getTroops();

// Obter aldeias
const villages = await TWB.getVillages();

// Status do sistema
console.log(TWB.getStatus());
```

## 🆘 Solução de Problemas

### "Falha ao carregar módulos"
- ✅ **Solução**: Use `bot-twb.user.js` (script completo)
- ⏳ **Aguarde**: GitHub Pages ser ativado

### "Sistema não carrega"
- Verifique se está na página do jogo
- Abra o console (F12) para ver erros

## 🔄 Migrando Versões

### De Script Completo → Modular:
1. Ative GitHub Pages
2. Teste se módulos carregam
3. Substitua script no Tampermonkey
4. Beneficie-se das atualizações automáticas

---

**💡 Dica**: Use o script completo agora e migre para o modular quando estiver pronto!
Gerado automaticamente em 22/08/2025, 12:52:27
