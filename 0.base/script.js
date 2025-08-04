// Modern Vanilla JavaScript for Enhanced UX
class ProjectsApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupMobileNavigation();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
        this.preloadImages();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const burgerMenu = document.querySelector('.burger-menu');
        const mobNav = document.querySelector('.mob-nav');
        
        if (burgerMenu && mobNav) {
            burgerMenu.addEventListener('click', () => {
                mobNav.classList.toggle('active');
                this.toggleAriaExpanded(burgerMenu);
            });

            // Close mobile nav when clicking outside
            document.addEventListener('click', (e) => {
                if (!burgerMenu.contains(e.target) && !mobNav.contains(e.target)) {
                    mobNav.classList.remove('active');
                    burgerMenu.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add loading states for external links
        document.querySelectorAll('a[href^="./"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.showLoadingState(link);
            });
        });
    }

    setupIntersectionObserver() {
        // Animate cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('fade-in-up');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.col').forEach(card => {
            card.style.opacity = '0';
            observer.observe(card);
        });
    }

    setupMobileNavigation() {
        // Enhanced mobile navigation with touch gestures
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture();
        });
    }

    handleSwipeGesture() {
        const swipeThreshold = 50;
        const mobNav = document.querySelector('.mob-nav');
        
        if (touchStartY - touchEndY > swipeThreshold) {
            // Swipe up - close mobile nav
            mobNav?.classList.remove('active');
        }
    }

    setupScrollEffects() {
        let lastScrollTop = 0;
        const header = document.querySelector('header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide/show header on scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            // Add shadow to header when scrolled
            if (scrollTop > 10) {
                header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const mobNav = document.querySelector('.mob-nav');
                const burgerMenu = document.querySelector('.burger-menu');
                
                if (mobNav?.classList.contains('active')) {
                    mobNav.classList.remove('active');
                    burgerMenu?.setAttribute('aria-expanded', 'false');
                    burgerMenu?.focus();
                }
            }
        });

        // Focus management for mobile nav
        const mobNavLinks = document.querySelectorAll('.mob-nav a');
        mobNavLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = mobNavLinks[index + 1] || mobNavLinks[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = mobNavLinks[index - 1] || mobNavLinks[mobNavLinks.length - 1];
                    prevLink.focus();
                }
            });
        });
    }

    preloadImages() {
        // Preload images for better performance
        const imageUrls = [];
        document.querySelectorAll('.col img').forEach(img => {
            imageUrls.push(img.src);
        });

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    showLoadingState(element) {
        element.classList.add('loading');
        
        // Remove loading state after navigation
        setTimeout(() => {
            element.classList.remove('loading');
        }, 1000);
    }

    toggleAriaExpanded(element) {
        const expanded = element.getAttribute('aria-expanded') === 'true';
        element.setAttribute('aria-expanded', !expanded);
    }
}

// Enhanced card interactions
class CardEnhancer {
    constructor() {
        this.setupCardEffects();
    }

    setupCardEffects() {
        document.querySelectorAll('.col').forEach(card => {
            this.addCardInteractions(card);
        });
    }

    addCardInteractions(card) {
        let isHovered = false;
        
        card.addEventListener('mouseenter', () => {
            isHovered = true;
            this.addParallaxEffect(card);
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            this.removeParallaxEffect(card);
        });

        card.addEventListener('mousemove', (e) => {
            if (isHovered) {
                this.updateParallax(card, e);
            }
        });

        // Add click ripple effect
        card.addEventListener('click', (e) => {
            this.createRippleEffect(card, e);
        });
    }

    addParallaxEffect(card) {
        card.style.transition = 'none';
    }

    removeParallaxEffect(card) {
        card.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform = 'translateY(-8px) rotateX(0deg) rotateY(0deg)';
    }

    updateParallax(card, e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    createRippleEffect(card, e) {
        const ripple = document.createElement('span');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(99, 102, 241, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.setupPerformanceObserver();
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsApp();
    new CardEnhancer();
    new PerformanceMonitor();
    
    // Add CSS animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Service Worker registration for better performance
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}