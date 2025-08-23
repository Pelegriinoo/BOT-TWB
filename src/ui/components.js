
/**
 * Componentes UI Reutilizáveis
 * Elementos de interface padronizados
 */

class UIComponents {
    constructor() {
        this.modals = new Map();
        this.notifications = [];
    }

    /**
     * Cria botão estilizado
     */
    createButton(text, type = 'primary', onClick = null) {
        const button = document.createElement('button');
        button.className = `btn btn-${type}`;
        button.textContent = text;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * Cria input com label
     */
    createInputGroup(labelText, inputType = 'text', placeholder = '', value = '') {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        
        const input = document.createElement('input');
        input.type = inputType;
        input.placeholder = placeholder;
        input.value = value;
        
        group.appendChild(label);
        group.appendChild(input);
        
        return { group, input, label };
    }

    /**
     * Cria select dropdown
     */
    createSelect(labelText, options = []) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        
        const select = document.createElement('select');
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value || option;
            optElement.textContent = option.text || option;
            select.appendChild(optElement);
        });
        
        group.appendChild(label);
        group.appendChild(select);
        
        return { group, select, label };
    }

    /**
     * Cria modal
     */
    createModal(title, content, options = {}) {
        const modalId = 'modal-' + Date.now();
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'tw-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${options.showCancel !== false ? '<button class="btn btn-secondary modal-cancel">Cancelar</button>' : ''}
                    ${options.confirmText ? `<button class="btn btn-primary modal-confirm">${options.confirmText}</button>` : ''}
                </div>
            </div>
        `;
        
        // Event listeners
        modal.querySelector('.modal-close').onclick = () => this.closeModal(modalId);
        modal.querySelector('.modal-backdrop').onclick = () => this.closeModal(modalId);
        
        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                if (options.onCancel) options.onCancel();
                this.closeModal(modalId);
            };
        }
        
        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                if (options.onConfirm) options.onConfirm();
                this.closeModal(modalId);
            };
        }
        
        document.body.appendChild(modal);
        this.modals.set(modalId, modal);
        
        return modalId;
    }

    /**
     * Fecha modal
     */
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            document.body.removeChild(modal);
            this.modals.delete(modalId);
        }
    }

    /**
     * Cria notificação toast
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `tw-notification tw-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Posicionar
        notification.style.position = 'fixed';
        notification.style.top = `${20 + this.notifications.length * 70}px`;
        notification.style.right = '20px';
        notification.style.zIndex = '10001';
        
        // Event listeners
        notification.querySelector('.notification-close').onclick = () => {
            this.removeNotification(notification);
        };
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }
        
        return notification;
    }

    /**
     * Remove notificação
     */
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
            
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Reposicionar outras notificações
            this.repositionNotifications();
        }
    }

    /**
     * Reposiciona notificações
     */
    repositionNotifications() {
        this.notifications.forEach((notification, index) => {
            notification.style.top = `${20 + index * 70}px`;
        });
    }

    /**
     * Ícones para notificações
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Cria tabela de dados
     */
    createDataTable(headers, rows, options = {}) {
        const table = document.createElement('table');
        table.className = 'tw-data-table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            row.forEach((cell, index) => {
                const td = document.createElement('td');
                
                if (typeof cell === 'object' && cell.html) {
                    td.innerHTML = cell.html;
                } else {
                    td.textContent = cell;
                }
                
                if (cell.className) {
                    td.className = cell.className;
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        return table;
    }

    /**
     * Cria progress bar
     */
    createProgressBar(label, value = 0, max = 100) {
        const container = document.createElement('div');
        container.className = 'progress-container';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'progress-label';
        labelEl.textContent = label;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${(value / max) * 100}%`;
        
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = `${value}/${max}`;
        
        progressBar.appendChild(progressFill);
        progressBar.appendChild(progressText);
        
        container.appendChild(labelEl);
        container.appendChild(progressBar);
        
        // Método para atualizar
        container.updateProgress = (newValue, newMax = max) => {
            const percent = (newValue / newMax) * 100;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${newValue}/${newMax}`;
        };
        
        return container;
    }

    /**
     * Cria loading spinner
     */
    createLoader(text = 'Carregando...') {
        const loader = document.createElement('div');
        loader.className = 'tw-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">${text}</div>
        `;
        
        return loader;
    }

    /**
     * Cria tooltip
     */
    createTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tw-tooltip tw-tooltip-${position}`;
        tooltip.textContent = text;
        
        element.addEventListener('mouseenter', (e) => {
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;
            
            if (position === 'bottom') {
                top = rect.bottom + 10;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        return tooltip;
    }
}

// Estilos CSS para componentes
const componentStyles = `
    .tw-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
    }

    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2c3e50, #3498db);
        border-radius: 10px;
        min-width: 400px;
        max-width: 90%;
        color: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        padding: 20px;
        border-bottom: 2px solid #34495e;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        color: #ecf0f1;
    }

    .modal-close {
        background: #e74c3c;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
    }

    .modal-body {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
    }

    .modal-footer {
        padding: 20px;
        border-top: 1px solid #34495e;
        text-align: right;
    }

    .modal-footer .btn {
        margin-left: 10px;
    }

    .tw-notification {
        background: rgba(44, 62, 80, 0.95);
        border-radius: 8px;
        padding: 15px;
        max-width: 400px;
        color: white;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    }

    .tw-notification-success { border-left: 4px solid #27ae60; }
    .tw-notification-error { border-left: 4px solid #e74c3c; }
    .tw-notification-warning { border-left: 4px solid #f39c12; }
    .tw-notification-info { border-left: 4px solid #3498db; }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        margin-left: auto;
    }

    .tw-data-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        overflow: hidden;
    }

    .tw-data-table th,
    .tw-data-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #34495e;
    }

    .tw-data-table th {
        background: rgba(52, 152, 219, 0.3);
        font-weight: bold;
    }

    .tw-data-table tr:hover {
        background: rgba(52, 152, 219, 0.1);
    }

    .progress-container {
        margin: 10px 0;
    }

    .progress-label {
        margin-bottom: 5px;
        color: #ecf0f1;
    }

    .progress-bar {
        position: relative;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #27ae60, #2ecc71);
        transition: width 0.3s ease;
    }

    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
    }

    .tw-loader {
        text-align: center;
        padding: 20px;
    }

    .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.2);
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }

    .loader-text {
        color: #bdc3c7;
    }

    .tw-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10002;
        max-width: 200px;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Injetar estilos
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = componentStyles;
    document.head.appendChild(style);
}

// Registrar globalmente
if (typeof window !== 'undefined') {
    window.UIComponents = UIComponents;
}