# BOT-TWB - Build 2.0.0

## Arquivos Gerados

- **bot-twb.user.js**: UserScript completo com todos os módulos
- **Tamanho**: 79 KB

## Módulos Incluídos

- config/constants.js
- core/api.js
- core/auth.js
- core/troops.js
- core/utils.js
- modules/attack-system.js
- modules/troop-counter.js
- modules/village-manager.js
- interface/components.js
- interface/main.js

## Instalação

1. Instale o Tampermonkey ou Greasemonkey
2. Clique em "Criar um novo script"
3. Cole o conteúdo de `bot-twb.user.js`
4. Salve o script
5. Acesse o Tribal Wars

## Uso

- **Ctrl+Shift+T**: Abrir/fechar interface
- **window.TWB**: API global disponível no console

## API Global

```javascript
// Enviar ataque rápido
TWB.sendAttack('500|500', {axe: 100, light: 50}, 'attack');

// Obter tropas
const troops = await TWB.getTroops();

// Abrir interface
TWB.show();

// Status do sistema
TWB.getStatus();
```

---
Gerado automaticamente em 22/08/2025, 12:00:43
