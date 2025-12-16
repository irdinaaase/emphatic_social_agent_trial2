// components/header/header.js

class HeaderManager {
    constructor() {
        this.userData = null;
        this.notifications = [];
        this.messages = [];
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadNavigation();
        this.loadNotifications();
        this.loadMessages();
        this.updateHeader();
    }
    
    loadUserData() {
        // Load from localStorage or API
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            this.userData = JSON.parse(storedData);
        } else {
            // Default data for demonstration
            this.userData = {
                name: "Alex Johnson",
                email: "alex@example.com",
                role: "student",
                avatar: "AJ",
                progress: 65
            };
        }
    }
    
    setupEventListeners() {
        // Search
        const searchToggle = document.getElementById('searchToggle');
        const searchContainer = document.getElementById('searchContainer');
        const searchClear = document.getElementById('searchClear');
        const searchInput = document.getElementById('searchInput');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchContainer.classList.toggle('show');
                if (searchContainer.classList.contains('show')) {
                    searchInput.focus();
                }
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
            });
        }
        
        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('show');
            });
        }
        
        // Messages
        const messageBtn = document.getElementById('messageBtn');
        const messageDropdown = document.getElementById('messageDropdown');
        
        if (messageBtn) {
            messageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                messageDropdown.classList.toggle('show');
            });
        }
        
        // Profile
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
        }
        
        // Mobile Menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        const mobileNav = document.getElementById('mobileNav');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNav.classList.add('open');
                mobileNavOverlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileNavOverlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
        
        if (mobileNavOverlay) {
            mobileNavOverlay.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileNavOverlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-notifications')) {
                notificationDropdown.classList.remove('show');
            }
            if (!e.target.closest('.header-messages')) {
                messageDropdown.classList.remove('show');
            }
            if (!e.target.closest('.header-profile')) {
                profileDropdown.classList.remove('show');
            }
            if (!e.target.closest('.header-search')) {
                searchContainer.classList.remove('show');
            }
        });
    }
    
    loadNavigation() {
        const headerNav = document.getElementById('headerNav');
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        
        if (!headerNav || !mobileNavMenu) return;
        
        let navItems = [];
        
        if (this.userData.role === 'student') {
            navItems = [
                { id: 'dashboard', icon: '📊', text: 'Dashboard', href: '/html/student/dashboard.html' },
                { id: 'learning', icon: '📚', text: 'Learning', href: '/html/student/learning.html' },
                { id: 'agent', icon: '🤖', text: 'AI Agent', href: '/html/student/agent-chat.html' },
                { id: 'achievements', icon: '🏆', text: 'Achievements', href: '/html/student/achievements.html' },
                { id: 'profile', icon: '👤', text: 'Profile', href: '/html/student/profile.html' }
            ];
        } else if (this.userData.role === 'teacher') {
            navItems = [
                { id: 'dashboard', icon: '📊', text: 'Dashboard', href: '/html/teacher/dashboard.html' },
                { id: 'students', icon: '👥', text: 'Students', href: '/html/teacher/students.html' },
                { id: 'monitoring', icon: '👁️', text: 'Monitoring', href: '/html/teacher/monitoring.html' },
                { id: 'analytics', icon: '📈', text: 'Analytics', href: '/html/teacher/analytics.html' },
                { id: 'alerts', icon: '🔔', text: 'Alerts', href: '/html/teacher/alerts.html' }
            ];
        }
        
        // Clear existing navigation
        headerNav.innerHTML = '';
        mobileNavMenu.innerHTML = '';
        
        // Current page detection
        const currentPage = window.location.pathname.split('/').pop();
        
        // Desktop navigation
        navItems.forEach(item => {
            const isActive = currentPage === item.href.split('/').pop();
            
            const navItem = document.createElement('a');
            navItem.href = item.href;
            navItem.className = `nav-item ${isActive ? 'active' : ''}`;
            navItem.setAttribute('data-page', item.id);
            navItem.innerHTML = `
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.text}</span>
            `;
            headerNav.appendChild(navItem);
        });
        
        // Mobile navigation
        navItems.forEach(item => {
            const isActive = currentPage === item.href.split('/').pop();
            
            const mobileItem = document.createElement('a');
            mobileItem.href = item.href;
            mobileItem.className = `mobile-nav-item ${isActive ? 'active' : ''}`;
            mobileItem.innerHTML = `
                <span class="mobile-nav-icon">${item.icon}</span>
                <span class="mobile-nav-text">${item.text}</span>
            `;
            mobileNavMenu.appendChild(mobileItem);
        });
    }
    
    async loadNotifications() {
        // Simulate API call
        this.notifications = [
            {
                id: 1,
                type: 'achievement',
                title: 'New Achievement!',
                message: 'You earned the "Quick Learner" badge',
                time: '2 minutes ago',
                read: false
            },
            {
                id: 2,
                type: 'lesson',
                title: 'Lesson Completed',
                message: 'Great job completing Algebra Basics',
                time: '1 hour ago',
                read: false
            },
            {
                id: 3,
                type: 'reminder',
                title: 'Study Reminder',
                message: 'Your next study session starts in 30 minutes',
                time: '3 hours ago',
                read: true
            }
        ];
        
        this.renderNotifications();
    }
    
    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        const notificationCount = document.getElementById('notificationCount');
        
        if (!notificationList || !notificationCount) return;
        
        // Update count
        const unreadCount = this.notifications.filter(n => !n.read).length;
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        // Render list
        notificationList.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-icon-small">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.handleNotificationClick(notification));
            notificationList.appendChild(item);
        });
    }
    
    async loadMessages() {
        // Simulate API call
        this.messages = [
            {
                id: 1,
                sender: 'Mr. Smith',
                avatar: 'MS',
                preview: 'Great progress on your latest assignment!',
                time: '10:30 AM',
                read: false
            },
            {
                id: 2,
                sender: 'Sarah Chen',
                avatar: 'SC',
                preview: 'Can you help me with the math problem?',
                time: 'Yesterday',
                read: false
            },
            {
                id: 3,
                sender: 'Study Group',
                avatar: 'SG',
                preview: 'Next study session scheduled for Friday',
                time: '2 days ago',
                read: true
            }
        ];
        
        this.renderMessages();
    }
    
    renderMessages() {
        const messageList = document.getElementById('messageList');
        const messageCount = document.getElementById('messageCount');
        
        if (!messageList || !messageCount) return;
        
        // Update count
        const unreadCount = this.messages.filter(m => !m.read).length;
        messageCount.textContent = unreadCount;
        messageCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        // Render list
        messageList.innerHTML = '';
        
        this.messages.forEach(message => {
            const item = document.createElement('div');
            item.className = `message-item ${message.read ? '' : 'unread'}`;
            item.innerHTML = `
                <div class="message-avatar">${message.avatar}</div>
                <div class="message-content">
                    <div class="message-sender">${message.sender}</div>
                    <div class="message-preview">${message.preview}</div>
                    <div class="message-time">${message.time}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.handleMessageClick(message));
            messageList.appendChild(item);
        });
    }
    
    updateHeader() {
        // Update user info
        document.getElementById('profileName').textContent = this.userData.name;
        document.getElementById('profileRole').textContent = this.userData.role.charAt(0).toUpperCase() + this.userData.role.slice(1);
        document.getElementById('profileAvatar').textContent = this.userData.avatar;
        
        document.getElementById('dropdownName').textContent = this.userData.name;
        document.getElementById('dropdownEmail').textContent = this.userData.email;
        document.getElementById('dropdownAvatar').textContent = this.userData.avatar;
        
        document.getElementById('mobileUserName').textContent = this.userData.name;
        document.getElementById('mobileUserEmail').textContent = this.userData.email;
        document.getElementById('mobileAvatar').textContent = this.userData.avatar;
        
        // Update progress
        const progressFill = document.querySelector('.progress-fill');
        const progressValue = document.querySelector('.progress-value');
        if (progressFill && progressValue) {
            progressFill.style.width = `${this.userData.progress}%`;
            progressValue.textContent = `${this.userData.progress}%`;
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            'achievement': '🏆',
            'lesson': '📚',
            'reminder': '⏰',
            'alert': '⚠️',
            'message': '💬',
            'system': '⚙️'
        };
        return icons[type] || '🔔';
    }
    
    handleNotificationClick(notification) {
        // Mark as read
        notification.read = true;
        this.renderNotifications();
        
        // Navigate or show details based on notification type
        switch (notification.type) {
            case 'achievement':
                window.location.href = '/html/student/achievements.html';
                break;
            case 'lesson':
                window.location.href = '/html/student/learning.html';
                break;
            // Add more cases as needed
        }
    }
    
    handleMessageClick(message) {
        // Mark as read
        message.read = true;
        this.renderMessages();
        
        // Open messaging interface
        window.location.href = '/html/shared/messaging.html';
    }
    
    handleLogout() {
        // Clear user data
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        
        // Redirect to login
        window.location.href = '/html/shared/login.html';
    }
    
    // Public methods for external use
    updateProgress(progress) {
        this.userData.progress = progress;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        this.updateHeader();
    }
    
    addNotification(notification) {
        this.notifications.unshift(notification);
        this.renderNotifications();
    }
    
    addMessage(message) {
        this.messages.unshift(message);
        this.renderMessages();
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderManager;
}