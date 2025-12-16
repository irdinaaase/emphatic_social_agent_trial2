// js/modules/auth.js
class AuthModule {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }
    
    init() {
        this.loadUserFromStorage();
        this.setupAuthListeners();
    }
    
    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem(Config.STORAGE_KEYS.USER_DATA);
            const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
            
            if (userData && token) {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                console.log('User loaded from storage:', this.currentUser.name);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.logout();
        }
    }
    
    async login(email, password, userData = null) {
        // Validate inputs
        if (typeof email !== 'string' || !email.trim()) {
            console.error('Invalid email parameter:', email);
            return {
                success: false,
                message: 'Valid email is required'
            };
        }
        
        if (typeof password !== 'string' || !password.trim()) {
            console.error('Invalid password parameter:', password);
            return {
                success: false,
                message: 'Password is required'
            };
        }
        
        console.log('login called with:', { email: email.substring(0, 5) + '...', password: '***' });
        console.log('email type:', typeof email);
        
        try {
            if (Config.MOCK_DATA.ENABLED) {
                await this.mockApiDelay();
                
                if (Math.random() < Config.MOCK_DATA.ERROR_RATE) {
                    throw new Error('Mock authentication error');
                }
                
                // Validate email format
                if (!this.validateEmail(email)) {
                    return {
                        success: false,
                        message: 'Invalid email format'
                    };
                }
                
                // Use provided user data or create mock user
                if (!userData) {
                    const role = localStorage.getItem('selectedRole') || 'student';
                    userData = this.createMockUser(email, role);
                }
                
                // Generate mock token
                const token = this.generateMockToken(userData);
                
                // Save to storage
                localStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);
                localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                this.currentUser = userData;
                this.isAuthenticated = true;
                
                // Emit login event
                this.emitAuthEvent('login', userData);
                
                console.log('User logged in:', userData.name);
                
                return {
                    success: true,
                    user: userData,
                    token: token
                };
            } else {
                // Real API call would go here
                return await this.realLogin(email, password);
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }
    
    async realLogin(email, password) {
        try {
            // Example of real API call structure
            const response = await fetch(`${Config.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error(`Login failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Save to storage
                localStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, data.token);
                localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                this.currentUser = data.user;
                this.isAuthenticated = true;
                
                // Emit login event
                this.emitAuthEvent('login', data.user);
                
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Real login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }
    
    async register(userData) {
        try {
            // Validate user data
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data');
            }
            
            if (!this.validateEmail(userData.email)) {
                throw new Error('Invalid email format');
            }
            
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error('Password does not meet requirements');
            }
            
            if (Config.MOCK_DATA.ENABLED) {
                await this.mockApiDelay();
                
                // Generate mock token
                const token = this.generateMockToken(userData);
                
                // Save to storage
                localStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);
                localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                this.currentUser = userData;
                this.isAuthenticated = true;
                
                // Emit register event
                this.emitAuthEvent('register', userData);
                
                console.log('User registered:', userData.name);
                
                return {
                    success: true,
                    user: userData,
                    token: token
                };
            } else {
                // Real registration API call
                const response = await fetch(`${Config.API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    throw new Error(`Registration failed: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    // Save to storage
                    localStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, data.token);
                    localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    
                    // Emit register event
                    this.emitAuthEvent('register', data.user);
                    
                    return data;
                } else {
                    throw new Error(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    logout() {
        // Clear auth data
        localStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(Config.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem('isLoggedIn');
        
        // Keep accessibility preferences
        const accessibilityPrefs = localStorage.getItem(Config.STORAGE_KEYS.ACCESSIBILITY_PREFS);
        const theme = localStorage.getItem(Config.STORAGE_KEYS.THEME);
        const fontSize = localStorage.getItem(Config.STORAGE_KEYS.FONT_SIZE);
        
        // Clear all storage except preferences
        const keysToKeep = [
            Config.STORAGE_KEYS.ACCESSIBILITY_PREFS,
            Config.STORAGE_KEYS.THEME,
            Config.STORAGE_KEYS.FONT_SIZE,
            'selectedRole'
        ];
        
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Restore preferences
        if (accessibilityPrefs) {
            localStorage.setItem(Config.STORAGE_KEYS.ACCESSIBILITY_PREFS, accessibilityPrefs);
        }
        if (theme) {
            localStorage.setItem(Config.STORAGE_KEYS.THEME, theme);
        }
        if (fontSize) {
            localStorage.setItem(Config.STORAGE_KEYS.FONT_SIZE, fontSize);
        }
        
        // Update state
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Emit logout event
        this.emitAuthEvent('logout');
        
        console.log('User logged out');
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    getUserRole() {
        return this.currentUser?.role || 'student';
    }
    
    isStudent() {
        return this.getUserRole() === 'student';
    }
    
    isTeacher() {
        return this.getUserRole() === 'teacher';
    }
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const rolePermissions = {
            student: ['view_lessons', 'view_progress', 'chat_with_agent', 'access_content'],
            teacher: ['view_students', 'view_analytics', 'send_alerts', 'manage_content', 'edit_lessons', 'view_reports']
        };
        
        return rolePermissions[this.getUserRole()]?.includes(permission) || false;
    }
    
    // Mock data helpers
    createMockUser(email, role) {
        // Ensure email is a string
        if (typeof email !== 'string') {
            console.warn('Email parameter is not a string, converting:', typeof email, email);
            email = String(email || 'user@example.com');
        }
        
        // Clean email input
        email = email.trim().toLowerCase();
        
        const username = email.split('@')[0];
        const name = username.charAt(0).toUpperCase() + username.slice(1);
        
        if (role === 'student') {
            return {
                id: `student-${Date.now()}`,
                email: email,
                name: name,
                role: 'student',
                disabilityType: 'general',
                avatar: '👨‍🎓',
                grade: '5th Grade',
                teacher: 'Ms. Rodriguez',
                joinDate: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    fontSize: 'medium',
                    learningStyle: 'visual',
                    notifications: true
                },
                stats: {
                    completedLessons: 12,
                    totalTime: 3600,
                    accuracy: 85
                }
            };
        } else {
            return {
                id: `teacher-${Date.now()}`,
                email: email,
                name: name,
                role: 'teacher',
                avatar: '👩‍🏫',
                subjects: ['Math', 'Science'],
                studentsCount: 24,
                joinDate: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    notifications: true,
                    alertLevel: 'medium'
                },
                stats: {
                    activeStudents: 24,
                    totalLessons: 45,
                    studentEngagement: 78
                }
            };
        }
    }
    
    generateMockToken(userData) {
        return `mock_token_${userData.id}_${Date.now()}`;
    }
    
    async mockApiDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, Config.MOCK_DATA.DELAY);
        });
    }
    
    // Event handling
    setupAuthListeners() {
        // Listen for storage changes (for multiple tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === Config.STORAGE_KEYS.AUTH_TOKEN) {
                this.loadUserFromStorage();
            }
        });
    }
    
    emitAuthEvent(type, data = null) {
        const event = new CustomEvent('authChange', {
            detail: { type, data }
        });
        window.dispatchEvent(event);
    }
    
    // Password validation
    validatePassword(password) {
        if (typeof password !== 'string') {
            return {
                isValid: false,
                requirements: {
                    minLength: false,
                    hasUpperCase: false,
                    hasLowerCase: false,
                    hasNumbers: false,
                    hasSpecialChar: false
                }
            };
        }
        
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        return {
            isValid: requirements.minLength &&
                     requirements.hasUpperCase &&
                     requirements.hasLowerCase &&
                     requirements.hasNumbers,
            requirements: requirements,
            messages: this.getPasswordValidationMessages(requirements)
        };
    }
    
    getPasswordValidationMessages(requirements) {
        const messages = [];
        
        if (!requirements.minLength) {
            messages.push('Password must be at least 8 characters long');
        }
        if (!requirements.hasUpperCase) {
            messages.push('Password must contain at least one uppercase letter');
        }
        if (!requirements.hasLowerCase) {
            messages.push('Password must contain at least one lowercase letter');
        }
        if (!requirements.hasNumbers) {
            messages.push('Password must contain at least one number');
        }
        if (!requirements.hasSpecialChar) {
            messages.push('Password must contain at least one special character');
        }
        
        return messages;
    }
    
    // Email validation
    validateEmail(email) {
        if (typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    // Utility methods
    updateUserProfile(updates) {
        if (!this.currentUser) return false;
        
        try {
            this.currentUser = { ...this.currentUser, ...updates };
            localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));
            this.emitAuthEvent('profileUpdate', this.currentUser);
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    }
    
    updatePreferences(preferences) {
        if (!this.currentUser) return false;
        
        try {
            this.currentUser.preferences = { 
                ...this.currentUser.preferences, 
                ...preferences 
            };
            localStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));
            this.emitAuthEvent('preferencesUpdate', this.currentUser);
            return true;
        } catch (error) {
            console.error('Error updating preferences:', error);
            return false;
        }
    }
    
    // Token management
    getToken() {
        return localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    }
    
    refreshToken() {
        if (!this.currentUser) return null;
        
        const newToken = this.generateMockToken(this.currentUser);
        localStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        return newToken;
    }
    
    // Session management
    checkSessionExpiry() {
        const token = this.getToken();
        if (!token) return false;
        
        // Mock token expiry check
        const tokenParts = token.split('_');
        if (tokenParts.length >= 3) {
            const timestamp = parseInt(tokenParts[tokenParts.length - 1]);
            const age = Date.now() - timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            return age < maxAge;
        }
        
        return true;
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.Auth = new AuthModule();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthModule;
}

// Auto-check session on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.Auth && !window.Auth.checkSessionExpiry()) {
                console.log('Session expired, logging out...');
                window.Auth.logout();
            }
        }, 1000);
    });
}