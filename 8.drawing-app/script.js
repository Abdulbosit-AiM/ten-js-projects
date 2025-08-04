// Enhanced Drawing Application with Modern JavaScript
class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPressed = false;
        this.size = 30;
        this.color = '#000000';
        this.x = undefined;
        this.y = undefined;
        this.history = [];
        this.historyStep = -1;
        this.strokeCount = 0;
        this.startTime = Date.now();
        
        this.elements = {};
        this.presetColors = [
            '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
        ];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.cacheElements();
        this.setupEventListeners();
        this.createPresetColors();
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
        this.saveState();
        this.updateStats();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 500;
        
        // Set initial canvas background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    cacheElements() {
        this.elements = {
            increaseBtn: document.getElementById('increase'),
            decreaseBtn: document.getElementById('decrease'),
            sizeEl: document.getElementById('size'),
            colorEl: document.getElementById('color'),
            clearEl: document.getElementById('clear'),
            saveBtn: document.getElementById('save'),
            undoBtn: document.getElementById('undo')
        };
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'));
        this.canvas.addEventListener('touchend', (e) => this.handleTouch(e, 'end'));

        // Tool events
        this.elements.increaseBtn.addEventListener('click', () => this.changeSize(5));
        this.elements.decreaseBtn.addEventListener('click', () => this.changeSize(-5));
        this.elements.colorEl.addEventListener('change', (e) => this.changeColor(e.target.value));
        this.elements.clearEl.addEventListener('click', () => this.clearCanvas());
        
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => this.saveDrawing());
        }
        
        if (this.elements.undoBtn) {
            this.elements.undoBtn.addEventListener('click', () => this.undo());
        }

        // Mouse tracking for brush preview
        document.addEventListener('mousemove', (e) => this.updateBrushPreview(e));
        this.canvas.addEventListener('mouseenter', () => this.showBrushPreview());
        this.canvas.addEventListener('mouseleave', () => this.hideBrushPreview());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for our shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveDrawing();
                        break;
                    case 'Delete':
                    case 'Backspace':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.clearCanvas();
                        }
                        break;
                }
            }
            
            // Size controls
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.changeSize(5);
            } else if (e.key === '-') {
                e.preventDefault();
                this.changeSize(-5);
            }
            
            // Number keys for preset colors
            const num = parseInt(e.key);
            if (num >= 1 && num <= this.presetColors.length) {
                this.changeColor(this.presetColors[num - 1]);
            }
        });
    }

    handleTouch(e, type) {
        e.preventDefault();
        const touch = e.touches[0] || e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const mouseEvent = new MouseEvent(
            type === 'start' ? 'mousedown' : type === 'move' ? 'mousemove' : 'mouseup',
            {
                clientX: touch.clientX,
                clientY: touch.clientY
            }
        );

        if (type === 'start') {
            this.startDrawing({ offsetX: x, offsetY: y });
        } else if (type === 'move') {
            this.draw({ offsetX: x, offsetY: y });
        } else {
            this.stopDrawing();
        }
    }

    startDrawing(e) {
        this.isPressed = true;
        this.x = e.offsetX;
        this.y = e.offsetY;
        
        // Start a new path
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        
        this.canvas.classList.add('drawing');
        this.strokeCount++;
    }

    stopDrawing() {
        if (this.isPressed) {
            this.isPressed = false;
            this.x = undefined;
            this.y = undefined;
            this.canvas.classList.remove('drawing');
            this.saveState();
            this.updateStats();
        }
    }

    draw(e) {
        if (!this.isPressed) return;

        const x2 = e.offsetX;
        const y2 = e.offsetY;

        // Draw line
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.size;
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Draw circle at current position for smoother lines
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, this.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);

        this.x = x2;
        this.y = y2;
    }

    changeSize(delta) {
        this.size += delta;
        this.size = Math.max(5, Math.min(100, this.size));
        this.updateSizeDisplay();
        this.updateBrushPreviewSize();
        this.animateButton(delta > 0 ? this.elements.increaseBtn : this.elements.decreaseBtn);
    }

    changeColor(newColor) {
        this.color = newColor;
        this.elements.colorEl.value = newColor;
        this.updatePresetColorSelection();
        this.updateBrushPreviewColor();
        this.showColorChangeEffect();
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.history = [];
            this.historyStep = -1;
            this.strokeCount = 0;
            this.startTime = Date.now();
            this.saveState();
            this.updateStats();
            this.showNotification('Canvas cleared!', 'info');
        }
    }

    saveDrawing() {
        const link = document.createElement('a');
        link.download = `drawing-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        this.showNotification('Drawing saved!', 'success');
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const imageData = this.history[this.historyStep];
            this.ctx.putImageData(imageData, 0, 0);
            this.updateStats();
            this.showNotification('Undone!', 'info');
        } else {
            this.showNotification('Nothing to undo!', 'warning');
        }
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        
        // Limit history to prevent memory issues
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
    }

    updateSizeDisplay() {
        this.elements.sizeEl.textContent = this.size;
        this.elements.sizeEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.elements.sizeEl.style.transform = 'scale(1)';
        }, 150);
    }

    createPresetColors() {
        const toolbox = document.querySelector('.toolbox');
        const colorGroup = document.createElement('div');
        colorGroup.className = 'tool-group preset-colors';
        
        this.presetColors.forEach((color, index) => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'preset-color';
            colorBtn.style.backgroundColor = color;
            colorBtn.title = `Color ${index + 1} (Press ${index + 1})`;
            colorBtn.addEventListener('click', () => this.changeColor(color));
            colorGroup.appendChild(colorBtn);
        });
        
        // Insert before the last tool group (actions)
        const lastGroup = toolbox.lastElementChild;
        toolbox.insertBefore(colorGroup, lastGroup);
        
        this.updatePresetColorSelection();
    }

    updatePresetColorSelection() {
        document.querySelectorAll('.preset-color').forEach(btn => {
            btn.classList.toggle('active', btn.style.backgroundColor === this.rgbToHex(this.color) || btn.style.backgroundColor === this.color);
        });
    }

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        const result = rgb.match(/\d+/g);
        if (!result) return rgb;
        return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }

    createBrushPreview() {
        const preview = document.createElement('div');
        preview.className = 'brush-preview';
        document.body.appendChild(preview);
        return preview;
    }

    showBrushPreview() {
        if (!this.brushPreview) {
            this.brushPreview = this.createBrushPreview();
        }
        this.brushPreview.style.display = 'block';
        this.updateBrushPreviewSize();
        this.updateBrushPreviewColor();
    }

    hideBrushPreview() {
        if (this.brushPreview) {
            this.brushPreview.style.display = 'none';
        }
    }

    updateBrushPreview(e) {
        if (this.brushPreview && this.brushPreview.style.display === 'block') {
            this.brushPreview.style.left = e.clientX + 'px';
            this.brushPreview.style.top = e.clientY + 'px';
        }
    }

    updateBrushPreviewSize() {
        if (this.brushPreview) {
            this.brushPreview.style.width = this.size + 'px';
            this.brushPreview.style.height = this.size + 'px';
        }
    }

    updateBrushPreviewColor() {
        if (this.brushPreview) {
            this.brushPreview.style.backgroundColor = this.color;
            this.brushPreview.style.borderColor = this.color === '#ffffff' ? '#000000' : this.color;
        }
    }

    updateStats() {
        let statsEl = document.querySelector('.drawing-stats');
        if (!statsEl) {
            statsEl = document.createElement('div');
            statsEl.className = 'drawing-stats';
            document.body.appendChild(statsEl);
        }

        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;

        statsEl.innerHTML = `
            <div class="stat">
                <span>Strokes:</span>
                <span>${this.strokeCount}</span>
            </div>
            <div class="stat">
                <span>Time:</span>
                <span>${minutes}:${seconds.toString().padStart(2, '0')}</span>
            </div>
            <div class="stat">
                <span>Brush Size:</span>
                <span>${this.size}px</span>
            </div>
            <div class="stat">
                <span>History:</span>
                <span>${this.historyStep + 1}/${this.history.length}</span>
            </div>
        `;
    }

    animateButton(button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    showColorChangeEffect() {
        const colorPicker = this.elements.colorEl;
        colorPicker.style.animation = 'colorPulse 0.5s ease-out';
        setTimeout(() => {
            colorPicker.style.animation = '';
        }, 500);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: var(--spacing-6);
            right: var(--spacing-6);
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--error-color)' : 
                        type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
            color: white;
            padding: var(--spacing-3) var(--spacing-5);
            border-radius: var(--border-radius-lg);
            font-weight: 500;
            z-index: 1001;
            animation: notificationSlide 3s ease-out forwards;
            box-shadow: var(--shadow-lg);
            font-size: 0.875rem;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    addVisualEffects() {
        // Add missing elements if they don't exist
        if (!this.elements.saveBtn) {
            const saveBtn = document.createElement('button');
            saveBtn.id = 'save';
            saveBtn.className = 'action-btn save';
            saveBtn.innerHTML = '💾 Save';
            saveBtn.addEventListener('click', () => this.saveDrawing());
            document.querySelector('.toolbox').appendChild(saveBtn);
            this.elements.saveBtn = saveBtn;
        }

        if (!this.elements.undoBtn) {
            const undoBtn = document.createElement('button');
            undoBtn.id = 'undo';
            undoBtn.className = 'action-btn undo';
            undoBtn.innerHTML = '↶ Undo';
            undoBtn.addEventListener('click', () => this.undo());
            document.querySelector('.toolbox').appendChild(undoBtn);
            this.elements.undoBtn = undoBtn;
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                0% { transform: translateX(100%); opacity: 0; }
                10%, 90% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            .canvas.drawing {
                cursor: none !important;
            }
            
            .brush-preview {
                mix-blend-mode: difference;
            }
            
            .tool-group {
                animation: toolGroupSlide 0.6s ease-out both;
            }
            
            .tool-group:nth-child(1) { animation-delay: 0.1s; }
            .tool-group:nth-child(2) { animation-delay: 0.2s; }
            .tool-group:nth-child(3) { animation-delay: 0.3s; }
            .tool-group:nth-child(4) { animation-delay: 0.4s; }
            
            @keyframes toolGroupSlide {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});