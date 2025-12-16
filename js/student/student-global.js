// js/student/student-global.js
class StudentGlobal {
    constructor() {
        this.currentUser = Auth.getCurrentUser();
        this.isInitialized = false;
        this.activeComponents = [];
        
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isStudent()) {
            console.error('Student global requires student authentication');
            return;
        }
        
        this.setupStudentEnvironment();
        this.loadStudentData();
        this.setupEventListeners();
        this.initializeComponents();
        
        this.isInitialized = true;
        console.log('Student global initialized for:', this.currentUser.name);
    }
    
    setupStudentEnvironment() {
        // Add student-specific body class
        document.body.classList.add('student-theme');
        
        // Set page title with student name
        document.title = `${this.currentUser.name} - Student Dashboard`;
        
        // Initialize student header
        this.initializeHeader();
    }
    
    initializeHeader() {
        const headerTemplate = `
            <header class="main-header student-header">
                <div class="header-container">
                    <a href="dashboard.html" class="logo">
                        <span class="logo-icon">🎓</span>
                        <span class="logo-text">Empathic Learning</span>
                        <span class="logo-role">Student</span>
                    </a>
                    
                    <nav class="main-nav">
                        <a href="dashboard.html" class="nav-link" data-page="dashboard">
                            <span class="nav-icon">📊</span>
                            <span class="nav-text">Dashboard</span>
                        </a>
                        <a href="learning.html" class="nav-link" data-page="learning">
                            <span class="nav-icon">📚</span>
                            <span class="nav-text">Learning</span>
                        </a>
                        <a href="profile.html" class="nav-link" data-page="profile">
                            <span class="nav-icon">👤</span>
                            <span class="nav-text">Profile</span>
                        </a>
                    </nav>
                    
                    <div class="user-menu">
                        <div class="user-info">
                            <div class="user-avatar">${this.currentUser.avatar}</div>
                            <div class="user-details">
                                <span class="user-name">${this.currentUser.name}</span>
                                <span class="user-role">Student • ${this.currentUser.grade}</span>
                            </div>
                        </div>
                        <button class="btn btn-icon" data-action="toggle-agent">
                            <span class="agent-icon">🤖</span>
                        </button>
                        <button class="btn btn-icon" data-action="logout" title="Logout">
                            <span>🚪</span>
                        </button>
                    </div>
                </div>
            </header>
        `;
        
        // Insert header at beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerTemplate);
        
        // Add header styles
        this.addHeaderStyles();
    }
    
    addHeaderStyles() {
        const styles = `
            <style>
                .student-header {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
                    color: white;
                }
                
                .student-header .logo {
                    color: white;
                }
                
                .student-header .nav-link {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .student-header .nav-link:hover,
                .student-header .nav-link.active {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .student-header .user-name {
                    color: white;
                }
                
                .student-header .user-role {
                    color: rgba(255, 255, 255, 0.7);
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    async loadStudentData() {
        try {
            // Load student progress
            const progressResponse = await API.get(Config.API_ENDPOINTS.STUDENT_PROGRESS);
            if (progressResponse.success) {
                this.studentProgress = progressResponse.data;
                Storage.saveProgress(this.studentProgress);
            }
            
            // Load lessons
            const lessonsResponse = await API.get(Config.API_ENDPOINTS.STUDENT_LESSONS);
            if (lessonsResponse.success) {
                this.availableLessons = lessonsResponse.data;
            }
            
            // Load achievements
            const achievementsResponse = await API.get(Config.API_ENDPOINTS.STUDENT_ACHIEVEMENTS);
            if (achievementsResponse.success) {
                this.achievements = achievementsResponse.data;
            }
            
            console.log('Student data loaded successfully');
        } catch (error) {
            console.error('Error loading student data:', error);
            this.loadMockData();
        }
    }
    
    loadMockData() {
        // Fallback mock data
        this.studentProgress = {
            overall: 65,
            completedLessons: 12,
            totalLessons: 20,
            averageScore: 78,
            streak: 5,
            bySubject: {
                math: { progress: 70, score: 85 },
                reading: { progress: 60, score: 75 },
                science: { progress: 65, score: 70 }
            }
        };
        
        this.availableLessons = [
            {
                id: 'math-001',
                title: 'Introduction to Fractions',
                subject: 'Math',
                difficulty: 'beginner',
                progress: 80,
                status: 'in-progress'
            },
            {
                id: 'reading-001',
                title: 'Reading Comprehension',
                subject: 'Reading',
                difficulty: 'intermediate',
                progress: 100,
                status: 'completed'
            }
        ];
        
        this.achievements = [
            {
                id: 'ach-001',
                name: 'Quick Learner',
                earned: true,
                icon: '⚡'
            },
            {
                id: 'ach-002',
                name: 'Math Master',
                earned: true,
                icon: '🧮'
            }
        ];
        
        console.log('Mock student data loaded');
    }
    
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.closest('.nav-link');
                const page = link.dataset.page;
                this.navigateToPage(page);
            }
            
            // Toggle agent
            if (e.target.closest('[data-action="toggle-agent"]')) {
                this.toggleAgentInterface();
            }
            
            // Logout
            if (e.target.closest('[data-action="logout"]')) {
                Auth.logout();
                window.location.href = '../../index.html';
            }
        });
        
        // Active page highlighting
        this.highlightActivePage();
        
        // Listen for agent events
        window.addEventListener('agentIntervention', (e) => {
            this.handleAgentIntervention(e.detail);
        });
        
        window.addEventListener('emotionDetected', (e) => {
            this.handleEmotionDetection(e.detail);
        });
        
        window.addEventListener('focusWarning', (e) => {
            this.handleFocusWarning(e.detail);
        });
    }
    
    navigateToPage(page) {
        const pages = {
            dashboard: 'dashboard.html',
            learning: 'learning.html',
            profile: 'profile.html'
        };
        
        if (pages[page]) {
            window.location.href = pages[page];
        }
    }
    
    highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop();
        const pageMap = {
            'dashboard.html': 'dashboard',
            'learning.html': 'learning',
            'profile.html': 'profile'
        };
        
        const activePage = pageMap[currentPage];
        if (activePage) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === activePage) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    toggleAgentInterface() {
        const agentInterface = document.getElementById('agent-interface');
        if (agentInterface) {
            agentInterface.classList.toggle('active');
        } else {
            this.createAgentInterface();
        }
    }
    
    createAgentInterface() {
        const interfaceHTML = `
            <div id="agent-interface" class="agent-interface active">
                <div class="agent-header">
                    <div class="agent-avatar">${EmpathicAgent.avatar}</div>
                    <div class="agent-info">
                        <div class="agent-name">${EmpathicAgent.name}</div>
                        <div class="agent-status">Online • Ready to help</div>
                    </div>
                    <button class="btn-icon" data-action="close-agent">×</button>
                </div>
                
                <div class="agent-messages" id="agent-messages">
                    <div class="message message-agent">
                        Hi ${this.currentUser.name}! I'm here to help you with your learning. How can I assist you today?
                    </div>
                </div>
                
                <div class="agent-input">
                    <input type="text" id="agent-input" placeholder="Type your message..." data-emotion-monitor>
                    <button class="btn btn-primary" id="send-message">Send</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', interfaceHTML);
        
        // Add event listeners
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendAgentMessage();
        });
        
        document.getElementById('agent-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAgentMessage();
            }
        });
        
        document.querySelector('[data-action="close-agent"]').addEventListener('click', () => {
            document.getElementById('agent-interface').classList.remove('active');
        });
    }
    
    async sendAgentMessage() {
        const input = document.getElementById('agent-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add student message to UI
        this.addMessageToChat('student', message);
        input.value = '';
        
        // Get agent response
        const response = await EmpathicAgent.chat(message);
        
        // Add agent response to UI
        setTimeout(() => {
            this.addMessageToChat('agent', response.message);
            
            // Show suggestions if any
            if (response.suggestions && response.suggestions.length > 0) {
                this.showAgentSuggestions(response.suggestions);
            }
        }, 1000);
    }
    
    addMessageToChat(sender, message) {
        const messagesContainer = document.getElementById('agent-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${sender}`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showAgentSuggestions(suggestions) {
        const messagesContainer = document.getElementById('agent-messages');
        if (!messagesContainer) return;
        
        const suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'agent-suggestions';
        suggestionsElement.innerHTML = `
            <div class="suggestions-title">Try these:</div>
            <div class="suggestions-list">
                ${suggestions.map(suggestion => 
                    `<button class="suggestion-btn" data-suggestion="${suggestion}">${suggestion}</button>`
                ).join('')}
            </div>
        `;
        
        messagesContainer.appendChild(suggestionsElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add click handlers for suggestion buttons
        suggestionsElement.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                document.getElementById('agent-input').value = suggestion;
                this.sendAgentMessage();
            });
        });
    }
    
    handleAgentIntervention(intervention) {
        console.log('Agent intervention:', intervention);
        
        // Show intervention as notification
        this.showNotification({
            type: 'intervention',
            title: intervention.title,
            message: intervention.message,
            severity: intervention.severity,
            actions: intervention.actions
        });
        
        // If high severity, make it more prominent
        if (intervention.severity === 'high') {
            this.showModal({
                title: 'Support Needed',
                content: `
                    <p>${intervention.message}</p>
                    <div class="intervention-actions">
                        ${intervention.actions.map(action => 
                            `<button class="btn btn-primary">${action}</button>`
                        ).join('')}
                    </div>
                `,
                showClose: true
            });
        }
    }
    
    handleEmotionDetection(emotionData) {
        console.log('Emotion detected:', emotionData.emotion);
        
        // Store emotion data
        const emotionLogs = Storage.get('student_emotion_logs', []);
        emotionLogs.push({
            ...emotionData,
            timestamp: new Date().toISOString()
        });
        Storage.set('student_emotion_logs', emotionLogs);
        
        // Only show notification for strong emotions
        if (emotionData.confidence > 0.7 && 
            ['frustrated', 'sad', 'anxious'].includes(emotionData.emotion)) {
            this.showNotification({
                type: 'emotion',
                title: 'I notice you might be feeling ' + emotionData.emotion,
                message: 'Would you like to talk about it?',
                icon: '😔'
            });
        }
    }
    
    handleFocusWarning(warning) {
        console.log('Focus warning:', warning);
        
        this.showNotification({
            type: 'focus',
            title: 'Focus Alert',
            message: warning.message,
            suggestions: warning.suggestions,
            icon: '🎯'
        });
    }
    
    showNotification(notification) {
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `student-notification notification-${notification.type}`;
        notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${notification.icon || 'ℹ️'}</span>
                <div class="notification-body">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    ${notification.suggestions ? `
                        <div class="notification-suggestions">
                            ${notification.suggestions.map(s => 
                                `<button class="btn btn-sm">${s}</button>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add to notification container or create one
        let container = document.getElementById('student-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'student-notifications';
            container.className = 'student-notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notificationElement);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, 10000);
        
        // Close button
        notificationElement.querySelector('.notification-close').addEventListener('click', () => {
            notificationElement.remove();
        });
        
        // Add styles if not already present
        this.addNotificationStyles();
    }
    
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const styles = `
            <style id="notification-styles">
                .student-notifications-container {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 350px;
                }
                
                .student-notification {
                    background: white;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-lg);
                    border-left: 4px solid;
                    animation: slideIn 0.3s ease;
                }
                
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    padding: 15px;
                    gap: 10px;
                }
                
                .notification-icon {
                    font-size: 1.5rem;
                }
                
                .notification-body {
                    flex: 1;
                }
                
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: var(--dark-1);
                }
                
                .notification-message {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                }
                
                .notification-suggestions {
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: var(--text-light);
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification-intervention {
                    border-left-color: var(--warning-color);
                }
                
                .notification-emotion {
                    border-left-color: var(--primary-color);
                }
                
                .notification-focus {
                    border-left-color: var(--info-color);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    showModal(options) {
        const modal = document.createElement('div');
        modal.className = 'student-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title}</h3>
                    ${options.showClose ? '<button class="btn-icon modal-close">×</button>' : ''}
                </div>
                <div class="modal-body">
                    ${options.content}
                </div>
                ${options.actions ? `
                    <div class="modal-footer">
                        ${options.actions}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (options.showClose) {
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Add modal styles if needed
        this.addModalStyles();
    }
    
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const styles = `
            <style id="modal-styles">
                .student-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                
                .student-modal .modal-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .student-modal .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--light-3);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .student-modal .modal-body {
                    padding: 20px;
                }
                
                .student-modal .modal-footer {
                    padding: 20px;
                    border-top: 1px solid var(--light-3);
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    initializeComponents() {
        // Initialize components based on current page
        const currentPage = window.location.pathname.split('/').pop();
        
        switch(currentPage) {
            case 'dashboard.html':
                this.initializeDashboard();
                break;
            case 'learning.html':
                this.initializeLearning();
                break;
            case 'profile.html':
                this.initializeProfile();
                break;
        }
    }
    
    initializeDashboard() {
        // Will be handled by dashboard.js
        console.log('Initializing dashboard...');
    }
    
    initializeLearning() {
        // Will be handled by learning.js
        console.log('Initializing learning...');
    }
    
    initializeProfile() {
        // Will be handled by profile.js
        console.log('Initializing profile...');
    }
    
    getProgress() {
        return this.studentProgress;
    }
    
    getLessons() {
        return this.availableLessons;
    }
    
    getAchievements() {
        return this.achievements;
    }
    
    recordLearningActivity(activity) {
        const activities = Storage.get('learning_activities', []);
        activities.push({
            ...activity,
            timestamp: new Date().toISOString()
        });
        Storage.set('learning_activities', activities);
        
        // Dispatch event for other components
        const event = new CustomEvent('learningActivity', {
            detail: activity
        });
        window.dispatchEvent(event);
    }
    
    updateProgress(lessonId, score) {
        Storage.updateProgress(lessonId, score);
        
        // Update local progress data
        if (this.studentProgress) {
            // Recalculate overall progress
            // This would be more complex in real implementation
            this.studentProgress.overall = Math.min(100, this.studentProgress.overall + 5);
        }
        
        // Dispatch progress update event
        const event = new CustomEvent('progressUpdate', {
            detail: { lessonId, score }
        });
        window.dispatchEvent(event);
    }
}

// Initialize student global when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isStudent()) {
        window.StudentApp = new StudentGlobal();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentGlobal;
}