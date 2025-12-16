// components/notification-badge/notification.js

class NotificationBadge {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.options = {
            autoFetch: true,
            fetchInterval: 30000, // 30 seconds
            maxNotifications: 50,
            showCount: true,
            showFilters: false,
            onNotificationClick: null,
            onMarkAllRead: null,
            onClearAll: null,
            ...options
        };
        
        this.notifications = [];
        this.filteredNotifications = [];
        this.currentFilter = 'all';
        this.isFetching = false;
        this.fetchInterval = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        
        if (this.options.autoFetch) {
            this.fetchNotifications();
            this.startAutoFetch();
        }
    }
    
    render() {
        this.container.innerHTML = `
            ${this.options.showFilters ? `
                <div class="notification-type-filter" id="notificationFilters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="unread">Unread</button>
                    <button class="filter-btn" data-filter="achievement">Achievements</button>
                    <button class="filter-btn" data-filter="lesson">Lessons</button>
                    <button class="filter-btn" data-filter="alert">Alerts</button>
                </div>
            ` : ''}
            
            <div class="notification-header" id="notificationHeader">
                <h3 class="notification-title">Notifications</h3>
                ${this.options.showCount ? `
                    <div class="notification-count" id="notificationCount">0</div>
                ` : ''}
            </div>
            
            <div class="notification-list" id="notificationList">
                <!-- Notifications will be loaded here -->
            </div>
            
            <div class="notification-empty" id="notificationEmpty">
                <div class="empty-icon">🔔</div>
                <div class="empty-text">No notifications</div>
            </div>
            
            <div class="notification-footer" id="notificationFooter">
                <button class="btn-text" id="markAllRead">Mark all as read</button>
                <button class="btn-text" id="clearAll">Clear all</button>
                <button class="btn-text" id="viewAll">View all</button>
            </div>
        `;
        
        // Store element references
        this.notificationList = document.getElementById('notificationList');
        this.notificationEmpty = document.getElementById('notificationEmpty');
        this.notificationCount = document.getElementById('notificationCount');
        this.notificationFooter = document.getElementById('notificationFooter');
        this.notificationFilters = document.getElementById('notificationFilters');
        
        this.updateEmptyState();
    }
    
    setupEventListeners() {
        // Mark all as read
        const markAllReadBtn = document.getElementById('markAllRead');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }
        
        // Clear all
        const clearAllBtn = document.getElementById('clearAll');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAll());
        }
        
        // View all
        const viewAllBtn = document.getElementById('viewAll');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewAllNotifications();
            });
        }
        
        // Filter buttons
        if (this.notificationFilters) {
            const filterBtns = this.notificationFilters.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.dataset.filter;
                    this.setFilter(filter);
                });
            });
        }
    }
    
    async fetchNotifications() {
        if (this.isFetching) return;
        
        this.isFetching = true;
        
        try {
            // Simulate API call
            const mockNotifications = this.getMockNotifications();
            this.addNotifications(mockNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            this.showError('Failed to load notifications');
        } finally {
            this.isFetching = false;
        }
    }
    
    getMockNotifications() {
        // Return mock data for demonstration
        return [
            {
                id: Date.now() + 1,
                type: 'achievement',
                title: 'New Achievement!',
                message: 'You earned the "Quick Learner" badge for completing 5 lessons in a row',
                time: '2 minutes ago',
                read: false,
                priority: 'high',
                action: {
                    label: 'View Badge',
                    url: '/html/student/achievements.html'
                }
            },
            {
                id: Date.now() + 2,
                type: 'lesson',
                title: 'Lesson Completed',
                message: 'Great job completing "Algebra Basics" with 95% score',
                time: '1 hour ago',
                read: false,
                priority: 'medium',
                action: {
                    label: 'Continue',
                    url: '/html/student/learning.html'
                }
            },
            {
                id: Date.now() + 3,
                type: 'alert',
                title: 'Study Reminder',
                message: 'Your next study session starts in 30 minutes',
                time: '3 hours ago',
                read: true,
                priority: 'low',
                action: {
                    label: 'Start Now',
                    url: '/html/student/dashboard.html'
                }
            },
            {
                id: Date.now() + 4,
                type: 'message',
                title: 'New Message',
                message: 'Mr. Smith sent you feedback on your latest assignment',
                time: 'Yesterday',
                read: true,
                priority: 'medium',
                action: {
                    label: 'Read',
                    url: '/html/shared/messaging.html'
                }
            }
        ];
    }
    
    addNotifications(notifications) {
        // Add new notifications to the beginning
        this.notifications = [...notifications, ...this.notifications];
        
        // Limit total notifications
        if (this.notifications.length > this.options.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.options.maxNotifications);
        }
        
        this.applyFilter();
        this.renderNotifications();
        this.updateCount();
        this.updateEmptyState();
        
        // Show notification count in badge if needed
        this.updateBadgeCount();
    }
    
    addNotification(notification) {
        // Add timestamp if not present
        if (!notification.time) {
            notification.time = 'Just now';
        }
        
        // Add ID if not present
        if (!notification.id) {
            notification.id = Date.now() + Math.random();
        }
        
        // Add to beginning of array
        this.notifications.unshift(notification);
        
        // Play notification sound if enabled
        this.playNotificationSound();
        
        // Show desktop notification if permitted
        this.showDesktopNotification(notification);
        
        this.applyFilter();
        this.renderNotifications();
        this.updateCount();
        this.updateEmptyState();
        this.updateBadgeCount();
    }
    
    renderNotifications() {
        if (!this.notificationList) return;
        
        this.notificationList.innerHTML = '';
        
        if (this.filteredNotifications.length === 0) {
            return;
        }
        
        // Group by date if needed
        const grouped = this.groupNotificationsByDate(this.filteredNotifications);
        
        grouped.forEach(group => {
            // Add group header if multiple groups
            if (grouped.length > 1) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'group-header';
                groupHeader.textContent = group.date;
                this.notificationList.appendChild(groupHeader);
            }
            
            // Render each notification in group
            group.notifications.forEach(notification => {
                const notificationEl = this.createNotificationElement(notification);
                this.notificationList.appendChild(notificationEl);
            });
        });
    }
    
    createNotificationElement(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-item notification-item-${notification.type} ${notification.read ? '' : 'unread'} priority-${notification.priority || 'medium'}`;
        notificationEl.dataset.id = notification.id;
        
        const icon = this.getNotificationIcon(notification.type);
        const actions = notification.action ? `
            <div class="notification-actions">
                <button class="notification-action-btn primary" data-action="primary">
                    ${notification.action.label}
                </button>
                ${!notification.read ? `
                    <button class="notification-action-btn" data-action="mark-read">
                        Mark as read
                    </button>
                ` : ''}
            </div>
        ` : '';
        
        notificationEl.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title-row">
                    <div class="notification-item-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <p class="notification-message">${notification.message}</p>
                ${actions}
            </div>
        `;
        
        // Add click handlers
        notificationEl.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-action-btn')) {
                this.handleNotificationClick(notification);
            }
        });
        
        // Add action button handlers
        const actionBtns = notificationEl.querySelectorAll('.notification-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.handleNotificationAction(notification, action);
            });
        });
        
        return notificationEl;
    }
    
    getNotificationIcon(type) {
        const icons = {
            'achievement': '🏆',
            'lesson': '📚',
            'alert': '⚠️',
            'message': '💬',
            'system': '⚙️',
            'reminder': '⏰',
            'warning': '🚨',
            'success': '✅'
        };
        return icons[type] || '🔔';
    }
    
    groupNotificationsByDate(notifications) {
        // Simple grouping by today/yesterday/older
        const groups = {
            'Today': [],
            'Yesterday': [],
            'Older': []
        };
        
        notifications.forEach(notification => {
            // For mock data, just use a simple grouping
            if (notification.time.includes('minutes') || notification.time.includes('hour')) {
                groups['Today'].push(notification);
            } else if (notification.time.includes('Yesterday')) {
                groups['Yesterday'].push(notification);
            } else {
                groups['Older'].push(notification);
            }
        });
        
        // Convert to array format and filter out empty groups
        return Object.entries(groups)
            .filter(([_, notifications]) => notifications.length > 0)
            .map(([date, notifications]) => ({ date, notifications }));
    }
    
    handleNotificationClick(notification) {
        // Mark as read
        this.markAsRead(notification.id);
        
        // Call custom handler if provided
        if (this.options.onNotificationClick) {
            this.options.onNotificationClick(notification);
        }
        
        // Navigate to action URL if exists
        if (notification.action && notification.action.url) {
            window.location.href = notification.action.url;
        }
    }
    
    handleNotificationAction(notification, action) {
        switch (action) {
            case 'primary':
                if (notification.action && notification.action.url) {
                    window.location.href = notification.action.url;
                }
                break;
            case 'mark-read':
                this.markAsRead(notification.id);
                break;
        }
    }
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.applyFilter();
            this.renderNotifications();
            this.updateCount();
            this.updateBadgeCount();
        }
    }
    
    markAllAsRead() {
        let changed = false;
        
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                changed = true;
            }
        });
        
        if (changed) {
            this.applyFilter();
            this.renderNotifications();
            this.updateCount();
            this.updateBadgeCount();
            
            // Call custom handler if provided
            if (this.options.onMarkAllRead) {
                this.options.onMarkAllRead();
            }
        }
    }
    
    clearAll() {
        if (this.notifications.length === 0) return;
        
        if (confirm('Are you sure you want to clear all notifications?')) {
            this.notifications = [];
            this.filteredNotifications = [];
            this.renderNotifications();
            this.updateCount();
            this.updateEmptyState();
            this.updateBadgeCount();
            
            // Call custom handler if provided
            if (this.options.onClearAll) {
                this.options.onClearAll();
            }
        }
    }
    
    clearNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.applyFilter();
        this.renderNotifications();
        this.updateCount();
        this.updateEmptyState();
        this.updateBadgeCount();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        if (this.notificationFilters) {
            const filterBtns = this.notificationFilters.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }
        
        this.applyFilter();
        this.renderNotifications();
    }
    
    applyFilter() {
        switch (this.currentFilter) {
            case 'unread':
                this.filteredNotifications = this.notifications.filter(n => !n.read);
                break;
            case 'achievement':
                this.filteredNotifications = this.notifications.filter(n => n.type === 'achievement');
                break;
            case 'lesson':
                this.filteredNotifications = this.notifications.filter(n => n.type === 'lesson');
                break;
            case 'alert':
                this.filteredNotifications = this.notifications.filter(n => n.type === 'alert');
                break;
            default: // 'all'
                this.filteredNotifications = [...this.notifications];
        }
    }
    
    updateCount() {
        if (!this.notificationCount) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationCount.textContent = unreadCount;
        
        // Hide if zero
        if (unreadCount === 0 && this.options.showCount) {
            this.notificationCount.style.display = 'none';
        } else {
            this.notificationCount.style.display = 'flex';
        }
    }
    
    updateEmptyState() {
        if (!this.notificationEmpty || !this.notificationList || !this.notificationFooter) return;
        
        const hasNotifications = this.filteredNotifications.length > 0;
        
        this.notificationEmpty.style.display = hasNotifications ? 'none' : 'flex';
        this.notificationList.style.display = hasNotifications ? 'block' : 'none';
        this.notificationFooter.style.display = hasNotifications ? 'flex' : 'none';
    }
    
    updateBadgeCount() {
        // Update any external badge elements
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Dispatch custom event
        const event = new CustomEvent('notificationCountUpdate', {
            detail: { count: unreadCount }
        });
        document.dispatchEvent(event);
        
        // Update title badge if needed
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Empathic Learning`;
        } else {
            document.title = 'Empathic Learning';
        }
    }
    
    viewAllNotifications() {
        // Navigate to full notifications page
        window.location.href = '/html/shared/notifications.html';
    }
    
    playNotificationSound() {
        // Play notification sound if enabled
        const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
        
        if (soundEnabled) {
            const audio = new Audio('/assets/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    showDesktopNotification(notification) {
        // Check if browser supports notifications
        if (!('Notification' in window)) return;
        
        // Check if permission is granted
        if (Notification.permission === 'granted') {
            this.createDesktopNotification(notification);
        } else if (Notification.permission !== 'denied') {
            // Request permission
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.createDesktopNotification(notification);
                }
            });
        }
    }
    
    createDesktopNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/assets/images/logo.png',
            badge: '/assets/images/logo-badge.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'high'
        };
        
        const desktopNotification = new Notification(notification.title, options);
        
        desktopNotification.onclick = () => {
            window.focus();
            this.handleNotificationClick(notification);
            desktopNotification.close();
        };
        
        // Auto close after 10 seconds
        setTimeout(() => desktopNotification.close(), 10000);
    }
    
    startAutoFetch() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
        }
        
        this.fetchInterval = setInterval(() => {
            this.fetchNotifications();
        }, this.options.fetchInterval);
    }
    
    stopAutoFetch() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        }
    }
    
    showError(message) {
        // Show error notification
        this.addNotification({
            type: 'alert',
            title: 'Error',
            message: message,
            time: 'Just now',
            read: false,
            priority: 'high'
        });
    }
    
    // Public methods
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
    
    getNotifications() {
        return [...this.notifications];
    }
    
    refresh() {
        this.fetchNotifications();
    }
    
    // Cleanup
    destroy() {
        this.stopAutoFetch();
        
        // Remove event listeners
        const markAllReadBtn = document.getElementById('markAllRead');
        const clearAllBtn = document.getElementById('clearAll');
        const viewAllBtn = document.getElementById('viewAll');
        
        if (markAllReadBtn) markAllReadBtn.removeEventListener('click', this.markAllAsRead);
        if (clearAllBtn) clearAllBtn.removeEventListener('click', this.clearAll);
        if (viewAllBtn) viewAllBtn.removeEventListener('click', this.viewAllNotifications);
        
        if (this.notificationFilters) {
            const filterBtns = this.notificationFilters.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.removeEventListener('click', this.setFilter);
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const notificationBadges = document.querySelectorAll('[data-notification-badge]');
    
    notificationBadges.forEach(container => {
        const options = {
            autoFetch: container.dataset.autoFetch !== 'false',
            showCount: container.dataset.showCount !== 'false',
            showFilters: container.dataset.showFilters === 'true',
            maxNotifications: parseInt(container.dataset.maxNotifications) || 50
        };
        
        window.notificationBadge = new NotificationBadge(container.id, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationBadge;
}