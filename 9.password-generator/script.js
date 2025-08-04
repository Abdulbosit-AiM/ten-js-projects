// Enhanced Password Generator Application with Modern JavaScript
class PasswordGeneratorApp {
    constructor() {
        this.elements = {};
        this.history = this.loadHistory();
        this.currentPassword = '';
        
        // Character sets
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
        this.renderHistory();
        this.generatePassword(); // Generate initial password
    }

    cacheElements() {
        this.elements = {
            pwEl: document.getElementById('pw'),
            copyEl: document.getElementById('copy'),
            lenEl: document.getElementById('len'),
            upperEl: document.getElementById('upper'),
            lowerEl: document.getElementById('lower'),
            numberEl: document.getElementById('number'),
            symbolEl: document.getElementById('symbol'),
            generateEl: document.getElementById('generate')
        };
    }

    setupEventListeners() {
        this.elements.generateEl.addEventListener('click', () => this.generatePassword());
        this.elements.copyEl.addEventListener('click', () => this.copyPassword());
        
        // Real-time generation on settings change
        [this.elements.lenEl, this.elements.upperEl, this.elements.lowerEl, 
         this.elements.numberEl, this.elements.symbolEl].forEach(el => {
            el.addEventListener('change', () => {
                this.generatePassword();
                this.updateStrengthMeter();
            });
        });

        // Length input validation
        this.elements.lenEl.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 4) e.target.value = 4;
            if (value > 128) e.target.value = 128;
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + G to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                this.generatePassword();
            }
            
            // Ctrl/Cmd + C to copy (when password is focused)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === this.elements.pwEl) {
                e.preventDefault();
                this.copyPassword();
            }
            
            // Space to generate new password
            if (e.key === ' ' && !e.target.matches('input')) {
                e.preventDefault();
                this.generatePassword();
            }
            
            // Number keys to toggle options
            if (e.key >= '1' && e.key <= '4' && !e.target.matches('input')) {
                e.preventDefault();
                const checkboxes = [this.elements.upperEl, this.elements.lowerEl, 
                                  this.elements.numberEl, this.elements.symbolEl];
                const index = parseInt(e.key) - 1;
                if (checkboxes[index]) {
                    checkboxes[index].checked = !checkboxes[index].checked;
                    this.generatePassword();
                }
            }
        });
    }

    generatePassword() {
        const length = parseInt(this.elements.lenEl.value);
        const includeUpper = this.elements.upperEl.checked;
        const includeLower = this.elements.lowerEl.checked;
        const includeNumbers = this.elements.numberEl.checked;
        const includeSymbols = this.elements.symbolEl.checked;

        // Validate that at least one character type is selected
        if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
            this.showNotification('Please select at least one character type!', 'warning');
            this.elements.lowerEl.checked = true;
            return;
        }

        let charset = '';
        let guaranteedChars = [];

        // Build character set and ensure at least one character from each selected type
        if (includeUpper) {
            charset += this.charSets.uppercase;
            guaranteedChars.push(this.getRandomChar(this.charSets.uppercase));
        }
        if (includeLower) {
            charset += this.charSets.lowercase;
            guaranteedChars.push(this.getRandomChar(this.charSets.lowercase));
        }
        if (includeNumbers) {
            charset += this.charSets.numbers;
            guaranteedChars.push(this.getRandomChar(this.charSets.numbers));
        }
        if (includeSymbols) {
            charset += this.charSets.symbols;
            guaranteedChars.push(this.getRandomChar(this.charSets.symbols));
        }

        // Generate password
        let password = '';
        
        // Add guaranteed characters first
        guaranteedChars.forEach(char => {
            password += char;
        });

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(charset);
        }

        // Shuffle the password to avoid predictable patterns
        password = this.shuffleString(password);

        this.currentPassword = password;
        this.displayPassword(password);
        this.updateStrengthMeter();
        this.addToHistory(password);
        this.animateGeneration();
    }

    getRandomChar(charset) {
        const crypto = window.crypto || window.msCrypto;
        if (crypto && crypto.getRandomValues) {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return charset[array[0] % charset.length];
        } else {
            // Fallback for older browsers
            return charset[Math.floor(Math.random() * charset.length)];
        }
    }

    shuffleString(str) {
        const array = str.split('');
        const crypto = window.crypto || window.msCrypto;
        
        for (let i = array.length - 1; i > 0; i--) {
            let j;
            if (crypto && crypto.getRandomValues) {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                j = randomArray[0] % (i + 1);
            } else {
                j = Math.floor(Math.random() * (i + 1));
            }
            [array[i], array[j]] = [array[j], array[i]];
        }
        
        return array.join('');
    }

    displayPassword(password) {
        this.elements.pwEl.textContent = password;
        this.elements.pwEl.classList.remove('placeholder');
        
        // Make password selectable
        this.elements.pwEl.setAttribute('tabindex', '0');
        this.elements.pwEl.style.cursor = 'text';
    }

    async copyPassword() {
        if (!this.currentPassword) {
            this.showNotification('No password to copy!', 'warning');
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.currentPassword);
            } else {
                // Fallback for older browsers or non-HTTPS
                const textArea = document.createElement('textarea');
                textArea.value = this.currentPassword;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            this.showNotification('Password copied to clipboard!', 'success');
            this.animateCopyButton();
        } catch (err) {
            console.error('Failed to copy password:', err);
            this.showNotification('Failed to copy password', 'error');
        }
    }

    calculateStrength(password) {
        let score = 0;
        let feedback = [];

        // Length scoring
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else if (password.length >= 6) score += 10;
        else feedback.push('Use at least 8 characters');

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 15;
        else feedback.push('Add lowercase letters');
        
        if (/[A-Z]/.test(password)) score += 15;
        else feedback.push('Add uppercase letters');
        
        if (/[0-9]/.test(password)) score += 15;
        else feedback.push('Add numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        else feedback.push('Add symbols');

        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) {
            score -= 10;
            feedback.push('Avoid repeated characters');
        }
        
        if (/123|abc|qwe/i.test(password)) {
            score -= 15;
            feedback.push('Avoid common sequences');
        }

        // Bonus for length
        if (password.length >= 16) score += 10;

        score = Math.max(0, Math.min(100, score));

        let level, color, text;
        if (score >= 80) {
            level = 'very-strong';
            color = 'var(--success-color)';
            text = 'Very Strong';
        } else if (score >= 60) {
            level = 'strong';
            color = 'var(--secondary-color)';
            text = 'Strong';
        } else if (score >= 40) {
            level = 'medium';
            color = 'var(--warning-color)';
            text = 'Medium';
        } else if (score >= 20) {
            level = 'weak';
            color = 'var(--accent-color)';
            text = 'Weak';
        } else {
            level = 'very-weak';
            color = 'var(--error-color)';
            text = 'Very Weak';
        }

        return { score, level, color, text, feedback };
    }

    updateStrengthMeter() {
        if (!this.currentPassword) return;

        let strengthMeter = document.querySelector('.strength-meter');
        if (!strengthMeter) {
            strengthMeter = this.createStrengthMeter();
        }

        const strength = this.calculateStrength(this.currentPassword);
        const fill = strengthMeter.querySelector('.strength-fill');
        const text = strengthMeter.querySelector('.strength-text');

        fill.style.width = `${strength.score}%`;
        fill.style.background = `linear-gradient(90deg, ${strength.color}, ${strength.color}dd)`;
        text.textContent = strength.text;
        text.style.color = strength.color;
    }

    createStrengthMeter() {
        const meter = document.createElement('div');
        meter.className = 'strength-meter';
        meter.innerHTML = `
            <div class="strength-label">Password Strength</div>
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">-</div>
        `;
        
        this.elements.generateEl.parentNode.insertBefore(meter, this.elements.generateEl);
        return meter;
    }

    addToHistory(password) {
        const timestamp = new Date().toLocaleString();
        const historyItem = { password, timestamp, strength: this.calculateStrength(password) };
        
        this.history.unshift(historyItem);
        
        // Keep only last 10 passwords
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        let historyContainer = document.querySelector('.password-history');
        if (!historyContainer) {
            historyContainer = this.createHistoryContainer();
        }

        const historyList = historyContainer.querySelector('.history-list');
        historyList.innerHTML = '';

        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: var(--spacing-4);">No passwords generated yet</div>';
            return;
        }

        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-1);">
                    <span style="font-size: 0.625rem; color: rgba(255, 255, 255, 0.6);">${item.timestamp}</span>
                    <span style="font-size: 0.625rem; color: ${item.strength.color};">${item.strength.text}</span>
                </div>
                <div style="word-break: break-all;">${item.password}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.currentPassword = item.password;
                this.displayPassword(item.password);
                this.updateStrengthMeter();
                this.copyPassword();
            });
            
            historyList.appendChild(historyItem);
        });
    }

    createHistoryContainer() {
        const container = document.createElement('div');
        container.className = 'password-history';
        container.innerHTML = `
            <div class="history-title">Recent Passwords</div>
            <div class="history-list"></div>
        `;
        
        document.querySelector('.pw-body').appendChild(container);
        return container;
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('passwordHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading password history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('passwordHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving password history:', error);
        }
    }

    animateGeneration() {
        this.elements.pwEl.classList.add('generating');
        this.elements.generateEl.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.elements.pwEl.classList.remove('generating');
            this.elements.generateEl.style.transform = 'scale(1)';
        }, 500);
    }

    animateCopyButton() {
        this.elements.copyEl.style.transform = 'scale(1.1)';
        this.elements.copyEl.style.background = 'linear-gradient(135deg, var(--success-color) 0%, var(--secondary-color) 100%)';
        
        setTimeout(() => {
            this.elements.copyEl.style.transform = 'scale(1)';
            this.elements.copyEl.style.background = '';
        }, 200);
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
        // Add app header
        const header = document.createElement('div');
        header.className = 'app-header';
        header.innerHTML = `
            <h1 class="app-title">🔐 Password Generator</h1>
            <p class="app-subtitle">Create secure passwords with customizable options</p>
        `;
        document.body.insertBefore(header, document.body.firstChild);

        // Update password display
        this.elements.pwEl.innerHTML = '<span class="pw-display placeholder">Click Generate to create a password</span>';
        
        // Add copy button if it doesn't exist
        if (!this.elements.copyEl) {
            const copyBtn = document.createElement('button');
            copyBtn.id = 'copy';
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            this.elements.pwEl.appendChild(copyBtn);
            this.elements.copyEl = copyBtn;
            copyBtn.addEventListener('click', () => this.copyPassword());
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                0% { transform: translateX(100%); opacity: 0; }
                10%, 90% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            .form-control {
                animation: formControlSlide 0.6s ease-out both;
            }
            
            .form-control:nth-child(1) { animation-delay: 0.1s; }
            .form-control:nth-child(2) { animation-delay: 0.2s; }
            .form-control:nth-child(3) { animation-delay: 0.3s; }
            .form-control:nth-child(4) { animation-delay: 0.4s; }
            .form-control:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes formControlSlide {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .history-item {
                animation: historyItemSlide 0.3s ease-out both;
            }
            
            @keyframes historyItemSlide {
                from {
                    opacity: 0;
                    transform: translateY(10px);
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
    new PasswordGeneratorApp();
});