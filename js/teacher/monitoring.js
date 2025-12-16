// js/teacher/monitoring.js
class TeacherMonitoring {
    constructor() {
        this.students = [];
        this.activeSessions = [];
        this.monitoringInterval = null;
        this.charts = {};
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isTeacher()) {
            window.location.href = '../../index.html';
            return;
        }
        
        this.loadMonitoringData();
        this.setupEventListeners();
        this.startMonitoring();
        this.setupCharts();
        
        console.log('Teacher monitoring initialized');
    }
    
    async loadMonitoringData() {
        try {
            // Get students from teacher app
            if (window.TeacherApp) {
                this.students = TeacherApp.getStudents({ status: 'active' });
            } else {
                // Fallback to mock data
                this.students = await this.getMockStudents();
            }
            
            // Load active sessions
            this.activeSessions = await this.getActiveSessions();
            
            this.renderMonitoringDashboard();
            
        } catch (error) {
            console.error('Error loading monitoring data:', error);
            this.showError('Failed to load monitoring data');
        }
    }
    
    async getMockStudents() {
        return [
            {
                id: 's1',
                name: 'Alex Johnson',
                avatar: 'AJ',
                grade: '5th',
                status: 'active',
                focus: 85,
                engagement: 78,
                emotion: 'focused',
                currentActivity: 'Math Module',
                sessionDuration: 25,
                lastUpdate: new Date().toISOString()
            },
            {
                id: 's2',
                name: 'Maria Garcia',
                avatar: 'MG',
                grade: '5th',
                status: 'active',
                focus: 65,
                engagement: 72,
                emotion: 'distracted',
                currentActivity: 'Reading Practice',
                sessionDuration: 18,
                lastUpdate: new Date().toISOString()
            }
        ];
    }
    
    async getActiveSessions() {
        // Mock active sessions
        return [
            {
                studentId: 's1',
                startTime: new Date(Date.now() - 25 * 60000).toISOString(),
                activity: 'Math: Fractions',
                focusHistory: [85, 82, 88, 90, 85],
                engagementHistory: [78, 75, 80, 82, 78]
            },
            {
                studentId: 's2',
                startTime: new Date(Date.now() - 18 * 60000).toISOString(),
                activity: 'Reading: Comprehension',
                focusHistory: [70, 65, 68, 62, 65],
                engagementHistory: [75, 72, 70, 68, 72]
            }
        ];
    }
    
    renderMonitoringDashboard() {
        const container = document.querySelector('.monitoring-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="monitoring-header">
                <h1>Live Student Monitoring</h1>
                <div class="monitoring-controls">
                    <button class="btn btn-primary" id="startMonitoring">
                        <span class="status-indicator active"></span>
                        Live Monitoring Active
                    </button>
                    <button class="btn btn-secondary" id="refreshMonitoring">
                        <span class="icon">🔄</span> Refresh
                    </button>
                </div>
            </div>
            
            <div class="monitoring-stats">
                <div class="stat-card">
                    <div class="stat-icon">👨‍🎓</div>
                    <div class="stat-content">
                        <div class="stat-value" id="activeStudents">0</div>
                        <div class="stat-label">Active Students</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <div class="stat-value" id="avgFocus">0%</div>
                        <div class="stat-label">Avg Focus</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <div class="stat-value" id="avgEngagement">0%</div>
                        <div class="stat-label">Avg Engagement</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">😊</div>
                    <div class="stat-content">
                        <div class="stat-value" id="positiveEmotions">0%</div>
                        <div class="stat-label">Positive Emotions</div>
                    </div>
                </div>
            </div>
            
            <div class="monitoring-grid">
                <div class="students-panel">
                    <div class="panel-header">
                        <h3>Live Student Status</h3>
                        <div class="panel-controls">
                            <input type="text" class="form-control search-input" 
                                   placeholder="Search students...">
                            <select class="select-control status-filter">
                                <option value="all">All Status</option>
                                <option value="focused">Focused</option>
                                <option value="distracted">Distracted</option>
                                <option value="struggling">Struggling</option>
                            </select>
                        </div>
                    </div>
                    <div class="students-list" id="studentsList">
                        <!-- Students will be populated dynamically -->
                    </div>
                </div>
                
                <div class="charts-panel">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>Focus Level Heatmap</h4>
                            <div class="chart-controls">
                                <button class="chart-btn active" data-period="live">Live</button>
                                <button class="chart-btn" data-period="hour">1H</button>
                                <button class="chart-btn" data-period="day">1D</button>
                            </div>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="focusHeatmap"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>Emotion Distribution</h4>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="emotionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="activity-panel">
                <div class="panel-header">
                    <h3>Recent Activity</h3>
                    <button class="btn btn-sm btn-secondary" id="clearActivity">Clear</button>
                </div>
                <div class="activity-list" id="activityList">
                    <!-- Activity will be populated dynamically -->
                </div>
            </div>
        `;
        
        this.updateMonitoringStats();
        this.renderStudentsList();
        this.setupMonitoringControls();
    }
    
    updateMonitoringStats() {
        if (this.students.length === 0) return;
        
        const activeCount = this.students.filter(s => s.status === 'active').length;
        const avgFocus = Math.round(this.students.reduce((sum, s) => sum + (s.focus || 0), 0) / this.students.length);
        const avgEngagement = Math.round(this.students.reduce((sum, s) => sum + (s.engagement || 0), 0) / this.students.length);
        const positiveEmotions = Math.round((this.students.filter(s => 
            ['focused', 'happy', 'engaged'].includes(s.emotion)).length / this.students.length) * 100);
        
        // Update DOM elements
        const activeEl = document.getElementById('activeStudents');
        const focusEl = document.getElementById('avgFocus');
        const engagementEl = document.getElementById('avgEngagement');
        const emotionEl = document.getElementById('positiveEmotions');
        
        if (activeEl) activeEl.textContent = activeCount;
        if (focusEl) focusEl.textContent = `${avgFocus}%`;
        if (engagementEl) engagementEl.textContent = `${avgEngagement}%`;
        if (emotionEl) emotionEl.textContent = `${positiveEmotions}%`;
    }
    
    renderStudentsList() {
        const container = document.getElementById('studentsList');
        if (!container) return;
        
        if (this.students.length === 0) {
            container.innerHTML = '<p class="empty-message">No active students</p>';
            return;
        }
        
        container.innerHTML = this.students.map(student => `
            <div class="student-card ${student.needsAttention ? 'needs-attention' : ''}" 
                 data-student-id="${student.id}">
                <div class="student-avatar">${student.avatar}</div>
                <div class="student-info">
                    <div class="student-header">
                        <div class="student-name">${student.name}</div>
                        <div class="student-status ${this.getStatusClass(student)}">
                            ${this.getStatusText(student)}
                        </div>
                    </div>
                    <div class="student-metrics">
                        <div class="metric">
                            <span class="metric-icon">🎯</span>
                            <span class="metric-value">${student.focus || 0}%</span>
                            <span class="metric-label">Focus</span>
                        </div>
                        <div class="metric">
                            <span class="metric-icon">📈</span>
                            <span class="metric-value">${student.engagement || 0}%</span>
                            <span class="metric-label">Engagement</span>
                        </div>
                        <div class="metric">
                            <span class="metric-icon">😊</span>
                            <span class="metric-value">${this.getEmotionIcon(student.emotion)}</span>
                            <span class="metric-label">Emotion</span>
                        </div>
                    </div>
                    <div class="student-activity">
                        <div class="activity-name">${student.currentActivity || 'Idle'}</div>
                        <div class="activity-duration">${student.sessionDuration || 0} min</div>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="btn-icon" title="Send message">💬</button>
                    <button class="btn-icon" title="View details">🔍</button>
                    <button class="btn-icon" title="Intervene">🛠️</button>
                </div>
            </div>
        `).join('');
        
        this.setupStudentCardListeners();
    }
    
    getStatusClass(student) {
        if (student.focus < 60) return 'status-distracted';
        if (student.focus > 80) return 'status-focused';
        return 'status-normal';
    }
    
    getStatusText(student) {
        if (student.focus < 60) return 'Distracted';
        if (student.focus > 80) return 'Focused';
        return 'Normal';
    }
    
    getEmotionIcon(emotion) {
        const icons = {
            'focused': '🧠',
            'happy': '😊',
            'engaged': '👍',
            'distracted': '🤔',
            'frustrated': '😤',
            'confused': '😕',
            'default': '😐'
        };
        return icons[emotion] || icons.default;
    }
    
    setupStudentCardListeners() {
        const studentCards = document.querySelectorAll('.student-card');
        studentCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.student-actions')) {
                    const studentId = card.dataset.studentId;
                    this.showStudentDetails(studentId);
                }
            });
        });
        
        const actionButtons = document.querySelectorAll('.student-actions .btn-icon');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const studentCard = btn.closest('.student-card');
                const studentId = studentCard.dataset.studentId;
                
                if (btn.title.includes('message')) {
                    this.sendMessageToStudent(studentId);
                } else if (btn.title.includes('details')) {
                    this.showStudentDetails(studentId);
                } else if (btn.title.includes('Intervene')) {
                    this.interveneWithStudent(studentId);
                }
            });
        });
    }
    
    setupMonitoringControls() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshMonitoring');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshMonitoringData();
            });
        }
        
        // Search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterStudents(e.target.value);
            });
        }
        
        // Status filter
        const statusFilter = document.querySelector('.status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }
        
        // Chart period buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChartPeriod(btn.dataset.period);
            });
        });
        
        // Clear activity
        const clearBtn = document.getElementById('clearActivity');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearActivityLog();
            });
        }
    }
    
    setupCharts() {
        // Focus heatmap chart
        const focusCtx = document.getElementById('focusHeatmap');
        if (focusCtx) {
            this.charts.focusHeatmap = new Chart(focusCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['-30m', '-25m', '-20m', '-15m', '-10m', '-5m', 'Now'],
                    datasets: [
                        {
                            label: 'Average Focus',
                            data: [78, 82, 85, 83, 80, 82, 85],
                            borderColor: 'rgb(76, 201, 240)',
                            backgroundColor: 'rgba(76, 201, 240, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 50,
                            max: 100,
                            grid: { display: false }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // Emotion chart
        const emotionCtx = document.getElementById('emotionChart');
        if (emotionCtx) {
            this.charts.emotionChart = new Chart(emotionCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Focused', 'Engaged', 'Distracted', 'Struggling'],
                    datasets: [{
                        data: [45, 30, 15, 10],
                        backgroundColor: [
                            'rgb(76, 201, 240)',
                            'rgb(67, 97, 238)',
                            'rgb(245, 158, 11)',
                            'rgb(239, 68, 68)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }
    
    startMonitoring() {
        // Update data every 10 seconds
        this.monitoringInterval = setInterval(() => {
            this.updateLiveData();
        }, 10000);
    }
    
    updateLiveData() {
        // Simulate live data updates
        this.students.forEach(student => {
            // Random small fluctuations
            if (student.focus) {
                student.focus = Math.max(30, Math.min(100, 
                    student.focus + (Math.random() * 6 - 3)));
            }
            
            if (student.engagement) {
                student.engagement = Math.max(40, Math.min(100,
                    student.engagement + (Math.random() * 4 - 2)));
            }
            
            // Update session duration
            if (student.sessionDuration) {
                student.sessionDuration += 1;
            }
            
            student.lastUpdate = new Date().toISOString();
        });
        
        // Update UI
        this.updateMonitoringStats();
        this.renderStudentsList();
        
        // Update charts
        this.updateCharts();
        
        // Log activity
        this.logActivity('Live data updated');
    }
    
    updateCharts() {
        if (this.charts.focusHeatmap) {
            // Shift data and add new point
            const data = this.charts.focusHeatmap.data.datasets[0].data;
            data.shift();
            const avgFocus = Math.round(this.students.reduce((sum, s) => sum + s.focus, 0) / this.students.length);
            data.push(avgFocus);
            this.charts.focusHeatmap.update();
        }
    }
    
    refreshMonitoringData() {
        this.loadMonitoringData();
        this.showNotification('Monitoring data refreshed', 'success');
    }
    
    filterStudents(searchTerm) {
        const filtered = this.students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.currentActivity?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Update display logic would go here
        console.log('Filtering students:', searchTerm, filtered.length);
    }
    
    filterByStatus(status) {
        // Filter logic would go here
        console.log('Filtering by status:', status);
    }
    
    updateChartPeriod(period) {
        // Update chart data based on period
        console.log('Updating chart period:', period);
    }
    
    showStudentDetails(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const modalContent = `
            <div class="student-details-modal">
                <div class="student-header">
                    <div class="student-avatar-large">${student.avatar}</div>
                    <div class="student-info-large">
                        <h3>${student.name}</h3>
                        <div class="student-meta">
                            <span class="badge">${student.grade}</span>
                            <span class="badge">Active for ${student.sessionDuration} min</span>
                        </div>
                    </div>
                </div>
                
                <div class="student-metrics-detailed">
                    <div class="metric-card">
                        <div class="metric-value">${student.focus}%</div>
                        <div class="metric-label">Focus Level</div>
                        <div class="metric-trend ${student.focus > 70 ? 'up' : 'down'}">
                            ${student.focus > 70 ? '↗️' : '↘️'} Last 5 min
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${student.engagement}%</div>
                        <div class="metric-label">Engagement</div>
                        <div class="metric-trend ${student.engagement > 70 ? 'up' : 'down'}">
                            ${student.engagement > 70 ? '↗️' : '↘️'} Last 5 min
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${this.getEmotionIcon(student.emotion)}</div>
                        <div class="metric-label">Current Emotion</div>
                        <div class="metric-description">${this.getEmotionDescription(student.emotion)}</div>
                    </div>
                </div>
                
                <div class="student-activity-details">
                    <h4>Current Activity</h4>
                    <div class="activity-card">
                        <div class="activity-icon">📚</div>
                        <div class="activity-content">
                            <div class="activity-title">${student.currentActivity}</div>
                            <div class="activity-timer">${student.sessionDuration} minutes elapsed</div>
                        </div>
                    </div>
                </div>
                
                <div class="student-actions-detailed">
                    <button class="btn btn-primary" id="sendMessageBtn">Send Message</button>
                    <button class="btn btn-secondary" id="adjustDifficulty">Adjust Difficulty</button>
                    <button class="btn btn-secondary" id="scheduleCheckin">Schedule Check-in</button>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Student Details',
            content: modalContent,
            size: 'large',
            onShow: () => {
                // Setup action buttons
                document.getElementById('sendMessageBtn').addEventListener('click', () => {
                    this.sendMessageToStudent(studentId);
                });
                
                document.getElementById('adjustDifficulty').addEventListener('click', () => {
                    this.adjustDifficulty(studentId);
                });
                
                document.getElementById('scheduleCheckin').addEventListener('click', () => {
                    this.scheduleCheckin(studentId);
                });
            }
        });
    }
    
    getEmotionDescription(emotion) {
        const descriptions = {
            'focused': 'Fully concentrated on task',
            'happy': 'Showing positive engagement',
            'engaged': 'Actively participating',
            'distracted': 'Attention appears divided',
            'frustrated': 'Showing signs of frustration',
            'confused': 'May need clarification'
        };
        return descriptions[emotion] || 'Normal engagement level';
    }
    
    sendMessageToStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const modalContent = `
            <div class="message-modal">
                <div class="form-group">
                    <label>To: ${student.name}</label>
                    <textarea class="form-control" rows="4" 
                              placeholder="Type your message to ${student.name}..."></textarea>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" checked>
                        Include encouragement from learning agent
                    </label>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Send Message',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="sendMessage">Send Message</button>
                <button class="btn btn-secondary" id="cancelMessage">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('sendMessage').addEventListener('click', () => {
                    TeacherApp.showNotification(`Message sent to ${student.name}`, 'success');
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelMessage').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    adjustDifficulty(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const modalContent = `
            <div class="difficulty-modal">
                <p>Adjust difficulty level for ${student.name}:</p>
                <div class="difficulty-options">
                    <label class="radio-label">
                        <input type="radio" name="difficulty" value="easier" checked>
                        <span>Easier (More support, slower pace)</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="difficulty" value="current">
                        <span>Current Level</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="difficulty" value="challenging">
                        <span>More Challenging</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="difficulty" value="adaptive">
                        <span>Adaptive (AI-optimized)</span>
                    </label>
                </div>
                <div class="form-group">
                    <label>Duration:</label>
                    <select class="select-control">
                        <option value="session">This session only</option>
                        <option value="day">Rest of today</option>
                        <option value="week">Next week</option>
                        <option value="permanent">Permanent change</option>
                    </select>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Adjust Difficulty',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="applyDifficulty">Apply Changes</button>
                <button class="btn btn-secondary" id="cancelDifficulty">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('applyDifficulty').addEventListener('click', () => {
                    TeacherApp.showNotification(`Difficulty adjusted for ${student.name}`, 'success');
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelDifficulty').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    scheduleCheckin(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const modalContent = `
            <div class="checkin-modal">
                <div class="form-group">
                    <label>Schedule check-in with ${student.name}</label>
                    <input type="datetime-local" class="form-control" 
                           min="${new Date().toISOString().slice(0, 16)}">
                </div>
                <div class="form-group">
                    <label>Check-in Type:</label>
                    <select class="select-control">
                        <option value="progress">Progress Review</option>
                        <option value="difficulty">Difficulty Adjustment</option>
                        <option value="motivation">Motivation Check</option>
                        <option value="general">General Check-in</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notes (optional):</label>
                    <textarea class="form-control" rows="3" 
                              placeholder="Add any specific points to discuss..."></textarea>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Schedule Check-in',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="scheduleCheckinBtn">Schedule</button>
                <button class="btn btn-secondary" id="cancelCheckin">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('scheduleCheckinBtn').addEventListener('click', () => {
                    TeacherApp.showNotification(`Check-in scheduled for ${student.name}`, 'success');
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelCheckin').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    interveneWithStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        // Get agent intervention suggestions
        const suggestions = this.getInterventionSuggestions(student);
        
        const modalContent = `
            <div class="intervention-modal">
                <p>${student.name} may need support. Suggested interventions:</p>
                <div class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <div class="suggestion-icon">${suggestion.icon}</div>
                            <div class="suggestion-content">
                                <div class="suggestion-title">${suggestion.title}</div>
                                <div class="suggestion-description">${suggestion.description}</div>
                            </div>
                            <button class="btn btn-sm btn-primary" data-action="${suggestion.action}">
                                Apply
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="form-group">
                    <label>Or choose custom intervention:</label>
                    <select class="select-control" id="customIntervention">
                        <option value="">Select intervention...</option>
                        <option value="break">Suggest a break</option>
                        <option value="simplify">Simplify current task</option>
                        <option value="motivate">Send motivation message</option>
                        <option value="redirect">Redirect to different activity</option>
                        <option value="agent">Let agent handle it</option>
                    </select>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Student Intervention',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="applyIntervention">Apply Intervention</button>
                <button class="btn btn-secondary" id="cancelIntervention">Cancel</button>
            `,
            onShow: () => {
                // Setup suggestion buttons
                document.querySelectorAll('.suggestion-item .btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = btn.dataset.action;
                        this.applyIntervention(studentId, action);
                        document.querySelector('.modal').remove();
                    });
                });
                
                // Apply custom intervention
                document.getElementById('applyIntervention').addEventListener('click', () => {
                    const customAction = document.getElementById('customIntervention').value;
                    if (customAction) {
                        this.applyIntervention(studentId, customAction);
                        document.querySelector('.modal').remove();
                    }
                });
                
                document.getElementById('cancelIntervention').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    getInterventionSuggestions(student) {
        const suggestions = [];
        
        if (student.focus < 60) {
            suggestions.push({
                icon: '⏸️',
                title: 'Suggest Break',
                description: 'Student appears distracted. A short break may help.',
                action: 'break'
            });
        }
        
        if (student.engagement < 65) {
            suggestions.push({
                icon: '🎯',
                title: 'Adjust Difficulty',
                description: 'Task may be too challenging. Consider adjusting difficulty.',
                action: 'adjust'
            });
        }
        
        suggestions.push({
            icon: '💬',
            title: 'Send Encouragement',
            description: 'A motivational message might boost engagement.',
            action: 'encourage'
        });
        
        suggestions.push({
            icon: '🤖',
            title: 'Agent Assistance',
            description: 'Let the learning agent provide personalized support.',
            action: 'agent'
        });
        
        return suggestions;
    }
    
    applyIntervention(studentId, action) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const messages = {
            'break': `Suggested a break to ${student.name}`,
            'adjust': `Adjusted difficulty for ${student.name}`,
            'encourage': `Sent encouragement to ${student.name}`,
            'agent': `Learning agent is assisting ${student.name}`
        };
        
        this.logActivity(messages[action] || `Intervention applied to ${student.name}`);
        TeacherApp.showNotification(`Intervention applied to ${student.name}`, 'success');
        
        // Simulate intervention effect
        if (action === 'break' || action === 'encourage') {
            // Simulate improved focus after intervention
            setTimeout(() => {
                if (student.focus < 90) {
                    student.focus += 15;
                    this.updateMonitoringStats();
                    this.renderStudentsList();
                }
            }, 2000);
        }
    }
    
    logActivity(message) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">📝</div>
            <div class="activity-content">
                <div class="activity-text">${message}</div>
                <div class="activity-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Limit to 10 items
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }
    
    clearActivityLog() {
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = '';
            this.logActivity('Activity log cleared');
        }
    }
    
    showError(message) {
        TeacherApp.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        TeacherApp.showNotification(message, type);
    }
    
    // Cleanup on page unload
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.charts.focusHeatmap) {
            this.charts.focusHeatmap.destroy();
        }
        
        if (this.charts.emotionChart) {
            this.charts.emotionChart.destroy();
        }
    }
}

// Initialize monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isTeacher()) {
        window.TeacherMonitoring = new TeacherMonitoring();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.TeacherMonitoring) {
        TeacherMonitoring.destroy();
    }
});