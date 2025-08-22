# 🏰 BOT-TWB - Tribal Wars Bot System

> Sistema modular e automatizado para Tribal Wars com interface intuitiva e funcionalidades avançadas.

## 🚀 Instalação Rápida

### 1️⃣ Instale o Tampermonkey
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2️⃣ Instale o BOT-TWB
**Clique no link abaixo e confirme a instalação:**

📥 **[INSTALAR BOT-TWB](https://Pelegriinoo.github.io/BOT-TWB/dist/bot-twb.user.js)**

### 3️⃣ Use no Tribal Wars
1. Entre em qualquer mundo do Tribal Wars
2. O ícone ⚔️ aparecerá na interface
3. Clique para abrir o painel de controle

## ✨ Funcionalidades

### 🎯 Sistema de Ataque
- **Envio automático**: Configure coordenadas e tropas
- **Presets inteligentes**: Ofensivo, defensivo ou personalizado
- **Validação automática**: Verifica tropas disponíveis
- **Múltiplos ataques**: Queue de ataques sequenciais

### 📊 Contador de Tropas
- **Detecção automática**: Lê tropas da aldeia atual
- **Estatísticas detalhadas**: Poder ofensivo e defensivo
- **Presets rápidos**: Seleção rápida por tipo de tropa
- **Interface visual**: Cards coloridos por categoria

### 🏘️ Gerenciador de Aldeias
- **Multi-aldeia**: Suporte para múltiplas aldeias
- **Troca rápida**: Navegação entre aldeias
- **Estado persistente**: Lembra configurações por aldeia

### 🔧 Configurações Avançadas
- **Autenticação**: Gerenciamento automático de tokens
- **API integrada**: Comunicação direta com o servidor
- **Logs detalhados**: Sistema de debug avançado

## 🌍 Mundos Suportados

- 🇧🇷 Brasil (`.com.br`)
- 🇺🇸 Internacional (`.net`)
- 🇩🇪 Alemanha (`.de`)
- 🇵🇱 Polônia (`.pl`)
- 🇮🇹 Itália (`.it`)
- 🇸🇮 Eslovênia (`.si`)

## 📁 Estrutura do Projeto

```
BOT-TWB/
├── 📁 src/
│   ├── 📁 core/          # API, autenticação, utilitários
│   ├── 📁 interface/     # Interface gráfica
│   ├── 📁 modules/       # Sistemas funcionais
│   └── 📁 config/        # Configurações e constantes
├── 📁 dist/             # Build final
├── 📁 docs/             # Documentação
└── build.js             # Script de build
```

## 🛠️ Para Desenvolvedores

### Executar Build
```bash
npm install
npm run build
```

### Estrutura Modular
- **Core**: API base, autenticação, gerenciamento de tropas
- **Interface**: Componentes UI reutilizáveis
- **Modules**: Sistemas funcionais (ataque, contador, etc.)
- **Config**: Constantes e configurações

### Adicionar Nova Funcionalidade
1. Crie módulo em `src/modules/`
2. Registre no `build.js`
3. Execute `npm run build`
4. Teste no Tampermonkey

## 📚 Documentação

- [📥 Guia de Instalação](docs/installation.md)
- [📖 Manual de Uso](docs/usage.md)
- [🔧 API Reference](docs/api.md)

## 🐛 Problemas?

### Issues Comuns
- **Script não carrega**: Verifique se Tampermonkey está ativo
- **Funcionalidades não aparecem**: Aguarde carregamento completo da página
- **Erros no console**: Recarregue a página ou reinstale o script

### Suporte
- [🐛 Reportar Bug](https://github.com/Pelegriinoo/BOT-TWB/issues)
- [💡 Sugerir Feature](https://github.com/Pelegriinoo/BOT-TWB/issues)
- [❓ Fazer Pergunta](https://github.com/Pelegriinoo/BOT-TWB/discussions)

## 🚨 Aviso Legal

⚠️ **Este bot é para fins educacionais e de automação pessoal.**
- Use por sua própria conta e risco
- Respeite os termos de serviço do Tribal Wars
- Não nos responsabilizamos por banimentos

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

**⭐ Se o projeto foi útil, deixe uma estrela no GitHub!**

**🔄 Atualizações automáticas via GitHub Pages**