// js/teacher/dashboard.js
class TeacherDashboard {
    constructor() {
        this.students = [];
        this.alerts = [];
        this.activityLog = [];
        this.stats = {};
        
        this.init();
    }
    
    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        
        console.log('Teacher Dashboard initialized');
    }
    
    async loadDashboardData() {
        try {
            // Show loading states
            this.setLoadingState(true);
            
            // Load all data in parallel
            await Promise.all([
                this.loadStudents(),
                this.loadAlerts(),
                this.loadActivityLog(),
                this.loadStats()
            ]);
            
            // Render all components
            this.renderStats();
            this.renderAlerts();
            this.renderStudents();
            this.renderActivityLog();
            this.renderAnalytics();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async loadStudents() {
        try {
            // Try to load from API first
            const response = await API.get('/api/teacher/students');
            if (response.success) {
                this.students = response.data;
            } else {
                // Fallback to mock data
                this.students = await this.getMockStudents();
            }
        } catch (error) {
            console.warn('Using mock student data:', error);
            this.students = await this.getMockStudents();
        }
    }
    
    async loadAlerts() {
        try {
            const response = await API.get('/api/teacher/alerts');
            if (response.success) {
                this.alerts = response.data;
            } else {
                this.alerts = await this.getMockAlerts();
            }
        } catch (error) {
            console.warn('Using mock alert data:', error);
            this.alerts = await this.getMockAlerts();
        }
    }
    
    async loadActivityLog() {
        try {
            const response = await API.get('/api/teacher/activity');
            if (response.success) {
                this.activityLog = response.data;
            } else {
                this.activityLog = await this.getMockActivity();
            }
        } catch (error) {
            console.warn('Using mock activity data:', error);
            this.activityLog = await this.getMockActivity();
        }
    }
    
    async loadStats() {
        try {
            const response = await API.get('/api/teacher/stats');
            if (response.success) {
                this.stats = response.data;
            } else {
                this.stats = await this.getMockStats();
            }
        } catch (error) {
            console.warn('Using mock stats data:', error);
            this.stats = await this.getMockStats();
        }
    }
    
    async getMockStudents() {
        return [
            {
                id: 's1',
                name: 'Alex Johnson',
                avatar: 'AJ',
                grade: '5th',
                progress: 85,
                status: 'active',
                lastActive: '2024-01-15T10:30:00Z',
                needsAttention: false,
                subjects: {
                    math: { progress: 90, trend: 'up' },
                    reading: { progress: 85, trend: 'up' },
                    science: { progress: 80, trend: 'same' }
                }
            },
            {
                id: 's2',
                name: 'Maria Garcia',
                avatar: 'MG',
                grade: '5th',
                progress: 72,
                status: 'active',
                lastActive: '2024-01-15T09:15:00Z',
                needsAttention: true,
                attentionReason: 'Low engagement detected',
                subjects: {
                    math: { progress: 65, trend: 'down' },
                    reading: { progress: 75, trend: 'up' },
                    science: { progress: 70, trend: 'same' }
                }
            },
            {
                id: 's3',
                name: 'David Chen',
                avatar: 'DC',
                grade: '5th',
                progress: 95,
                status: 'active',
                lastActive: '2024-01-15T11:45:00Z',
                needsAttention: false,
                subjects: {
                    math: { progress: 98, trend: 'up' },
                    reading: { progress: 92, trend: 'up' },
                    science: { progress: 96, trend: 'up' }
                }
            },
            {
                id: 's4',
                name: 'Sarah Williams',
                avatar: 'SW',
                grade: '5th',
                progress: 60,
                status: 'inactive',
                lastActive: '2024-01-14T14:20:00Z',
                needsAttention: true,
                attentionReason: 'Haven\'t logged in for 2 days',
                subjects: {
                    math: { progress: 55, trend: 'down' },
                    reading: { progress: 65, trend: 'same' },
                    science: { progress: 60, trend: 'down' }
                }
            },
            {
                id: 's5',
                name: 'James Miller',
                avatar: 'JM',
                grade: '5th',
                progress: 78,
                status: 'active',
                lastActive: '2024-01-15T08:45:00Z',
                needsAttention: false,
                subjects: {
                    math: { progress: 70, trend: 'up' },
                    reading: { progress: 80, trend: 'up' },
                    science: { progress: 75, trend: 'same' }
                }
            }
        ];
    }
    
    async getMockAlerts() {
        return [
            {
                id: 'a1',
                studentId: 's2',
                studentName: 'Maria Garcia',
                type: 'focus',
                severity: 'high',
                message: 'Student showing signs of distraction. Focus level dropped by 40% in the last 15 minutes.',
                time: '2024-01-15T10:15:00Z',
                tags: ['focus', 'engagement'],
                read: false
            },
            {
                id: 'a2',
                studentId: 's4',
                studentName: 'Sarah Williams',
                type: 'progress',
                severity: 'medium',
                message: 'Student is falling behind in Mathematics. Current score is 20% below class average.',
                time: '2024-01-15T09:30:00Z',
                tags: ['progress', 'math'],
                read: false
            },
            {
                id: 'a3',
                studentId: 's1',
                studentName: 'Alex Johnson',
                type: 'emotion',
                severity: 'low',
                message: 'Student appears to be frustrated with current exercise.',
                time: '2024-01-15T10:45:00Z',
                tags: ['emotion', 'support'],
                read: true
            },
            {
                id: 'a4',
                studentId: 's5',
                studentName: 'James Miller',
                type: 'engagement',
                severity: 'medium',
                message: 'Student engagement has decreased significantly during reading activities.',
                time: '2024-01-15T08:30:00Z',
                tags: ['engagement', 'reading'],
                read: false
            }
        ];
    }
    
    async getMockActivity() {
        return [
            {
                id: 'act1',
                studentId: 's3',
                studentName: 'David Chen',
                type: 'achievement',
                message: 'Completed "Advanced Fractions" module with perfect score',
                time: '2024-01-15T11:30:00Z',
                details: 'Score: 100% | Time: 25 minutes'
            },
            {
                id: 'act2',
                studentId: 's1',
                studentName: 'Alex Johnson',
                type: 'progress',
                message: 'Reached 85% progress in Reading Comprehension',
                time: '2024-01-15T10:15:00Z',
                details: 'Reading Level: Advanced'
            },
            {
                id: 'act3',
                studentId: 's5',
                studentName: 'James Miller',
                type: 'intervention',
                message: 'Agent provided help with multiplication tables',
                time: '2024-01-15T09:45:00Z',
                details: 'Topic: Multiplication | Duration: 5 minutes'
            },
            {
                id: 'act4',
                studentId: 's2',
                studentName: 'Maria Garcia',
                type: 'focus',
                message: 'Completed focus session using Pomodoro timer',
                time: '2024-01-15T09:15:00Z',
                details: 'Focus Time: 25 minutes | Break: 5 minutes'
            },
            {
                id: 'act5',
                studentId: 's4',
                studentName: 'Sarah Williams',
                type: 'session',
                message: 'Started new learning session',
                time: '2024-01-14T14:20:00Z',
                details: 'Subject: Science | Module: Solar System'
            }
        ];
    }
    
    async getMockStats() {
        return {
            totalStudents: 25,
            activeStudents: 18,
            avgProgress: 78,
            totalAlerts: 4,
            studentChange: '+2',
            progressChange: '+5%',
            activeChange: '+3',
            alertChange: '-1',
            classAverage: {
                math: 82,
                reading: 76,
                science: 79,
                writing: 73
            },
            engagementRate: 87,
            completionRate: 65,
            avgSessionTime: 32,
            weeklyTrend: [65, 70, 72, 75, 78, 80, 78]
        };
    }
    
    setupEventListeners() {
        // Quick action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Alert item clicks
        document.addEventListener('click', (e) => {
            const alertItem = e.target.closest('.alert-item');
            if (alertItem) {
                const alertId = alertItem.dataset.alertId;
                this.showAlertDetails(alertId);
            }
        });
        
        // Student card clicks
        document.addEventListener('click', (e) => {
            const studentCard = e.target.closest('.student-card');
            if (studentCard) {
                const studentId = studentCard.dataset.studentId;
                this.showStudentDetails(studentId);
            }
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        // Filter and search
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterStudents(e.target.value);
            });
        }
        
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterStudentsByStatus(e.target.value);
            });
        }
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
        
        // Also check for updates on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateRealTimeData();
            }
        });
    }
    
    async updateRealTimeData() {
        try {
            // Update alerts
            const alertsResponse = await API.get('/api/teacher/alerts/realtime');
            if (alertsResponse.success && alertsResponse.data.length > 0) {
                this.alerts = [...alertsResponse.data, ...this.alerts].slice(0, 20);
                this.renderAlerts();
                
                // Show notification for new alerts
                const newAlerts = alertsResponse.data.filter(alert => !alert.read);
                if (newAlerts.length > 0) {
                    this.showNotification(`${newAlerts.length} new alert${newAlerts.length > 1 ? 's' : ''}`);
                }
            }
            
            // Update activity
            const activityResponse = await API.get('/api/teacher/activity/realtime');
            if (activityResponse.success) {
                this.activityLog = [...activityResponse.data, ...this.activityLog].slice(0, 10);
                this.renderActivityLog();
            }
            
        } catch (error) {
            console.warn('Real-time update failed:', error);
        }
    }
    
    renderStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon students">
                    👨‍🎓
                </div>
                <div class="stat-content">
                    <div class="stat-value">${this.stats.totalStudents}</div>
                    <div class="stat-label">Total Students</div>
                    <div class="stat-change ${this.stats.studentChange.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.stats.studentChange} this week
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon progress">
                    📈
                </div>
                <div class="stat-content">
                    <div class="stat-value">${this.stats.avgProgress}%</div>
                    <div class="stat-label">Avg Progress</div>
                    <div class="stat-change ${this.stats.progressChange.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.stats.progressChange}
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon active">
                    🔥
                </div>
                <div class="stat-content">
                    <div class="stat-value">${this.stats.activeStudents}</div>
                    <div class="stat-label">Active Now</div>
                    <div class="stat-change ${this.stats.activeChange.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.stats.activeChange} online
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon alerts">
                    ⚠️
                </div>
                <div class="stat-content">
                    <div class="stat-value">${this.stats.totalAlerts}</div>
                    <div class="stat-label">Pending Alerts</div>
                    <div class="stat-change ${this.stats.alertChange.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.stats.alertChange} today
                    </div>
                </div>
            </div>
        `;
        
        // Render class progress
        this.renderClassProgress();
    }
    
    renderClassProgress() {
        const progressContainer = document.getElementById('class-progress');
        if (!progressContainer) return;
        
        const subjectHTML = Object.entries(this.stats.classAverage || {}).map(([subject, score]) => `
            <div class="subject-item">
                <div class="subject-name">${this.formatSubjectName(subject)}</div>
                <div class="subject-score">${score}%</div>
                <div class="subject-trend">
                    ${this.getTrendIcon(this.getRandomTrend())}
                    ${this.getRandomChange()} from last week
                </div>
            </div>
        `).join('');
        
        progressContainer.innerHTML = `
            <div class="class-progress">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">Class Progress Overview</h3>
                        <p>Average performance across subjects</p>
                    </div>
                    <div class="section-actions">
                        <button class="btn btn-sm btn-secondary" data-action="export-progress">
                            Export Report
                        </button>
                    </div>
                </div>
                
                <div class="progress-chart" id="progress-chart">
                    <!-- Chart will be drawn by Chart.js -->
                </div>
                
                <div class="subject-breakdown">
                    ${subjectHTML}
                </div>
            </div>
        `;
        
        // Initialize chart
        this.initProgressChart();
    }
    
    renderAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) return;
        
        const unreadCount = this.alerts.filter(alert => !alert.read).length;
        const alertsHTML = this.alerts.slice(0, 5).map(alert => `
            <div class="alert-item alert-${alert.severity}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <div class="alert-student">${alert.studentName}</div>
                    <div class="alert-time">${this.formatTime(alert.time)}</div>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-tags">
                    ${alert.tags.map(tag => `
                        <span class="alert-tag tag-${tag}">${tag}</span>
                    `).join('')}
                    ${!alert.read ? '<span class="alert-tag" style="background:#fef3c7;color:#92400e;">NEW</span>' : ''}
                </div>
            </div>
        `).join('');
        
        alertsContainer.innerHTML = `
            <div class="alerts-panel">
                <div class="alerts-header">
                    <h3 class="alerts-title">Recent Alerts</h3>
                    ${unreadCount > 0 ? `<span class="alerts-badge">${unreadCount}</span>` : ''}
                </div>
                <div class="alerts-list">
                    ${this.alerts.length > 0 ? alertsHTML : `
                        <div class="empty-state">
                            <div class="empty-icon">🔔</div>
                            <div class="empty-message">No Alerts</div>
                            <div class="empty-submessage">Everything is running smoothly</div>
                        </div>
                    `}
                </div>
                <div class="alerts-footer">
                    <a href="../teacher/alerts.html" class="btn btn-sm btn-secondary">View All Alerts</a>
                </div>
            </div>
        `;
    }
    
    renderStudents() {
        const studentsContainer = document.getElementById('students-container');
        if (!studentsContainer) return;
        
        const studentsHTML = this.students.slice(0, 6).map(student => `
            <div class="student-card ${student.needsAttention ? 'needs-attention' : ''}" 
                 data-student-id="${student.id}"
                 title="${student.needsAttention ? student.attentionReason : ''}">
                <div class="student-avatar">${student.avatar}</div>
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-details">
                        ${student.grade} • ${this.getStatusText(student.status)}
                    </div>
                    <div class="student-progress">
                        <div class="progress-circle" style="--progress: ${student.progress}%">
                            <span class="progress-text">${student.progress}%</span>
                        </div>
                        <div class="progress-status ${this.getProgressLevel(student.progress)}">
                            ${this.getProgressText(student.progress)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        studentsContainer.innerHTML = `
            <div class="students-overview">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">Students Overview</h3>
                        <p>${this.students.filter(s => s.needsAttention).length} need attention</p>
                    </div>
                    <div class="section-actions">
                        <input type="text" 
                               id="student-search" 
                               class="form-control form-control-sm" 
                               placeholder="Search students..."
                               style="min-width: 150px;">
                        <select id="status-filter" class="select-control select-control-sm">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="needs-attention">Needs Attention</option>
                        </select>
                    </div>
                </div>
                <div class="students-grid">
                    ${studentsHTML}
                </div>
                <div class="section-footer" style="margin-top: var(--space-4); text-align: center;">
                    <a href="../teacher/students.html" class="btn btn-sm btn-secondary">View All Students</a>
                </div>
            </div>
        `;
    }
    
    renderActivityLog() {
        const activityContainer = document.getElementById('activity-container');
        if (!activityContainer) return;
        
        const activityHTML = this.activityLog.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <div class="activity-student">${activity.studentName}</div>
                        <div class="activity-time">${this.formatTime(activity.time)}</div>
                    </div>
                    <div class="activity-message">${activity.message}</div>
                    ${activity.details ? `
                        <div class="activity-details">${activity.details}</div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        activityContainer.innerHTML = `
            <div class="activity-feed">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">Recent Activity</h3>
                        <p>Latest student interactions</p>
                    </div>
                    <div class="section-actions">
                        <button class="btn btn-sm btn-secondary" data-action="refresh-activity">
                            Refresh
                        </button>
                    </div>
                </div>
                <div class="activity-list">
                    ${activityHTML}
                </div>
            </div>
        `;
    }
    
    renderAnalytics() {
        const analyticsContainer = document.getElementById('analytics-container');
        if (!analyticsContainer) return;
        
        analyticsContainer.innerHTML = `
            <div class="analytics-widget">
                <div class="analytics-header">
                    <div>
                        <h3 class="section-title">Analytics Overview</h3>
                        <p>Weekly engagement metrics</p>
                    </div>
                    <div class="analytics-actions">
                        <button class="btn btn-sm btn-secondary" data-action="timeframe" data-timeframe="week">
                            Week
                        </button>
                        <button class="btn btn-sm btn-secondary" data-action="timeframe" data-timeframe="month">
                            Month
                        </button>
                        <button class="btn btn-sm btn-secondary" data-action="timeframe" data-timeframe="year">
                            Year
                        </button>
                    </div>
                </div>
                <div class="analytics-chart" id="engagement-chart">
                    <!-- Chart will be drawn by Chart.js -->
                </div>
                <div class="analytics-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${this.stats.engagementRate}%</div>
                        <div class="metric-label">Engagement Rate</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${this.stats.completionRate}%</div>
                        <div class="metric-label">Completion Rate</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${this.stats.avgSessionTime}m</div>
                        <div class="metric-label">Avg Session Time</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${this.stats.activeStudents}/${this.stats.totalStudents}</div>
                        <div class="metric-label">Active/Total</div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize analytics chart
        this.initAnalyticsChart();
    }
    
    initProgressChart() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx) return;
        
        // Mock chart data
        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            datasets: [
                {
                    label: 'Math',
                    data: [75, 78, 82, 85, 82],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Reading',
                    data: [70, 72, 76, 78, 76],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Science',
                    data: [72, 75, 79, 82, 79],
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }
            ]
        };
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 60,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Average Score (%)'
                        }
                    }
                }
            }
        });
    }
    
    initAnalyticsChart() {
        const ctx = document.getElementById('engagement-chart');
        if (!ctx || typeof Chart === 'undefined') return;
        
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Engagement',
                    data: this.stats.weeklyTrend || [65, 70, 72, 75, 78, 80, 78],
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    borderColor: 'rgb(76, 201, 240)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        };
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Engagement (%)'
                        }
                    }
                }
            }
        });
    }
    
    // Helper Methods
    formatSubjectName(subject) {
        const subjects = {
            'math': 'Mathematics',
            'reading': 'Reading',
            'science': 'Science',
            'writing': 'Writing'
        };
        return subjects[subject] || subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }
    
    getStatusText(status) {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'away': 'Away'
        };
        return statusMap[status] || status;
    }
    
    getProgressLevel(progress) {
        if (progress >= 80) return 'high';
        if (progress >= 60) return 'medium';
        return 'low';
    }
    
    getProgressText(progress) {
        if (progress >= 80) return 'Excellent';
        if (progress >= 60) return 'Good';
        if (progress >= 40) return 'Needs Improvement';
        return 'Requires Attention';
    }
    
    getActivityIcon(type) {
        const icons = {
            'achievement': '🏆',
            'progress': '📈',
            'intervention': '🤖',
            'focus': '🎯',
            'session': '📚',
            'emotion': '😊'
        };
        return icons[type] || '📝';
    }
    
    getTrendIcon(trend) {
        return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
    }
    
    getRandomTrend() {
        const trends = ['up', 'down', 'same'];
        return trends[Math.floor(Math.random() * trends.length)];
    }
    
    getRandomChange() {
        const changes = ['+2%', '+1%', '-1%', '+3%', 'No change'];
        return changes[Math.floor(Math.random() * changes.length)];
    }
    
    // Action Handlers
    handleQuickAction(action) {
        switch (action) {
            case 'add-student':
                this.addNewStudent();
                break;
            case 'create-assignment':
                this.createAssignment();
                break;
            case 'send-message':
                this.sendMessage();
                break;
            case 'view-reports':
                this.viewReports();
                break;
            case 'refresh-activity':
                this.refreshActivity();
                break;
            case 'export-progress':
                this.exportProgressReport();
                break;
            default:
                console.log('Action not implemented:', action);
        }
    }
    
    addNewStudent() {
        // Show add student modal
        const modalContent = `
            <div class="add-student-form">
                <div class="form-group">
                    <label for="student-name">Student Name</label>
                    <input type="text" id="student-name" class="form-control" placeholder="Enter student's full name">
                </div>
                <div class="form-group">
                    <label for="student-grade">Grade Level</label>
                    <select id="student-grade" class="select-control">
                        <option value="">Select grade</option>
                        <option value="3">3rd Grade</option>
                        <option value="4">4th Grade</option>
                        <option value="5" selected>5th Grade</option>
                        <option value="6">6th Grade</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="student-email">Email (optional)</label>
                    <input type="email" id="student-email" class="form-control" placeholder="student@example.com">
                </div>
            </div>
        `;
        
        this.showModal({
            title: 'Add New Student',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="confirm-add-student">Add Student</button>
                <button class="btn btn-secondary" id="cancel-add-student">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('confirm-add-student').addEventListener('click', async () => {
                    const name = document.getElementById('student-name').value;
                    const grade = document.getElementById('student-grade').value;
                    
                    if (!name || !grade) {
                        this.showNotification('Please fill in all required fields', 'error');
                        return;
                    }
                    
                    // In real implementation, this would call an API
                    this.showNotification('Student added successfully', 'success');
                    document.querySelector('.modal').remove();
                    
                    // Refresh student list
                    await this.loadStudents();
                    this.renderStudents();
                });
                
                document.getElementById('cancel-add-student').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    createAssignment() {
        window.location.href = '../teacher/content-editor.html';
    }
    
    sendMessage() {
        // Show message modal
        this.showModal({
            title: 'Send Message to Students',
            content: `
                <div class="message-form">
                    <div class="form-group">
                        <label for="message-recipients">Recipients</label>
                        <select id="message-recipients" class="select-control" multiple>
                            <option value="all" selected>All Students</option>
                            ${this.students.map(student => `
                                <option value="${student.id}">${student.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message-subject">Subject</label>
                        <input type="text" id="message-subject" class="form-control" placeholder="Message subject">
                    </div>
                    <div class="form-group">
                        <label for="message-content">Message</label>
                        <textarea id="message-content" class="form-control" rows="6" placeholder="Type your message here..."></textarea>
                    </div>
                </div>
            `,
            actions: `
                <button class="btn btn-primary" id="send-message-btn">Send Message</button>
                <button class="btn btn-secondary" id="cancel-message">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('send-message-btn').addEventListener('click', async () => {
                    const subject = document.getElementById('message-subject').value;
                    const content = document.getElementById('message-content').value;
                    
                    if (!subject || !content) {
                        this.showNotification('Please fill in all fields', 'error');
                        return;
                    }
                    
                    // Simulate sending message
                    this.showNotification('Message sent successfully', 'success');
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    viewReports() {
        window.location.href = '../teacher/analytics.html';
    }
    
    refreshActivity() {
        this.loadActivityLog().then(() => {
            this.renderActivityLog();
            this.showNotification('Activity log refreshed', 'success');
        });
    }
    
    exportProgressReport() {
        // Show export options
        this.showModal({
            title: 'Export Progress Report',
            content: `
                <div class="export-options">
                    <div class="form-group">
                        <label>Export Format</label>
                        <div class="radio-group">
                            <label><input type="radio" name="format" value="pdf" checked> PDF Document</label>
                            <label><input type="radio" name="format" value="excel"> Excel Spreadsheet</label>
                            <label><input type="radio" name="format" value="csv"> CSV File</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Date Range</label>
                        <div class="radio-group">
                            <label><input type="radio" name="range" value="week" checked> Last Week</label>
                            <label><input type="radio" name="range" value="month"> Last Month</label>
                            <label><input type="radio" name="range" value="quarter"> Last Quarter</label>
                            <label><input type="radio" name="range" value="custom"> Custom Range</label>
                        </div>
                    </div>
                    <div class="form-group" id="custom-range" style="display: none;">
                        <label>Custom Date Range</label>
                        <div style="display: flex; gap: var(--space-2);">
                            <input type="date" class="form-control" id="start-date">
                            <span>to</span>
                            <input type="date" class="form-control" id="end-date">
                        </div>
                    </div>
                </div>
            `,
            actions: `
                <button class="btn btn-primary" id="export-report">Export Report</button>
                <button class="btn btn-secondary" id="cancel-export">Cancel</button>
            `,
            onShow: () => {
                // Show custom range when selected
                document.querySelectorAll('input[name="range"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        document.getElementById('custom-range').style.display = 
                            e.target.value === 'custom' ? 'block' : 'none';
                    });
                });
                
                document.getElementById('export-report').addEventListener('click', () => {
                    const format = document.querySelector('input[name="format"]:checked').value;
                    const range = document.querySelector('input[name="range"]:checked').value;
                    
                    this.showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
                    
                    // Simulate export
                    setTimeout(() => {
                        this.showNotification('Report exported successfully!', 'success');
                        document.querySelector('.modal').remove();
                    }, 1500);
                });
            }
        });
    }
    
    showAlertDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        // Mark as read
        alert.read = true;
        this.renderAlerts();
        
        // Show details modal
        const modalContent = `
            <div class="alert-details">
                <div class="alert-header" style="margin-bottom: var(--space-4);">
                    <div class="alert-student" style="font-size: var(--text-xl);">${alert.studentName}</div>
                    <div class="alert-time">${this.formatTime(alert.time)}</div>
                </div>
                
                <div class="alert-severity" style="margin-bottom: var(--space-4);">
                    <span class="badge ${alert.severity === 'high' ? 'badge-danger' : 
                                      alert.severity === 'medium' ? 'badge-warning' : 'badge-info'}">
                        ${alert.severity.toUpperCase()} Priority
                    </span>
                </div>
                
                <div class="alert-message" style="font-size: var(--text-lg); margin-bottom: var(--space-6);">
                    ${alert.message}
                </div>
                
                <div class="alert-suggestions">
                    <h4 style="margin-bottom: var(--space-3);">Suggested Actions:</h4>
                    <ul style="padding-left: var(--space-4);">
                        ${this.generateAlertSuggestions(alert).map(suggestion => 
                            `<li style="margin-bottom: var(--space-2);">${suggestion}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal({
            title: 'Alert Details',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="contact-student">Contact Student</button>
                <button class="btn btn-secondary" id="view-student">View Student Profile</button>
                <button class="btn btn-secondary" id="dismiss-alert">Dismiss Alert</button>
            `,
            onShow: () => {
                document.getElementById('contact-student').addEventListener('click', () => {
                    this.sendMessageToStudent(alert.studentId);
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('view-student').addEventListener('click', () => {
                    this.showStudentDetails(alert.studentId);
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('dismiss-alert').addEventListener('click', () => {
                    this.dismissAlert(alertId);
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    showStudentDetails(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const modalContent = `
            <div class="student-details">
                <div class="student-header" style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6);">
                    <div class="student-avatar" style="width: 80px; height: 80px; font-size: 2rem;">${student.avatar}</div>
                    <div>
                        <h3 style="margin: 0 0 var(--space-2) 0;">${student.name}</h3>
                        <div style="color: var(--text-secondary);">
                            ${student.grade} • ${this.getStatusText(student.status)}
                            ${student.needsAttention ? 
                                '<span class="badge badge-warning" style="margin-left: var(--space-2);">Needs Attention</span>' : 
                                ''}
                        </div>
                    </div>
                </div>
                
                <div class="student-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); margin-bottom: var(--space-6);">
                    <div class="stat-box" style="text-align: center;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-color);">${student.progress}%</div>
                        <div style="font-size: var(--text-sm); color: var(--text-secondary);">Overall Progress</div>
                    </div>
                    <div class="stat-box" style="text-align: center;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--info-color);">
                            ${Math.floor(Math.random() * 20) + 5}
                        </div>
                        <div style="font-size: var(--text-sm); color: var(--text-secondary);">Learning Sessions</div>
                    </div>
                    <div class="stat-box" style="text-align: center;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--success-color);">
                            ${Math.floor(Math.random() * 15) + 3}
                        </div>
                        <div style="font-size: var(--text-sm); color: var(--text-secondary);">Achievements</div>
                    </div>
                    <div class="stat-box" style="text-align: center;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--warning-color);">
                            ${Math.floor(Math.random() * 10) + 1}
                        </div>
                        <div style="font-size: var(--text-sm); color: var(--text-secondary);">Agent Interventions</div>
                    </div>
                </div>
                
                <div class="student-subjects">
                    <h4 style="margin-bottom: var(--space-3);">Subject Performance:</h4>
                    <div style="display: grid; gap: var(--space-3);">
                        ${Object.entries(student.subjects || {}).map(([subject, data]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--light-1); border-radius: var(--radius);">
                                <div>
                                    <strong>${this.formatSubjectName(subject)}</strong>
                                    <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                        ${data.trend === 'up' ? 'Improving' : data.trend === 'down' ? 'Needs work' : 'Stable'}
                                    </div>
                                </div>
                                <div style="font-size: var(--text-xl); font-weight: 700; color: var(--primary-color);">
                                    ${data.progress}%
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.showModal({
            title: 'Student Profile',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="view-progress">View Progress Report</button>
                <button class="btn btn-secondary" id="send-message-student">Send Message</button>
                <button class="btn btn-secondary" id="assign-work">Assign Work</button>
            `,
            onShow: () => {
                document.getElementById('view-progress').addEventListener('click', () => {
                    this.showProgressReport(studentId);
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('send-message-student').addEventListener('click', () => {
                    this.sendMessageToStudent(studentId);
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('assign-work').addEventListener('click', () => {
                    this.assignWorkToStudent(studentId);
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    generateAlertSuggestions(alert) {
        const suggestions = {
            'focus': [
                'Check if the student needs a break',
                'Consider adjusting the difficulty level',
                'Send an encouraging message',
                'Schedule a one-on-one check-in'
            ],
            'progress': [
                'Review the student\'s recent work',
                'Provide additional practice materials',
                'Consider peer tutoring',
                'Adjust learning pace'
            ],
            'emotion': [
                'Send a supportive message',
                'Check in with the student',
                'Consider adjusting the content',
                'Provide positive reinforcement'
            ],
            'engagement': [
                'Try different learning activities',
                'Incorporate interactive elements',
                'Set smaller, achievable goals',
                'Provide more immediate feedback'
            ]
        };
        
        return suggestions[alert.tags[0]] || [
            'Monitor the situation',
            'Check in with the student',
            'Review performance metrics',
            'Consider intervention if persists'
        ];
    }
    
    sendMessageToStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        this.showModal({
            title: `Message ${student.name}`,
            content: `
                <div class="message-form">
                    <div class="form-group">
                        <label for="message-to-student">Message</label>
                        <textarea id="message-to-student" class="form-control" rows="6" placeholder="Type your message to ${student.name}..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="include-encouragement" checked>
                            Include encouragement from learning agent
                        </label>
                    </div>
                </div>
            `,
            actions: `
                <button class="btn btn-primary" id="send-to-student">Send Message</button>
                <button class="btn btn-secondary" id="cancel-student-message">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('send-to-student').addEventListener('click', () => {
                    const message = document.getElementById('message-to-student').value;
                    if (!message.trim()) {
                        this.showNotification('Please enter a message', 'error');
                        return;
                    }
                    
                    this.showNotification(`Message sent to ${student.name}`, 'success');
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    dismissAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.renderAlerts();
        this.showNotification('Alert dismissed', 'info');
    }
    
    showProgressReport(studentId) {
        // This would navigate to the student's progress report page
        window.location.href = `../teacher/students.html?student=${studentId}`;
    }
    
    assignWorkToStudent(studentId) {
        window.location.href = `../teacher/content-editor.html?student=${studentId}`;
    }
    
    filterStudents(searchTerm) {
        const filtered = this.students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.grade.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredStudents(filtered);
    }
    
    filterStudentsByStatus(status) {
        let filtered = this.students;
        
        if (status === 'active') {
            filtered = filtered.filter(s => s.status === 'active');
        } else if (status === 'inactive') {
            filtered = filtered.filter(s => s.status === 'inactive');
        } else if (status === 'needs-attention') {
            filtered = filtered.filter(s => s.needsAttention);
        }
        
        this.renderFilteredStudents(filtered);
    }
    
    renderFilteredStudents(filteredStudents) {
        const studentsGrid = document.querySelector('.students-grid');
        if (!studentsGrid) return;
        
        const studentsHTML = filteredStudents.slice(0, 6).map(student => `
            <div class="student-card ${student.needsAttention ? 'needs-attention' : ''}" 
                 data-student-id="${student.id}">
                <div class="student-avatar">${student.avatar}</div>
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-details">
                        ${student.grade} • ${this.getStatusText(student.status)}
                    </div>
                    <div class="student-progress">
                        <div class="progress-circle" style="--progress: ${student.progress}%">
                            <span class="progress-text">${student.progress}%</span>
                        </div>
                        <div class="progress-status ${this.getProgressLevel(student.progress)}">
                            ${this.getProgressText(student.progress)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        studentsGrid.innerHTML = studentsHTML || `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">👨‍🎓</div>
                <div class="empty-message">No students found</div>
                <div class="empty-submessage">Try adjusting your search or filters</div>
            </div>
        `;
    }
    
    refreshDashboard() {
        this.showNotification('Refreshing dashboard...', 'info');
        this.loadDashboardData();
    }
    
    setLoadingState(loading) {
        const dashboard = document.querySelector('.teacher-dashboard');
        if (!dashboard) return;
        
        if (loading) {
            dashboard.classList.add('loading');
        } else {
            dashboard.classList.remove('loading');
        }
    }
    
    showModal(options) {
        const modalHTML = `
            <div class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: white; border-radius: var(--radius-lg); max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl);">
                    <div class="modal-header" style="padding: var(--space-6); border-bottom: 1px solid var(--light-3);">
                        <h2 style="margin: 0; color: var(--dark-1);">${options.title}</h2>
                        <button class="btn-icon modal-close" style="margin-left: auto;">×</button>
                    </div>
                    <div class="modal-body" style="padding: var(--space-6);">
                        ${options.content}
                    </div>
                    <div class="modal-footer" style="padding: var(--space-6); border-top: 1px solid var(--light-3); display: flex; gap: var(--space-3); justify-content: flex-end;">
                        ${options.actions || ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.querySelector('.modal:last-child');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        if (options.onShow) {
            options.onShow();
        }
        
        return modal;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">${message}</div>
            <button class="notification-close">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#fee2e2' : 
                         type === 'success' ? '#d1fae5' : 
                         type === 'warning' ? '#fef3c7' : '#e0f2fe'};
            border: 1px solid ${type === 'error' ? '#fecaca' : 
                              type === 'success' ? '#a7f3d0' : 
                              type === 'warning' ? '#fde68a' : '#bae6fd'};
            color: ${type === 'error' ? '#991b1b' : 
                    type === 'success' ? '#065f46' : 
                    type === 'warning' ? '#92400e' : '#1e40af'};
            padding: var(--space-4) var(--space-6);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            gap: var(--space-3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isTeacher()) {
        window.TeacherDashboard = new TeacherDashboard();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherDashboard;
}