// Add this to the existing components.js

// Login Form Handler
class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        this.setupPasswordToggle();
        this.setupFormSubmission();
        this.setupForgotPassword();
        this.setupSocialLogin();
        
        // Auto-focus email field
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
    }
    
    setupPasswordToggle() {
        const toggleBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
            });
        }
    }
    
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset errors
            this.resetErrors();
            
            // Get values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Validate
            let isValid = true;
            
            if (!email) {
                this.showError('email', 'Email is required');
                isValid = false;
            } else if (!Utils.isValidEmail(email)) {
                this.showError('email', 'Please enter a valid email');
                isValid = false;
            }
            
            if (!password) {
                this.showError('password', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                this.showError('password', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Show loading
            const loginBtn = document.getElementById('loginButton');
            this.setLoading(loginBtn, true);
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Check demo accounts
                if (
                    (email === 'student@example.com' && password === 'student123') ||
                    (email === 'teacher@example.com' && password === 'teacher123')
                ) {
                    const isTeacher = email === 'teacher@example.com';
                    const userData = {
                        email,
                        role: isTeacher ? 'teacher' : 'student',
                        name: isTeacher ? 'Demo Teacher' : 'Demo Student',
                        id: Utils.generateId('user')
                    };
                    
                    // Login
                    Auth.login(userData.email, remember);
                    
                    // Redirect
                    setTimeout(() => {
                        window.location.href = isTeacher ? 
                            '../teacher/dashboard.html' : 
                            '../student/dashboard.html';
                    }, 1000);
                    
                } else {
                    this.showError('email', 'Invalid email or password');
                    this.showError('password', 'Invalid email or password');
                    this.setLoading(loginBtn, false);
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.setLoading(loginBtn, false);
            }
        });
    }
    
    setupForgotPassword() {
        const link = document.getElementById('forgotPassword');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const modalContent = `
                    <div class="forgot-password-modal">
                        <p>Enter your email to reset password:</p>
                        <input type="email" class="form-control" id="resetEmail" 
                               value="${email}" placeholder="Your email">
                        <div class="modal-actions">
                            <button class="btn btn-primary" id="sendReset">Send Reset Link</button>
                            <button class="btn btn-secondary" id="cancelReset">Cancel</button>
                        </div>
                    </div>
                `;
                
                // Show modal
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal">
                        <div class="modal-header">
                            <h3>Reset Password</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">${modalContent}</div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Close modal
                modal.querySelector('.modal-close').onclick = () => modal.remove();
                modal.querySelector('#cancelReset').onclick = () => modal.remove();
                
                // Send reset
                modal.querySelector('#sendReset').onclick = () => {
                    const resetEmail = modal.querySelector('#resetEmail').value;
                    if (!Utils.isValidEmail(resetEmail)) {
                        alert('Please enter a valid email');
                        return;
                    }
                    alert(`Reset link sent to ${resetEmail}`);
                    modal.remove();
                };
            });
        }
    }
    
    setupSocialLogin() {
        const googleBtn = document.getElementById('googleLogin');
        const microsoftBtn = document.getElementById('microsoftLogin');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                alert('Google login would be implemented here');
            });
        }
        
        if (microsoftBtn) {
            microsoftBtn.addEventListener('click', () => {
                alert('Microsoft login would be implemented here');
            });
        }
    }
    
    showError(field, message) {
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
    
    resetErrors() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(el => el.style.display = 'none');
    }
    
    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span> Signing in...';
        } else {
            button.disabled = false;
            button.textContent = 'Sign In';
        }
    }
}

// Auto-initialize on pages with login form
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        new LoginForm();
    }
});