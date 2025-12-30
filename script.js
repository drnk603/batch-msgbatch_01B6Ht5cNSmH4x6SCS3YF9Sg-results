(function() {
    'use strict';

    window.__app = window.__app || {};

    const VALIDATORS = {
        name: {
            pattern: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
            message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben)'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        },
        phone: {
            pattern: /^[\d\s+\-()]{10,20}$/,
            message: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)'
        },
        message: {
            minLength: 10,
            message: 'Die Nachricht muss mindestens 10 Zeichen lang sein'
        }
    };

    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => { inThrottle = false; }, limit);
            }
        };
    }

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    class BurgerMenu {
        constructor() {
            this.header = document.querySelector('header');
            this.toggler = document.querySelector('.navbar-toggler');
            this.collapse = document.querySelector('.navbar-collapse');
            this.body = document.body;
            this.isOpen = false;
            
            if (this.toggler && this.collapse) {
                this.init();
            }
        }

        init() {
            this.toggler.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isOpen) this.close();
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.header.contains(e.target)) {
                    this.close();
                }
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 768 && this.isOpen) {
                    this.close();
                }
            }, 250));
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.collapse.classList.add('show');
            this.toggler.setAttribute('aria-expanded', 'true');
            this.body.classList.add('u-no-scroll');
            
            const menuHeight = Math.min(
                this.collapse.scrollHeight,
                window.innerHeight - this.header.offsetHeight - 20
            );
            this.collapse.style.maxHeight = `${menuHeight}px`;
        }

        close() {
            this.isOpen = false;
            this.collapse.classList.remove('show');
            this.toggler.setAttribute('aria-expanded', 'false');
            this.body.classList.remove('u-no-scroll');
            this.collapse.style.maxHeight = '0';
        }
    }

    class ScrollEffects {
        constructor() {
            this.observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            this.init();
        }

        init() {
            this.animateOnScroll();
            this.initScrollSpy();
            this.initCountUp();
        }

        animateOnScroll() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, this.observerOptions);

            document.querySelectorAll('.card, .btn, h1, h2, h3, p, img').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                observer.observe(el);
            });
        }

        initScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');

            if (sections.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            link.removeAttribute('aria-current');
                            
                            if (link.getAttribute('href') === `#${id}` || 
                                link.getAttribute('href') === `/#${id}`) {
                                link.classList.add('active');
                                link.setAttribute('aria-current', 'page');
                            }
                        });
                    }
                });
            }, {
                rootMargin: '-100px 0px -66%'
            });

            sections.forEach(section => observer.observe(section));
        }

        initCountUp() {
            const counters = document.querySelectorAll('[data-count]');
            
            counters.forEach(counter => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !counter.dataset.counted) {
                            counter.dataset.counted = 'true';
                            this.animateCount(counter);
                            observer.unobserve(counter);
                        }
                    });
                }, this.observerOptions);

                observer.observe(counter);
            });
        }

        animateCount(element) {
            const target = parseInt(element.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"], a[href^="/#"]');
                if (!link) return;

                let href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetId = href.replace(/^\/?#/, '');
                const target = document.getElementById(targetId);

                if (target) {
                    e.preventDefault();
                    const header = document.querySelector('header');
                    const offset = header ? header.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    class FormValidator {
        constructor(form) {
            this.form = form;
            this.submitButton = form.querySelector('[type="submit"]');
            this.originalButtonText = this.submitButton ? this.submitButton.textContent : '';
            this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            this.form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => {
                    if (field.classList.contains('is-invalid')) {
                        this.validateField(field);
                    }
                });
            });
        }

        validateField(field) {
            this.clearError(field);

            if (field.hasAttribute('required') && !field.value.trim()) {
                this.showError(field, 'Dieses Feld ist erforderlich');
                return false;
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                this.showError(field, 'Bitte akzeptieren Sie die Datenschutzerklärung');
                return false;
            }

            if (field.id === 'firstName' || field.id === 'lastName') {
                if (!VALIDATORS.name.pattern.test(field.value)) {
                    this.showError(field, VALIDATORS.name.message);
                    return false;
                }
            }

            if (field.type === 'email') {
                if (!VALIDATORS.email.pattern.test(field.value)) {
                    this.showError(field, VALIDATORS.email.message);
                    return false;
                }
            }

            if (field.type === 'tel' && field.value.trim()) {
                if (!VALIDATORS.phone.pattern.test(field.value)) {
                    this.showError(field, VALIDATORS.phone.message);
                    return false;
                }
            }

            if (field.id === 'message' && field.value.trim()) {
                if (field.value.trim().length < VALIDATORS.message.minLength) {
                    this.showError(field, VALIDATORS.message.message);
                    return false;
                }
            }

            return true;
        }

        showError(field, message) {
            field.classList.add('is-invalid');
            
            let errorElement = field.parentElement.querySelector('.invalid-feedback');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback';
                field.parentElement.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        clearError(field) {
            field.classList.remove('is-invalid');
            const errorElement = field.parentElement.querySelector('.invalid-feedback');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }

        validateForm() {
            let isValid = true;
            const fields = this.form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        handleSubmit(e) {
            e.preventDefault();

            if (!this.validateForm()) {
                this.showNotification('Bitte überprüfen Sie Ihre Eingaben', 'error');
                return;
            }

            this.disableSubmit();

            const formData = new FormData(this.form);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = sanitizeInput(value);
            });

            setTimeout(() => {
                window.location.href = 'thank_you.html';
            }, 1000);
        }

        disableSubmit() {
            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
            }
        }

        enableSubmit() {
            if (this.submitButton) {
                this.submitButton.disabled = false;
                this.submitButton.textContent = this.originalButtonText;
            }
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show`;
            notification.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:400px;box-shadow:var(--shadow-lg);';
            notification.innerHTML = `${message}<button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    class MicroInteractions {
        constructor() {
            this.init();
        }

        init() {
            this.rippleEffect();
            this.hoverEffects();
        }

        rippleEffect() {
            document.querySelectorAll('.btn, .c-button, .card').forEach(element => {
                element.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        left: ${x}px;
                        top: ${y}px;
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    `;

                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });

            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        hoverEffects() {
            document.querySelectorAll('.btn, .c-button, .nav-link, .card').forEach(element => {
                element.addEventListener('mouseenter', function() {
                    this.style.transition = 'all 0.3s ease-out';
                    
                    if (this.classList.contains('card')) {
                        this.style.transform = 'translateY(-8px) scale(1.02)';
                        this.style.boxShadow = 'var(--shadow-xl)';
                    } else {
                        this.style.transform = 'translateY(-2px)';
                    }
                });

                element.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    if (this.classList.contains('card')) {
                        this.style.boxShadow = '';
                    }
                });
            });
        }
    }

    class LazyLoadOptimizer {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('img:not([loading])').forEach(img => {
                if (!img.classList.contains('c-logo__img')) {
                    img.setAttribute('loading', 'lazy');
                }
            });

            document.querySelectorAll('video:not([loading])').forEach(video => {
                video.setAttribute('loading', 'lazy');
            });

            document.querySelectorAll('img').forEach(img => {
                img.addEventListener('error', function() {
                    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236c757d"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
                });
            });
        }
    }

    class PrivacyModal {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('a[href*="privacy"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (window.location.pathname !== '/privacy.html') {
                        const isExternal = link.hostname !== window.location.hostname;
                        if (!isExternal && !e.ctrlKey && !e.metaKey) {
                            return;
                        }
                    }
                });
            });
        }
    }

    function initApp() {
        if (window.__app.initialized) return;
        window.__app.initialized = true;

        new BurgerMenu();
        new ScrollEffects();
        new SmoothScroll();
        new MicroInteractions();
        new LazyLoadOptimizer();
        new PrivacyModal();

        document.querySelectorAll('form').forEach(form => {
            new FormValidator(form);
        });

        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            const currentPath = window.location.pathname;
            
            if (href === currentPath || 
                (currentPath === '/' && href === '/index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();