// Enhanced New Year Timer with Modern JavaScript
class CountdownTimer {
    constructor() {
        this.DEBUG = false; // Set to true for debugging
        this.elements = {};
        this.intervalId = null;
        this.nextNewYear = null;
        this.prevValues = { days: null, hours: null, mins: null, seconds: null };
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.validateElements();
        this.calculateNextNewYear();
        this.updateYearDisplay();
        this.startCountdown();
        this.setupEventListeners();
        this.addVisualEffects();
    }

    cacheElements() {
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            mins: document.getElementById('mins'),
            seconds: document.getElementById('seconds'),
            yearDisplay: document.getElementById('year-display')
        };
    }

    validateElements() {
        const requiredElements = ['days', 'hours', 'mins', 'seconds'];
        const missingElements = requiredElements.filter(id => !this.elements[id]);
        
        if (missingElements.length > 0) {
            console.error(`Missing countdown elements: ${missingElements.join(', ')}`);
            return false;
        }
        
        if (this.DEBUG) {
            console.log("All elements found:", this.elements);
        }
        
        return true;
    }

    calculateNextNewYear() {
        const now = new Date();
        this.nextNewYear = new Date(now.getFullYear() + 1, 0, 1);
        
        if (this.DEBUG) {
            console.log("Counting down to:", this.nextNewYear.toLocaleString());
        }
    }

    updateYearDisplay() {
        if (this.elements.yearDisplay) {
            this.elements.yearDisplay.textContent = this.nextNewYear.getFullYear();
            this.animateElement(this.elements.yearDisplay);
        }
    }

    startCountdown() {
        this.updateCountdown(); // Initial update
        this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        
        // Check if countdown has passed
        if (now >= this.nextNewYear) {
            this.calculateNextNewYear();
            this.updateYearDisplay();
        }
        
        const diff = this.nextNewYear - now;
        
        if (diff <= 0) {
            this.displayZeros();
            this.triggerCelebration();
            return;
        }
        
        const timeUnits = this.calculateTimeUnits(diff);
        this.updateDisplay(timeUnits);
    }

    calculateTimeUnits(diff) {
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    }

    updateDisplay(timeUnits) {
        const hasChanged = Object.keys(timeUnits).some(
            key => this.prevValues[key] !== timeUnits[key]
        );

        if (hasChanged) {
            Object.keys(timeUnits).forEach(key => {
                if (this.elements[key]) {
                    const formattedValue = this.formatNumber(timeUnits[key]);
                    
                    if (this.prevValues[key] !== timeUnits[key]) {
                        this.animateValueChange(this.elements[key], formattedValue);
                    }
                }
            });

            this.prevValues = { ...timeUnits };

            if (this.DEBUG) {
                console.log(`Countdown: ${Object.values(timeUnits).map(v => this.formatNumber(v)).join(':')}`);
            }
        }
    }

    displayZeros() {
        Object.keys(this.elements).forEach(key => {
            if (key !== 'yearDisplay' && this.elements[key]) {
                this.elements[key].textContent = '00';
            }
        });
    }

    formatNumber(num) {
        return num < 10 ? `0${num}` : num.toString();
    }

    animateValueChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 100);
    }

    animateElement(element) {
        element.style.animation = 'pulse 0.6s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    triggerCelebration() {
        // Add celebration effects when countdown reaches zero
        document.body.style.animation = 'celebration 2s ease-out';
        
        // Create confetti effect
        this.createConfetti();
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    animation: confettiFall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }

    addVisualEffects() {
        // Add CSS animations dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
            
            @keyframes celebration {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .countdown-el {
                animation: fadeInUp 0.8s ease-out both;
            }
            
            .countdown-el:nth-child(1) { animation-delay: 0.1s; }
            .countdown-el:nth-child(2) { animation-delay: 0.2s; }
            .countdown-el:nth-child(3) { animation-delay: 0.3s; }
            .countdown-el:nth-child(4) { animation-delay: 0.4s; }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Handle visibility change to pause/resume timer
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.reset();
            }
        });
    }

    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resume() {
        if (!this.intervalId) {
            this.startCountdown();
        }
    }

    reset() {
        this.pause();
        this.calculateNextNewYear();
        this.updateYearDisplay();
        this.startCountdown();
    }

    cleanup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Enhanced page loading and initialization
class PageEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.addLoadingAnimation();
        this.setupAccessibility();
        this.addPerformanceOptimizations();
    }

    addLoadingAnimation() {
        // Add staggered animations to countdown elements
        const countdownElements = document.querySelectorAll('.countdown-el');
        countdownElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease-out';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    }

    setupAccessibility() {
        // Add ARIA labels for screen readers
        const elements = {
            days: 'Days remaining',
            hours: 'Hours remaining', 
            mins: 'Minutes remaining',
            seconds: 'Seconds remaining'
        };

        Object.entries(elements).forEach(([id, label]) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('aria-label', label);
                element.setAttribute('role', 'timer');
            }
        });

        // Add live region for countdown updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.id = 'countdown-live-region';
        document.body.appendChild(liveRegion);
    }

    addPerformanceOptimizations() {
        // Preload background image
        const img = new Image();
        img.src = './sunrise.jpg';
        
        // Add intersection observer for animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            });

            document.querySelectorAll('.countdown-el').forEach(el => {
                observer.observe(el);
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
    new PageEnhancer();
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - timer paused');
    } else {
        console.log('Page visible - timer resumed');
    }
});