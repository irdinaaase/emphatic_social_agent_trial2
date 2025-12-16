// js/global.js
class GlobalApp {
    constructor() {
        this.accessibilityPrefs = this.loadAccessibilityPrefs();
        this.currentUser = this.loadCurrentUser();
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.init();
    }
    
    init() {
        // Apply accessibility preferences
        this.applyAccessibilityPrefs();
        
        // Check authentication
        this.checkAuth();
        
        // Set up global event listeners
        this.setupGlobalEvents();
        
        // Initialize global components
        this.initGlobalComponents();
        
        // Set up error handling
        this.setupErrorHandling();
        
        // Initialize page-specific handlers
        this.initPageHandlers();
        
        console.log('Global app initialized');
    }
    
    initPageHandlers() {
        // Check if we're on the login page
        if (document.getElementById('loginForm')) {
            this.initializeLogin();
        }
        
        // Check if we're on the register page
        if (document.getElementById('registerForm')) {
            this.initializeRegister();
        }
        
        // Check if we're on the role selector page
        if (document.querySelector('.role-selection')) {
            this.initializeRoleSelector();
        }
    }
    
    // LOGIN HANDLER
    initializeLogin() {
        const loginForm = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        const togglePassword = document.getElementById('togglePassword');
        const forgotPassword = document.getElementById('forgotPassword');
        const socialButtons = document.querySelectorAll('.social-login button');
        
        if (!loginForm || !loginButton) return;
        
        // Toggle password visibility
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
        
        // Handle form submission
        loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        
        // Handle forgot password
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Password reset feature coming soon!', 'info');
            });
        }
        
        // Handle social login buttons
        socialButtons.forEach(button => {
            button.addEventListener('click', () => {
                const provider = button.id.replace('Login', '').toLowerCase();
                this.showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login integration coming soon!`, 'info');
            });
        });
        
        // Auto-fill demo accounts from URL parameters
        this.checkDemoAccounts();
    }
    
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember')?.checked || false;
        
        // Validate form
        if (!this.validateLoginForm(email, password, emailError, passwordError)) {
            return;
        }
        
        // Disable button and show loading state
        const originalButtonText = loginButton.textContent;
        loginButton.textContent = 'Signing In...';
        loginButton.disabled = true;
        
        // Attempt login
        await this.performLogin(email, password, rememberMe, originalButtonText, emailError, passwordError, loginButton);
    }
    
    validateLoginForm(email, password, emailError, passwordError) {
        let isValid = true;
        
        // Clear previous errors
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        
        // Validate email
        if (!email) {
            if (emailError) emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!this.validateEmail(email)) {
            if (emailError) emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            if (passwordError) passwordError.textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            if (passwordError) passwordError.textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        return isValid;
    }
    
    async performLogin(email, password, rememberMe, originalButtonText, emailError, passwordError, loginButton) {
        try {
            const result = await Auth.login(email, password);
            
            if (result.success) {
                // Show success notification
                this.showNotification('Login successful! Redirecting...', 'success');
                
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                
                // Redirect after short delay
                setTimeout(() => {
                    const userRole = Auth.getUserRole();
                    if (userRole === 'student') {
                        window.location.href = '../html/student/dashboard.html';
                    } else if (userRole === 'teacher') {
                        window.location.href = '../html/teacher/dashboard.html';
                    } else {
                        window.location.href = '../dashboard.html';
                    }
                }, 1500);
                
            } else {
                // Show error notification
                this.showNotification(result.message || 'Login failed. Please check your credentials.', 'error');
                
                // Re-enable button
                loginButton.textContent = originalButtonText;
                loginButton.disabled = false;
                
                // Highlight specific field errors
                const message = result.message?.toLowerCase() || '';
                if (message.includes('email')) {
                    if (emailError) emailError.textContent = result.message;
                } else if (message.includes('password')) {
                    if (passwordError) passwordError.textContent = result.message;
                }
            }
        } catch (error) {
            this.showNotification('An unexpected error occurred. Please try again.', 'error');
            console.error('Login error:', error);
            
            // Re-enable button
            loginButton.textContent = originalButtonText;
            loginButton.disabled = false;
        }
    }
    
    // REGISTRATION HANDLER
    initializeRegister() {
        const registerForm = document.getElementById('registerForm');
        
        if (!registerForm) return;
        
        registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        
        // Add real-time password validation
        const passwordInput = registerForm.querySelector('input[type="password"]');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.validatePasswordStrength(e.target.value);
            });
        }
    }
    
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const registerForm = document.getElementById('registerForm');
        const submitButton = registerForm.querySelector('button[type="submit"]');
        
        // Get form values
        const formData = new FormData(registerForm);
        const userData = {
            email: formData.get('email')?.trim() || '',
            password: formData.get('password') || '',
            confirmPassword: formData.get('confirmPassword') || '',
            name: formData.get('name')?.trim() || '',
            role: formData.get('role') || 'student'
        };
        
        // Validate form
        if (!this.validateRegisterForm(userData)) {
            return;
        }
        
        // Disable button and show loading
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;
        
        try {
            const result = await Auth.register(userData);
            
            if (result.success) {
                this.showNotification('Account created successfully! Redirecting to login...', 'success');
                
                // Redirect to login after delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showNotification(result.message || 'Registration failed. Please try again.', 'error');
                
                // Re-enable button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            this.showNotification('An unexpected error occurred. Please try again.', 'error');
            console.error('Registration error:', error);
            
            // Re-enable button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    validateRegisterForm(userData) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Validate name
        if (!userData.name) {
            this.showFieldError('name', 'Name is required');
            isValid = false;
        }
        
        // Validate email
        if (!userData.email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(userData.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!userData.password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        } else {
            const passwordValidation = Auth.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                const messages = passwordValidation.messages?.join(', ') || 'Password does not meet requirements';
                this.showFieldError('password', messages);
                isValid = false;
            }
        }
        
        // Validate password confirmation
        if (userData.password !== userData.confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate role
        if (!userData.role || !['student', 'teacher'].includes(userData.role)) {
            this.showFieldError('role', 'Please select a valid role');
            isValid = false;
        }
        
        return isValid;
    }
    
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // ROLE SELECTOR HANDLER
    initializeRoleSelector() {
        const roleButtons = document.querySelectorAll('.role-card');
        
        roleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const role = button.dataset.role;
                if (role) {
                    this.selectRole(role);
                }
            });
            
            // Add keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const role = button.dataset.role;
                    if (role) {
                        this.selectRole(role);
                    }
                }
            });
        });
    }
    
    selectRole(role) {
        localStorage.setItem('selectedRole', role);
        
        // Show confirmation
        this.showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} role selected. Redirecting to login...`, 'success');
        
        // Redirect to login with role parameter
        setTimeout(() => {
            window.location.href = `../shared/login.html?role=${role}`;
        }, 1500);
    }
    
    // DEMO ACCOUNTS
    checkDemoAccounts() {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        
        if (role === 'student') {
            this.fillDemoCredentials('student@example.com', 'student123');
            this.showNotification('Student demo credentials loaded', 'info');
        } else if (role === 'teacher') {
            this.fillDemoCredentials('teacher@example.com', 'teacher123');
            this.showNotification('Teacher demo credentials loaded', 'info');
        }
    }
    
    fillDemoCredentials(email, password) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = password;
    }
    
    // UTILITY METHODS
    validateEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    validatePasswordStrength(password) {
        // Real-time password strength indicator
        const strengthIndicator = document.getElementById('password-strength');
        if (!strengthIndicator) return;
        
        let strength = 0;
        let message = '';
        let color = '#dc3545'; // red
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        switch(strength) {
            case 0:
            case 1:
                message = 'Very weak';
                break;
            case 2:
                message = 'Weak';
                color = '#ffc107'; // yellow
                break;
            case 3:
                message = 'Fair';
                color = '#fd7e14'; // orange
                break;
            case 4:
                message = 'Good';
                color = '#28a745'; // green
                break;
            case 5:
                message = 'Strong';
                color = '#20c997'; // teal
                break;
        }
        
        strengthIndicator.textContent = message;
        strengthIndicator.style.color = color;
    }
    
    // NOTIFICATION SYSTEM
    showNotification(message, type = 'info') {
        // Use Utils.showNotification if available
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, type);
            return;
        }
        
        // Fallback to built-in notification
        this.showToast(message, type);
    }
    
    // Rest of the original GlobalApp methods...
    loadAccessibilityPrefs() {
        const saved = localStorage.getItem('accessibilityPrefs');
        const defaults = {
            highContrast: false,
            reducedMotion: false,
            dyslexiaFont: false,
            largeText: false,
            colorBlind: false,
            keyboardNav: false
        };
        
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }
    
    loadCurrentUser() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }
    
    applyAccessibilityPrefs() {
        const body = document.body;
        const prefs = this.accessibilityPrefs;
        
        // Remove all accessibility classes first
        body.classList.remove(
            'high-contrast',
            'reduced-motion', 
            'dyslexia-font',
            'large-text',
            'color-blind',
            'keyboard-nav'
        );
        
        // Apply current preferences
        if (prefs.highContrast) body.classList.add('high-contrast');
        if (prefs.reducedMotion) body.classList.add('reduced-motion');
        if (prefs.dyslexiaFont) body.classList.add('dyslexia-font');
        if (prefs.largeText) body.classList.add('large-text');
        if (prefs.colorBlind) body.classList.add('color-blind');
        if (prefs.keyboardNav) body.classList.add('keyboard-nav');
    }
    
    checkAuth() {
        const publicPages = [
            'index.html',
            'role-selector.html',
            'login.html',
            'register.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        const isPublicPage = publicPages.includes(currentPage);
        
        if (!this.isLoggedIn && !isPublicPage) {
            this.redirectToLogin();
        }
    }
    
    redirectToLogin() {
        const role = localStorage.getItem('selectedRole') || 'student';
        window.location.href = `../../shared/login.html?role=${role}`;
    }
    
    setupGlobalEvents() {
        // Global click handler for data-action elements
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action || 
                          e.target.closest('[data-action]')?.dataset.action;
            
            if (action) {
                this.handleGlobalAction(action, e.target);
            }
            
            // Toggle accessibility panel
            if (e.target.closest('[data-toggle="accessibility"]')) {
                this.toggleAccessibilityPanel();
            }
            
            // Logout
            if (e.target.closest('[data-action="logout"]')) {
                this.logout();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + A for accessibility panel
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAccessibilityPanel();
            }
            
            // Alt + T for theme toggle
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Escape to close modals and panels
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeAccessibilityPanel();
            }
        });
        
        // Save user preferences before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAccessibilityPrefs();
        });
    }
    
    handleGlobalAction(action, element) {
        switch(action) {
            case 'toggle-theme':
                this.toggleTheme();
                break;
            case 'increase-font':
                this.adjustFontSize('increase');
                break;
            case 'decrease-font':
                this.adjustFontSize('decrease');
                break;
            case 'save-progress':
                this.saveProgress();
                break;
            case 'print-page':
                window.print();
                break;
            case 'close-modal':
                this.closeModal(element.closest('.modal'));
                break;
            case 'show-help':
                this.showHelp();
                break;
        }
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }
    
    adjustFontSize(direction) {
        const html = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(html).fontSize);
        const step = 2;
        const newSize = direction === 'increase' ? currentSize + step : currentSize - step;
        
        // Limit font size between 12px and 24px
        if (newSize >= 12 && newSize <= 24) {
            html.style.fontSize = `${newSize}px`;
            localStorage.setItem('fontSize', newSize);
            this.showToast(`Font size ${direction}d to ${newSize}px`, 'info');
        }
    }
    
    toggleAccessibilityPanel() {
        let panel = document.getElementById('accessibility-panel');
        
        if (!panel) {
            panel = this.createAccessibilityPanel();
        }
        
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            // Focus first element when opening
            setTimeout(() => {
                panel.querySelector('input, button')?.focus();
            }, 100);
        }
    }
    
    closeAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
    
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Accessibility Settings');
        
        panel.innerHTML = `
            <div class="accessibility-header">
                <h3>Accessibility Settings</h3>
                <button class="btn-icon" data-action="close-panel" aria-label="Close accessibility panel">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="accessibility-options">
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="high-contrast-toggle" 
                               ${this.accessibilityPrefs.highContrast ? 'checked' : ''}>
                        High Contrast Mode
                    </label>
                    <span class="option-description">Increase contrast for better visibility</span>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="dyslexia-toggle" 
                               ${this.accessibilityPrefs.dyslexiaFont ? 'checked' : ''}>
                        Dyslexia-friendly Font
                    </label>
                    <span class="option-description">Use OpenDyslexic font</span>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="reduced-motion-toggle" 
                               ${this.accessibilityPrefs.reducedMotion ? 'checked' : ''}>
                        Reduced Motion
                    </label>
                    <span class="option-description">Reduce animations and transitions</span>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="large-text-toggle" 
                               ${this.accessibilityPrefs.largeText ? 'checked' : ''}>
                        Large Text
                    </label>
                    <span class="option-description">Increase text size</span>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="color-blind-toggle" 
                               ${this.accessibilityPrefs.colorBlind ? 'checked' : ''}>
                        Color Blind Mode
                    </label>
                    <span class="option-description">Use color blind friendly palette</span>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="keyboard-nav-toggle" 
                               ${this.accessibilityPrefs.keyboardNav ? 'checked' : ''}>
                        Enhanced Keyboard Navigation
                    </label>
                    <span class="option-description">Highlight focus for keyboard users</span>
                </div>
            </div>
            <div class="accessibility-actions">
                <button class="btn btn-sm btn-secondary" data-action="reset-accessibility">
                    Reset to Defaults
                </button>
                <button class="btn btn-sm btn-primary" data-action="apply-accessibility">
                    Apply Changes
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add event listeners
        panel.querySelector('[data-action="close-panel"]').addEventListener('click', () => {
            this.closeAccessibilityPanel();
        });
        
        panel.querySelector('[data-action="apply-accessibility"]').addEventListener('click', () => {
            this.updateAccessibilityPrefs();
        });
        
        panel.querySelector('[data-action="reset-accessibility"]').addEventListener('click', () => {
            this.resetAccessibilityPrefs();
        });
        
        // Close when clicking outside
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.closeAccessibilityPanel();
            }
        });
        
        return panel;
    }
    
    updateAccessibilityPrefs() {
        const prefs = {
            highContrast: document.getElementById('high-contrast-toggle').checked,
            dyslexiaFont: document.getElementById('dyslexia-toggle').checked,
            reducedMotion: document.getElementById('reduced-motion-toggle').checked,
            largeText: document.getElementById('large-text-toggle').checked,
            colorBlind: document.getElementById('color-blind-toggle').checked,
            keyboardNav: document.getElementById('keyboard-nav-toggle').checked
        };
        
        this.accessibilityPrefs = prefs;
        localStorage.setItem('accessibilityPrefs', JSON.stringify(prefs));
        this.applyAccessibilityPrefs();
        
        this.showToast('Accessibility settings applied', 'success');
        this.closeAccessibilityPanel();
    }
    
    resetAccessibilityPrefs() {
        const defaults = {
            highContrast: false,
            dyslexiaFont: false,
            reducedMotion: false,
            largeText: false,
            colorBlind: false,
            keyboardNav: false
        };
        
        this.accessibilityPrefs = defaults;
        localStorage.setItem('accessibilityPrefs', JSON.stringify(defaults));
        this.applyAccessibilityPrefs();
        
        // Reset checkboxes
        document.getElementById('high-contrast-toggle').checked = false;
        document.getElementById('dyslexia-toggle').checked = false;
        document.getElementById('reduced-motion-toggle').checked = false;
        document.getElementById('large-text-toggle').checked = false;
        document.getElementById('color-blind-toggle').checked = false;
        document.getElementById('keyboard-nav-toggle').checked = false;
        
        this.showToast('Accessibility settings reset to defaults', 'info');
    }
    
    saveAccessibilityPrefs() {
        localStorage.setItem('accessibilityPrefs', JSON.stringify(this.accessibilityPrefs));
    }
    
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.global-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `global-toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <span aria-hidden="true">×</span>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Add close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    showHelp() {
        // Create help modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Help & Support</h3>
                    <button class="btn-icon" data-action="close-modal" aria-label="Close help">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h4>Keyboard Shortcuts</h4>
                    <ul>
                        <li><strong>Alt + A:</strong> Toggle accessibility panel</li>
                        <li><strong>Alt + T:</strong> Toggle theme</li>
                        <li><strong>Escape:</strong> Close modals/panels</li>
                        <li><strong>Ctrl + S:</strong> Save progress</li>
                    </ul>
                    <h4>Getting Started</h4>
                    <p>Select your role (Student or Teacher) to begin using the system.</p>
                    <h4>Need More Help?</h4>
                    <p>Contact support at: support@empathiclearning.org</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    logout() {
        // Clear user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        
        // Keep role selection for next login
        const role = localStorage.getItem('selectedRole');
        
        // Clear all except role
        const keysToKeep = ['selectedRole', 'accessibilityPrefs', 'theme', 'fontSize'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Redirect to role selector with saved role
        window.location.href = role ? `role-selector.html?role=${role}` : 'index.html';
    }
    
    saveProgress() {
        // Mock save progress
        this.showToast('Progress saved successfully', 'success');
    }
    
    initGlobalComponents() {
        // Add skip to content link
        this.addSkipToContentLink();
        
        // Add accessibility toggle button to all pages
        this.addAccessibilityToggle();
    }
    
    addSkipToContentLink() {
        if (!document.getElementById('skip-to-content')) {
            const skipLink = document.createElement('a');
            skipLink.id = 'skip-to-content';
            skipLink.href = '#main-content';
            skipLink.className = 'skip-to-content';
            skipLink.textContent = 'Skip to main content';
            document.body.prepend(skipLink);
        }
    }
    
    addAccessibilityToggle() {
        // Only add if not already present
        if (!document.querySelector('.global-accessibility-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'global-accessibility-toggle btn-icon';
            toggle.setAttribute('data-toggle', 'accessibility');
            toggle.setAttribute('aria-label', 'Open accessibility settings');
            toggle.innerHTML = '♿';
            toggle.style.position = 'fixed';
            toggle.style.bottom = '20px';
            toggle.style.right = '20px';
            toggle.style.zIndex = '1000';
            document.body.appendChild(toggle);
        }
    }
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showToast('An unexpected error occurred. Please try again.', 'error');
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showToast('An error occurred while processing your request.', 'error');
        });
    }
    
    // Utility method to get user role
    getUserRole() {
        return this.currentUser?.role || localStorage.getItem('selectedRole') || 'student';
    }
    
    // Utility method to check if user is student
    isStudent() {
        return this.getUserRole() === 'student';
    }
    
    // Utility method to check if user is teacher
    isTeacher() {
        return this.getUserRole() === 'teacher';
    }
}

// Initialize global app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Check for saved font size
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
    
    // Initialize app
    window.app = new GlobalApp();
});

// Make app available globally
window.GlobalApp = GlobalApp;