/**
 * BOT-TWB UI Components - Componentes de interface reutilizáveis
 * @version 2.0.0
 * @author BOT-TWB
 */

window.UIComponents = class UIComponents {
    constructor() {
        this.components = new Map();
    }

    /**
     * Cria um botão estilizado
     */
    createButton(text, className = '', onClick = null) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `twb-btn ${className}`;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * Cria um input estilizado
     */
    createInput(type = 'text', placeholder = '', className = '') {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.className = `twb-input ${className}`;
        
        return input;
    }

    /**
     * Cria um select estilizado
     */
    createSelect(options = [], className = '') {
        const select = document.createElement('select');
        select.className = `twb-select ${className}`;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value || option;
            optionElement.textContent = option.text || option;
            select.appendChild(optionElement);
        });
        
        return select;
    }

    /**
     * Cria uma div com classe TWB
     */
    createDiv(className = '', content = '') {
        const div = document.createElement('div');
        div.className = className;
        if (content) div.innerHTML = content;
        return div;
    }

    /**
     * Cria um card de tropa
     */
    createTroopCard(unit, count, config) {
        const card = this.createDiv('twb-troop-card');
        
        card.innerHTML = `
            <div class="twb-troop-icon">
                <img src="/graphic/unit/unit_${unit}.png" alt="${config.name}" title="${config.name}">
            </div>
            <div class="twb-troop-info">
                <div class="twb-troop-name">${config.name}</div>
                <div class="twb-troop-count">${count || 0}</div>
            </div>
        `;
        
        return card;
    }

    /**
     * Cria um status badge
     */
    createStatusBadge(text, type = 'info') {
        const badge = this.createDiv(`twb-status twb-${type}`);
        badge.textContent = text;
        return badge;
    }

    /**
     * Cria um loading spinner
     */
    createSpinner(size = 'medium') {
        const spinner = this.createDiv(`twb-spinner twb-spinner-${size}`);
        spinner.innerHTML = `
            <div class="twb-spinner-circle"></div>
        `;
        return spinner;
    }

    /**
     * Cria um modal/popup
     */
    createModal(title, content, buttons = []) {
        const modal = this.createDiv('twb-modal');
        
        modal.innerHTML = `
            <div class="twb-modal-backdrop"></div>
            <div class="twb-modal-content">
                <div class="twb-modal-header">
                    <h3>${title}</h3>
                    <button class="twb-modal-close">×</button>
                </div>
                <div class="twb-modal-body">
                    ${content}
                </div>
                <div class="twb-modal-footer">
                    ${buttons.map(btn => `<button class="twb-btn ${btn.class || ''}" data-action="${btn.action || ''}">${btn.text}</button>`).join('')}
                </div>
            </div>
        `;
        
        // Event listeners
        const closeBtn = modal.querySelector('.twb-modal-close');
        const backdrop = modal.querySelector('.twb-modal-backdrop');
        
        const closeModal = () => modal.remove();
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        return modal;
    }

    /**
     * Cria um progress bar
     */
    createProgressBar(value = 0, max = 100, showText = true) {
        const container = this.createDiv('twb-progress');
        const bar = this.createDiv('twb-progress-bar');
        const text = this.createDiv('twb-progress-text');
        
        const percentage = Math.round((value / max) * 100);
        bar.style.width = percentage + '%';
        text.textContent = showText ? `${percentage}%` : '';
        
        container.appendChild(bar);
        if (showText) container.appendChild(text);
        
        return { 
            container, 
            bar, 
            text, 
            update: (newValue) => {
                const newPercentage = Math.round((newValue / max) * 100);
                bar.style.width = newPercentage + '%';
                text.textContent = showText ? `${newPercentage}%` : '';
            }
        };
    }

    /**
     * Registra um componente para reuso
     */
    register(name, component) {
        this.components.set(name, component);
    }

    /**
     * Recupera um componente registrado
     */
    get(name) {
        return this.components.get(name);
    }
};

console.log('🎨 TWB UI Components carregadas');
