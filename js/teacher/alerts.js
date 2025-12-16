// js/teacher/alerts.js
class TeacherAlerts {
    constructor() {
        this.alerts = [];
        this.filteredAlerts = [];
        this.currentFilters = {
            status: 'all',
            severity: 'all',
            type: 'all',
            search: ''
        };
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isTeacher()) {
            window.location.href = '../../index.html';
            return;
        }
        
        this.loadAlerts();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        
        console.log('Teacher alerts initialized');
    }
    
    async loadAlerts() {
        try {
            // Try to load from teacher app first
            if (window.TeacherApp) {
                const teacherData = Storage.get('teacher_data');
                this.alerts = teacherData?.alerts || [];
            }
            
            // If no alerts, load mock data
            if (this.alerts.length === 0) {
                this.alerts = await this.getMockAlerts();
            }
            
            this.filteredAlerts = [...this.alerts];
            this.renderAlerts();
            
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.alerts = await this.getMockAlerts();
            this.filteredAlerts = [...this.alerts];
            this.renderAlerts();
        }
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
                time: new Date(Date.now() - 45 * 60000).toISOString(),
                tags: ['focus', 'engagement'],
                status: 'unread',
                priority: 1
            },
            {
                id: 'a2',
                studentId: 's4',
                studentName: 'Sarah Williams',
                type: 'progress',
                severity: 'medium',
                message: 'Student is falling behind in Mathematics. Current score is 20% below class average.',
                time: new Date(Date.now() - 90 * 60000).toISOString(),
                tags: ['progress', 'math'],
                status: 'unread',
                priority: 2
            },
            {
                id: 'a3',
                studentId: 's1',
                studentName: 'Alex Johnson',
                type: 'emotion',
                severity: 'low',
                message: 'Student appears to be frustrated with current exercise.',
                time: new Date(Date.now() - 120 * 60000).toISOString(),
                tags: ['emotion', 'support'],
                status: 'read',
                priority: 3
            },
            {
                id: 'a4',
                studentId: 's5',
                studentName: 'James Miller',
                type: 'engagement',
                severity: 'medium',
                message: 'Student engagement has decreased significantly during reading activities.',
                time: new Date(Date.now() - 180 * 60000).toISOString(),
                tags: ['engagement', 'reading'],
                status: 'read',
                priority: 2
            },
            {
                id: 'a5',
                studentId: 's3',
                studentName: 'David Chen',
                type: 'achievement',
                severity: 'low',
                message: 'Student completed "Advanced Fractions" module with perfect score!',
                time: new Date(Date.now() - 240 * 60000).toISOString(),
                tags: ['achievement', 'math'],
                status: 'read',
                priority: 3
            }
        ];
    }
    
    setupEventListeners() {
        // Filter changes
        const filterElements = {
            'status-filter': 'status',
            'severity-filter': 'severity',
            'type-filter': 'type'
        };
        
        Object.entries(filterElements).forEach(([elementId, filterKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[filterKey] = e.target.value;
                    this.applyFilters();
                });
            }
        });
        
        // Search
        const searchInput = document.getElementById('search-alerts');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Bulk actions
        const selectAllBtn = document.getElementById('select-all');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
        
        const markReadBtn = document.getElementById('mark-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => this.bulkMarkAsRead());
        }
        
        const markUnreadBtn = document.getElementById('mark-unread');
        if (markUnreadBtn) {
            markUnreadBtn.addEventListener('click', () => this.bulkMarkAsUnread());
        }
        
        const deleteBtn = document.getElementById('delete-alerts');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.bulkDeleteAlerts());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-alerts');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAlerts());
        }
        
        // Clear filters
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time alerts every 30 seconds
        setInterval(() => {
            this.checkForNewAlerts();
        }, 30000);
    }
    
    async checkForNewAlerts() {
        // In a real app, this would check an API for new alerts
        const shouldGenerateAlert = Math.random() > 0.7; // 30% chance
        
        if (shouldGenerateAlert) {
            const newAlert = await this.generateRandomAlert();
            this.addAlert(newAlert);
            
            // Show notification
            this.showNewAlertNotification(newAlert);
        }
    }
    
    async generateRandomAlert() {
        const students = [
            { id: 's1', name: 'Alex Johnson' },
            { id: 's2', name: 'Maria Garcia' },
            { id: 's3', name: 'David Chen' },
            { id: 's4', name: 'Sarah Williams' },
            { id: 's5', name: 'James Miller' }
        ];
        
        const alertTypes = [
            { type: 'focus', severity: 'high', tags: ['focus', 'engagement'] },
            { type: 'progress', severity: 'medium', tags: ['progress', 'math'] },
            { type: 'emotion', severity: 'low', tags: ['emotion', 'support'] },
            { type: 'engagement', severity: 'medium', tags: ['engagement', 'reading'] },
            { type: 'achievement', severity: 'low', tags: ['achievement', 'success'] }
        ];
        
        const student = students[Math.floor(Math.random() * students.length)];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const messages = {
            focus: 'Student showing decreased focus levels during current activity.',
            progress: 'Student is making slower than expected progress.',
            emotion: 'Student appears to be experiencing frustration.',
            engagement: 'Student engagement levels have dropped significantly.',
            achievement: 'Student achieved an important milestone!'
        };
        
        return {
            id: Utils.generateId('alert'),
            studentId: student.id,
            studentName: student.name,
            type: alertType.type,
            severity: alertType.severity,
            message: messages[alertType.type],
            time: new Date().toISOString(),
            tags: alertType.tags,
            status: 'unread',
            priority: alertType.severity === 'high' ? 1 : alertType.severity === 'medium' ? 2 : 3
        };
    }
    
    renderAlerts() {
        const container = document.getElementById('alerts-container');
        if (!container) return;
        
        if (this.filteredAlerts.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }
        
        // Sort alerts by priority and time (newest first)
        const sortedAlerts = this.filteredAlerts.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return new Date(b.time) - new Date(a.time);
        });
        
        container.innerHTML = `
            <div class="alerts-summary">
                <div class="summary-card total" onclick="TeacherAlerts.filterByStatus('all')">
                    <div class="summary-icon">📋</div>
                    <div class="summary-content">
                        <div class="summary-value">${this.alerts.length}</div>
                        <div class="summary-label">Total Alerts</div>
                    </div>
                </div>
                
                <div class="summary-card unread" onclick="TeacherAlerts.filterByStatus('unread')">
                    <div class="summary-icon">🔔</div>
                    <div class="summary-content">
                        <div class="summary-value">${this.getUnreadCount()}</div>
                        <div class="summary-label">Unread</div>
                    </div>
                </div>
                
                <div class="summary-card high" onclick="TeacherAlerts.filterBySeverity('high')">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <div class="summary-value">${this.getHighPriorityCount()}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                </div>
                
                <div class="summary-card resolved" onclick="TeacherAlerts.filterByStatus('resolved')">
                    <div class="summary-icon">✅</div>
                    <div class="summary-content">
                        <div class="summary-value">${this.getResolvedCount()}</div>
                        <div class="summary-label">Resolved</div>
                    </div>
                </div>
            </div>
            
            <div class="alerts-table-container">
                <table class="alerts-table">
                    <thead>
                        <tr>
                            <th class="alert-select">
                                <input type="checkbox" id="select-all-checkbox">
                            </th>
                            <th class="alert-student">Student</th>
                            <th class="alert-type">Type</th>
                            <th class="alert-severity">Severity</th>
                            <th class="alert-message">Message</th>
                            <th class="alert-time">Time</th>
                            <th class="alert-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="alerts-table-body">
                        ${sortedAlerts.map(alert => this.getAlertRow(alert)).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="bulk-actions" id="bulk-actions">
                <div class="bulk-selection">
                    <span id="selected-count">0 alerts selected</span>
                </div>
                <div class="bulk-buttons">
                    <button class="btn btn-sm btn-secondary" id="mark-read">Mark as Read</button>
                    <button class="btn btn-sm btn-secondary" id="mark-unread">Mark as Unread</button>
                    <button class="btn btn-sm btn-danger" id="delete-alerts">Delete</button>
                </div>
            </div>
        `;
        
        this.setupTableInteractions();
        this.updateSelectedCount();
    }
    
    getAlertRow(alert) {
        return `
            <tr class="alert-row ${alert.status} ${alert.severity}" data-alert-id="${alert.id}">
                <td class="alert-select">
                    <input type="checkbox" class="alert-checkbox" data-alert-id="${alert.id}">
                </td>
                <td class="alert-student">
                    <div class="student-cell">
                        <div class="student-avatar">${alert.studentName.charAt(0)}</div>
                        <div class="student-info">
                            <div class="student-name">${alert.studentName}</div>
                            <div class="student-details">${this.getAlertDetails(alert)}</div>
                        </div>
                    </div>
                </td>
                <td class="alert-type">
                    <span class="type-badge badge-${alert.type}">${alert.type}</span>
                </td>
                <td class="alert-severity">
                    <span class="severity-badge severity-${alert.severity}">
                        ${alert.severity}
                    </span>
                </td>
                <td class="alert-message">
                    <div class="message-preview">${alert.message}</div>
                    <div class="alert-tags">
                        ${alert.tags.map(tag => `<span class="alert-tag tag-${tag}">${tag}</span>`).join('')}
                        ${alert.status === 'unread' ? '<span class="alert-tag new">NEW</span>' : ''}
                    </div>
                </td>
                <td class="alert-time">
                    ${Utils.formatDate(alert.time, 'relative')}
                </td>
                <td class="alert-actions">
                    <div class="action-buttons">
                        <button class="btn-icon" title="View details" data-action="view">
                            <span>👁️</span>
                        </button>
                        <button class="btn-icon" title="Mark as read" data-action="read">
                            <span>📖</span>
                        </button>
                        <button class="btn-icon" title="Resolve" data-action="resolve">
                            <span>✅</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    getAlertDetails(alert) {
        switch (alert.type) {
            case 'focus': return 'Focus level alert';
            case 'progress': return 'Academic progress';
            case 'emotion': return 'Emotional state';
            case 'engagement': return 'Engagement level';
            case 'achievement': return 'Positive achievement';
            default: return 'Learning alert';
        }
    }
    
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">No Alerts Found</div>
                <div class="empty-message">
                    ${this.currentFilters.status !== 'all' || 
                      this.currentFilters.severity !== 'all' || 
                      this.currentFilters.type !== 'all' || 
                      this.currentFilters.search ?
                      'Try adjusting your filters to see more alerts.' :
                      'All caught up! No alerts at the moment.'}
                </div>
                ${this.currentFilters.status !== 'all' || 
                  this.currentFilters.severity !== 'all' || 
                  this.currentFilters.type !== 'all' || 
                  this.currentFilters.search ?
                  '<button class="btn btn-primary" id="clear-filters">Clear All Filters</button>' : ''}
            </div>
        `;
    }
    
    getUnreadCount() {
        return this.alerts.filter(a => a.status === 'unread').length;
    }
    
    getHighPriorityCount() {
        return this.alerts.filter(a => a.severity === 'high').length;
    }
    
    getResolvedCount() {
        return this.alerts.filter(a => a.status === 'resolved').length;
    }
    
    setupTableInteractions() {
        // Alert row clicks
        const alertRows = document.querySelectorAll('.alert-row');
        alertRows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.action-buttons') && !e.target.closest('.alert-select')) {
                    const alertId = row.dataset.alertId;
                    this.showAlertDetails(alertId);
                }
            });
        });
        
        // Action buttons
        const actionButtons = document.querySelectorAll('.action-buttons .btn-icon');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.closest('.alert-row').dataset.alertId;
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'view':
                        this.showAlertDetails(alertId);
                        break;
                    case 'read':
                        this.markAsRead(alertId);
                        break;
                    case 'resolve':
                        this.resolveAlert(alertId);
                        break;
                }
            });
        });
        
        // Checkbox selection
        const checkboxes = document.querySelectorAll('.alert-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedCount();
            });
        });
        
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                checkboxes.forEach(cb => cb.checked = isChecked);
                this.updateSelectedCount();
            });
        }
    }
    
    applyFilters() {
        this.filteredAlerts = this.alerts.filter(alert => {
            // Status filter
            if (this.currentFilters.status !== 'all' && 
                alert.status !== this.currentFilters.status) {
                return false;
            }
            
            // Severity filter
            if (this.currentFilters.severity !== 'all' && 
                alert.severity !== this.currentFilters.severity) {
                return false;
            }
            
            // Type filter
            if (this.currentFilters.type !== 'all' && 
                alert.type !== this.currentFilters.type) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    alert.studentName,
                    alert.message,
                    alert.type,
                    alert.severity,
                    ...alert.tags
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderAlerts();
    }
    
    filterByStatus(status) {
        this.currentFilters.status = status;
        document.getElementById('status-filter').value = status;
        this.applyFilters();
    }
    
    filterBySeverity(severity) {
        this.currentFilters.severity = severity;
        document.getElementById('severity-filter').value = severity;
        this.applyFilters();
    }
    
    filterByType(type) {
        this.currentFilters.type = type;
        document.getElementById('type-filter').value = type;
        this.applyFilters();
    }
    
    clearFilters() {
        this.currentFilters = {
            status: 'all',
            severity: 'all',
            type: 'all',
            search: ''
        };
        
        // Reset filter controls
        document.getElementById('status-filter').value = 'all';
        document.getElementById('severity-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('search-alerts').value = '';
        
        this.applyFilters();
    }
    
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        const isChecked = selectAllCheckbox?.checked || false;
        
        const checkboxes = document.querySelectorAll('.alert-checkbox');
        checkboxes.forEach(cb => cb.checked = !isChecked);
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = !isChecked;
        }
        
        this.updateSelectedCount();
    }
    
    updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.alert-checkbox:checked');
        const selectedCount = selectedCheckboxes.length;
        const totalCount = document.querySelectorAll('.alert-checkbox').length;
        
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = `${selectedCount} of ${totalCount} alerts selected`;
        }
        
        // Update select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
        }
    }
    
    getSelectedAlertIds() {
        const selectedCheckboxes = document.querySelectorAll('.alert-checkbox:checked');
        return Array.from(selectedCheckboxes).map(cb => cb.dataset.alertId);
    }
    
    bulkMarkAsRead() {
        const alertIds = this.getSelectedAlertIds();
        if (alertIds.length === 0) return;
        
        alertIds.forEach(alertId => this.markAsRead(alertId));
        
        this.showNotification(`${alertIds.length} alert(s) marked as read`, 'success');
    }
    
    bulkMarkAsUnread() {
        const alertIds = this.getSelectedAlertIds();
        if (alertIds.length === 0) return;
        
        alertIds.forEach(alertId => {
            const alert = this.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.status = 'unread';
            }
        });
        
        this.saveAlerts();
        this.renderAlerts();
        this.showNotification(`${alertIds.length} alert(s) marked as unread`, 'success');
    }
    
    bulkDeleteAlerts() {
        const alertIds = this.getSelectedAlertIds();
        if (alertIds.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${alertIds.length} alert(s)?`)) {
            this.alerts = this.alerts.filter(alert => !alertIds.includes(alert.id));
            this.saveAlerts();
            this.applyFilters();
            this.showNotification(`${alertIds.length} alert(s) deleted`, 'success');
        }
    }
    
    markAsRead(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && alert.status === 'unread') {
            alert.status = 'read';
            this.saveAlerts();
            this.updateAlertRow(alertId);
            this.showNotification('Alert marked as read', 'success');
        }
    }
    
    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'resolved';
            alert.resolvedAt = new Date().toISOString();
            this.saveAlerts();
            this.updateAlertRow(alertId);
            this.showNotification('Alert resolved', 'success');
        }
    }
    
    updateAlertRow(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        const row = document.querySelector(`.alert-row[data-alert-id="${alertId}"]`);
        if (row) {
            // Update status class
            row.classList.remove('unread', 'read', 'resolved');
            row.classList.add(alert.status);
            
            // Update new tag
            const newTag = row.querySelector('.new');
            if (newTag && alert.status !== 'unread') {
                newTag.remove();
            }
        }
    }
    
    showAlertDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        // Mark as read if unread
        if (alert.status === 'unread') {
            this.markAsRead(alertId);
        }
        
        const modalContent = `
            <div class="alert-details">
                <div class="alert-header">
                    <div class="alert-student-large">
                        <div class="student-avatar-large">${alert.studentName.charAt(0)}</div>
                        <div class="student-info-large">
                            <h3>${alert.studentName}</h3>
                            <div class="alert-meta">
                                <span class="severity-badge severity-${alert.severity}">
                                    ${alert.severity.toUpperCase()} PRIORITY
                                </span>
                                <span class="alert-time">${Utils.formatDate(alert.time, 'datetime')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert-content">
                    <div class="alert-message-full">
                        <h4>Alert Message</h4>
                        <p>${alert.message}</p>
                    </div>
                    
                    <div class="alert-context">
                        <h4>Context Information</h4>
                        <div class="context-grid">
                            <div class="context-item">
                                <div class="context-label">Alert Type</div>
                                <div class="context-value">${alert.type}</div>
                            </div>
                            <div class="context-item">
                                <div class="context-label">Status</div>
                                <div class="context-value">
                                    <span class="status-badge status-${alert.status}">
                                        ${alert.status}
                                    </span>
                                </div>
                            </div>
                            <div class="context-item">
                                <div class="context-label">Tags</div>
                                <div class="context-value">
                                    ${alert.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert-suggestions">
                        <h4>Recommended Actions</h4>
                        <ul class="suggestions-list">
                            ${this.getAlertSuggestions(alert).map(suggestion => `
                                <li>${suggestion}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="alert-timeline">
                        <h4>Timeline</h4>
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-time">${Utils.formatDate(alert.time, 'time')}</div>
                                <div class="timeline-content">Alert generated</div>
                            </div>
                            ${alert.resolvedAt ? `
                            <div class="timeline-item">
                                <div class="timeline-time">${Utils.formatDate(alert.resolvedAt, 'time')}</div>
                                <div class="timeline-content">Alert resolved</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        TeacherApp.showModal({
            title: 'Alert Details',
            content: modalContent,
            size: 'large',
            actions: `
                <button class="btn btn-primary" id="contactStudent">Contact Student</button>
                ${alert.status !== 'resolved' ? 
                  `<button class="btn btn-success" id="resolveAlert">Mark as Resolved</button>` : ''}
                <button class="btn btn-secondary" id="closeDetails">Close</button>
            `,
            onShow: () => {
                document.getElementById('contactStudent').addEventListener('click', () => {
                    this.contactStudent(alert.studentId);
                    document.querySelector('.modal').remove();
                });
                
                const resolveBtn = document.getElementById('resolveAlert');
                if (resolveBtn) {
                    resolveBtn.addEventListener('click', () => {
                        this.resolveAlert(alertId);
                        document.querySelector('.modal').remove();
                    });
                }
                
                document.getElementById('closeDetails').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    getAlertSuggestions(alert) {
        const suggestions = {
            focus: [
                'Check if the student needs a break',
                'Consider adjusting the difficulty level',
                'Send an encouraging message',
                'Schedule a one-on-one check-in'
            ],
            progress: [
                'Review the student\'s recent work',
                'Provide additional practice materials',
                'Consider peer tutoring',
                'Adjust learning pace'
            ],
            emotion: [
                'Send a supportive message',
                'Check in with the student',
                'Consider adjusting the content',
                'Provide positive reinforcement'
            ],
            engagement: [
                'Try different learning activities',
                'Incorporate interactive elements',
                'Set smaller, achievable goals',
                'Provide more immediate feedback'
            ],
            achievement: [
                'Congratulate the student',
                'Share the achievement with class',
                'Award bonus points or recognition',
                'Set new challenging goals'
            ]
        };
        
        return suggestions[alert.type] || [
            'Monitor the situation',
            'Check in with the student',
            'Review performance metrics',
            'Consider intervention if persists'
        ];
    }
    
    contactStudent(studentId) {
        // This would open the messaging interface
        console.log('Contacting student:', studentId);
        this.showNotification('Opening messaging interface...', 'info');
    }
    
    addAlert(newAlert) {
        this.alerts.unshift(newAlert);
        this.saveAlerts();
        
        // Update filtered alerts if needed
        if (this.shouldShowInFilter(newAlert)) {
            this.filteredAlerts.unshift(newAlert);
            this.renderAlerts();
        }
    }
    
    shouldShowInFilter(alert) {
        // Check if alert matches current filters
        if (this.currentFilters.status !== 'all' && 
            alert.status !== this.currentFilters.status) {
            return false;
        }
        
        if (this.currentFilters.severity !== 'all' && 
            alert.severity !== this.currentFilters.severity) {
            return false;
        }
        
        if (this.currentFilters.type !== 'all' && 
            alert.type !== this.currentFilters.type) {
            return false;
        }
        
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            const searchableText = [
                alert.studentName,
                alert.message,
                alert.type,
                alert.severity,
                ...alert.tags
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    }
    
    saveAlerts() {
        // Save to teacher data
        if (window.TeacherApp) {
            const teacherData = Storage.get('teacher_data') || {};
            teacherData.alerts = this.alerts;
            Storage.set('teacher_data', teacherData);
        } else {
            Storage.set('teacher_alerts', this.alerts);
        }
    }
    
    refreshAlerts() {
        this.loadAlerts();
        this.showNotification('Alerts refreshed', 'success');
    }
    
    showNewAlertNotification(alert) {
        // Create desktop notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Alert', {
                body: `${alert.studentName}: ${alert.message}`,
                icon: '/favicon.ico',
                tag: 'alert-notification'
            });
        }
        
        // Show in-app notification
        this.showNotification(`New alert: ${alert.studentName} - ${alert.type}`, 'warning');
    }
    
    showNotification(message, type = 'info') {
        if (window.TeacherApp && TeacherApp.showNotification) {
            TeacherApp.showNotification(message, type);
        } else {
            // Fallback notification
            UIComponents.showToast(message, type);
        }
    }
}

// Initialize alerts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isTeacher()) {
        window.TeacherAlerts = new TeacherAlerts();
    }
});