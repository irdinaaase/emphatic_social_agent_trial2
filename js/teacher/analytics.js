// js/teacher/analytics.js
class TeacherAnalytics {
    constructor() {
        this.data = {
            performance: [],
            engagement: [],
            progress: [],
            predictions: []
        };
        this.dateRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
        };
        this.filters = {
            subject: 'all',
            grade: 'all',
            student: 'all'
        };
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isTeacher()) {
            window.location.href = '../../index.html';
            return;
        }
        
        this.loadAnalyticsData();
        this.setupEventListeners();
        this.renderCharts();
        
        console.log('Teacher analytics initialized');
    }
    
    async loadAnalyticsData() {
        try {
            // Try to load from teacher app
            if (window.TeacherApp) {
                const teacherData = Storage.get('teacher_data');
                this.data = teacherData?.analytics || await this.getMockData();
            } else {
                this.data = await this.getMockData();
            }
            
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.data = await this.getMockData();
        }
    }
    
    async getMockData() {
        // Generate mock analytics data
        const subjects = ['Mathematics', 'Science', 'English', 'History', 'Art'];
        const students = [
            { id: 's1', name: 'Alex Johnson', grade: '5A' },
            { id: 's2', name: 'Maria Garcia', grade: '5B' },
            { id: 's3', name: 'David Chen', grade: '5A' },
            { id: 's4', name: 'Sarah Williams', grade: '5B' },
            { id: 's5', name: 'James Miller', grade: '5A' }
        ];
        
        // Generate performance data
        const performance = [];
        students.forEach(student => {
            subjects.forEach(subject => {
                performance.push({
                    studentId: student.id,
                    studentName: student.name,
                    subject: subject,
                    grade: student.grade,
                    score: Math.floor(Math.random() * 40) + 60, // 60-100
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    change: Math.floor(Math.random() * 20) - 10 // -10 to +10
                });
            });
        });
        
        // Generate engagement data (daily for last 30 days)
        const engagement = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
            engagement.push({
                date: date.toISOString().split('T')[0],
                averageFocus: Math.floor(Math.random() * 40) + 60,
                averageEngagement: Math.floor(Math.random() * 40) + 60,
                totalTime: Math.floor(Math.random() * 300) + 120,
                completedActivities: Math.floor(Math.random() * 10) + 5
            });
        }
        
        // Generate progress data
        const progress = students.map(student => {
            const subjectsProgress = {};
            subjects.forEach(subject => {
                subjectsProgress[subject] = Math.floor(Math.random() * 40) + 60;
            });
            
            return {
                studentId: student.id,
                studentName: student.name,
                grade: student.grade,
                overallProgress: Math.floor(Math.random() * 40) + 60,
                subjects: subjectsProgress,
                weeklyChange: Math.floor(Math.random() * 20) - 5
            };
        });
        
        // Generate predictions
        const predictions = students.map(student => {
            const riskFactors = [];
            if (Math.random() > 0.7) riskFactors.push('focus');
            if (Math.random() > 0.7) riskFactors.push('engagement');
            if (Math.random() > 0.7) riskFactors.push('progress');
            
            return {
                studentId: student.id,
                studentName: student.name,
                riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 1 ? 'medium' : 'low',
                riskFactors: riskFactors,
                predictedScore: Math.floor(Math.random() * 30) + 70,
                confidence: Math.floor(Math.random() * 30) + 70
            };
        });
        
        return {
            performance,
            engagement,
            progress,
            predictions
        };
    }
    
    setupEventListeners() {
        // Date range picker
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.value = this.formatDateForInput(this.dateRange.start);
            startDateInput.addEventListener('change', (e) => {
                this.dateRange.start = new Date(e.target.value);
                this.updateCharts();
            });
        }
        
        if (endDateInput) {
            endDateInput.value = this.formatDateForInput(this.dateRange.end);
            endDateInput.addEventListener('change', (e) => {
                this.dateRange.end = new Date(e.target.value);
                this.updateCharts();
            });
        }
        
        // Quick date buttons
        const quickDateButtons = document.querySelectorAll('.quick-date-btn');
        quickDateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.setDateRange(period);
                
                // Update active button
                quickDateButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Filters
        const filterElements = {
            'subjectFilter': 'subject',
            'gradeFilter': 'grade',
            'studentFilter': 'student'
        };
        
        Object.entries(filterElements).forEach(([elementId, filterKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[filterKey] = e.target.value;
                    this.updateCharts();
                });
            }
        });
        
        // Export buttons
        const exportPdfBtn = document.getElementById('exportPdf');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }
        
        const exportCsvBtn = document.getElementById('exportCsv');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        }
        
        // Chart action buttons
        const refreshBtn = document.getElementById('refreshCharts');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }
    
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
    
    setDateRange(period) {
        const end = new Date();
        let start;
        
        switch(period) {
            case 'today':
                start = new Date();
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start = new Date(end);
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start = new Date(end);
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start = new Date(end);
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start = new Date(end);
                start.setMonth(start.getMonth() - 3);
                break;
            default:
                start = new Date(end);
                start.setFullYear(start.getFullYear() - 1);
        }
        
        this.dateRange = { start, end };
        
        // Update date inputs
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = this.formatDateForInput(start);
        if (endDateInput) endDateInput.value = this.formatDateForInput(end);
        
        this.updateCharts();
    }
    
    renderCharts() {
        this.renderSummaryCards();
        this.renderEngagementChart();
        this.renderPerformanceChart();
        this.renderProgressChart();
        this.renderPredictions();
        this.renderLeaderboard();
    }
    
    renderSummaryCards() {
        const filteredData = this.getFilteredData();
        
        const summaryData = {
            averageScore: this.calculateAverageScore(filteredData.performance),
            totalStudents: new Set(filteredData.performance.map(p => p.studentId)).size,
            totalEngagement: this.calculateAverageEngagement(filteredData.engagement),
            improvementRate: this.calculateImprovementRate(filteredData.progress)
        };
        
        const container = document.getElementById('analyticsSummary');
        if (!container) return;
        
        container.innerHTML = `
            <div class="summary-card-analytics primary">
                <div class="summary-header">
                    <div class="summary-title">Average Score</div>
                    <div class="summary-icon">📊</div>
                </div>
                <div class="summary-value">${summaryData.averageScore}%</div>
                <div class="summary-change positive">
                    <span>↗</span>
                    <span>+2.5% from last week</span>
                </div>
            </div>
            
            <div class="summary-card-analytics success">
                <div class="summary-header">
                    <div class="summary-title">Active Students</div>
                    <div class="summary-icon">👥</div>
                </div>
                <div class="summary-value">${summaryData.totalStudents}</div>
                <div class="summary-change positive">
                    <span>↗</span>
                    <span>+3 from last week</span>
                </div>
            </div>
            
            <div class="summary-card-analytics warning">
                <div class="summary-header">
                    <div class="summary-title">Engagement</div>
                    <div class="summary-icon">🎯</div>
                </div>
                <div class="summary-value">${summaryData.totalEngagement}%</div>
                <div class="summary-change negative">
                    <span>↘</span>
                    <span>-1.2% from last week</span>
                </div>
            </div>
            
            <div class="summary-card-analytics info">
                <div class="summary-header">
                    <div class="summary-title">Improvement Rate</div>
                    <div class="summary-icon">📈</div>
                </div>
                <div class="summary-value">${summaryData.improvementRate}%</div>
                <div class="summary-change positive">
                    <span>↗</span>
                    <span>+4.8% from last week</span>
                </div>
            </div>
        `;
    }
    
    renderEngagementChart() {
        const engagementData = this.getFilteredData().engagement;
        const container = document.getElementById('engagementChart');
        if (!container) return;
        
        // In a real app, use Chart.js or similar
        container.innerHTML = `
            <div class="chart-content">
                <div class="chart-placeholder">
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div>
                        <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Engagement Over Time Chart
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            Showing ${engagementData.length} days of engagement data
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPerformanceChart() {
        const performanceData = this.getFilteredData().performance;
        const container = document.getElementById('performanceChart');
        if (!container) return;
        
        container.innerHTML = `
            <div class="chart-content">
                <div class="chart-placeholder">
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                        <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Performance by Subject Chart
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            Showing performance across subjects
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderProgressChart() {
        const progressData = this.getFilteredData().progress;
        const container = document.getElementById('progressChart');
        if (!container) return;
        
        container.innerHTML = `
            <div class="chart-content">
                <div class="chart-placeholder">
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📐</div>
                        <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Student Progress Chart
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            Showing individual student progress
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPredictions() {
        const predictions = this.getFilteredData().predictions;
        const container = document.getElementById('predictionsList');
        if (!container) return;
        
        if (predictions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🤖</div>
                    <div class="empty-title">No Predictions Available</div>
                    <div class="empty-message">
                        Not enough data to generate predictions for the selected filters.
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h3>AI Predictions & Insights</h3>
            <div class="metric-list">
                ${predictions.map(prediction => this.getPredictionItem(prediction)).join('')}
            </div>
        `;
    }
    
    getPredictionItem(prediction) {
        const riskColor = {
            high: 'danger',
            medium: 'warning',
            low: 'success'
        }[prediction.riskLevel];
        
        return `
            <div class="metric-item">
                <div class="metric-info">
                    <div class="metric-label">${prediction.studentName}</div>
                    <div class="metric-value">
                        Predicted score: ${prediction.predictedScore}%
                        <span class="confidence">(${prediction.confidence}% confidence)</span>
                    </div>
                </div>
                <div class="metric-progress">
                    <div class="metric-progress-fill" style="width: ${prediction.predictedScore}%"></div>
                </div>
                <div class="risk-badge risk-${riskColor}">
                    ${prediction.riskLevel.toUpperCase()} RISK
                </div>
            </div>
        `;
    }
    
    renderLeaderboard() {
        const progressData = this.getFilteredData().progress;
        const container = document.getElementById('leaderboardTable');
        if (!container) return;
        
        // Sort by progress
        const sortedProgress = [...progressData].sort((a, b) => b.overallProgress - a.overallProgress);
        
        container.innerHTML = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th class="rank-cell">Rank</th>
                        <th>Student</th>
                        <th>Grade</th>
                        <th>Progress</th>
                        <th>Weekly Change</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedProgress.map((student, index) => this.getLeaderboardRow(student, index + 1)).join('')}
                </tbody>
            </table>
        `;
    }
    
    getLeaderboardRow(student, rank) {
        const changeClass = student.weeklyChange >= 0 ? 'positive' : 'negative';
        const changeIcon = student.weeklyChange >= 0 ? '↗' : '↘';
        
        return `
            <tr class="rank-${rank}">
                <td class="rank-cell">${rank}</td>
                <td>
                    <div class="student-cell-leaderboard">
                        <div class="student-avatar">${student.studentName.charAt(0)}</div>
                        <div class="student-info">
                            <div class="student-name">${student.studentName}</div>
                        </div>
                    </div>
                </td>
                <td class="score-cell">${student.grade}</td>
                <td>
                    <div class="progress-cell">
                        <div class="metric-progress">
                            <div class="metric-progress-fill" style="width: ${student.overallProgress}%"></div>
                        </div>
                        <div class="progress-value">${student.overallProgress}%</div>
                    </div>
                </td>
                <td class="${changeClass}">
                    ${changeIcon} ${Math.abs(student.weeklyChange)}%
                </td>
            </tr>
        `;
    }
    
    getFilteredData() {
        let filteredPerformance = [...this.data.performance];
        let filteredProgress = [...this.data.progress];
        let filteredPredictions = [...this.data.predictions];
        
        // Apply subject filter
        if (this.filters.subject !== 'all') {
            filteredPerformance = filteredPerformance.filter(p => p.subject === this.filters.subject);
            filteredProgress = filteredProgress.map(p => ({
                ...p,
                overallProgress: p.subjects[this.filters.subject] || 0
            }));
        }
        
        // Apply grade filter
        if (this.filters.grade !== 'all') {
            filteredPerformance = filteredPerformance.filter(p => p.grade === this.filters.grade);
            filteredProgress = filteredProgress.filter(p => p.grade === this.filters.grade);
            filteredPredictions = filteredPredictions.filter(p => 
                filteredProgress.some(fp => fp.studentId === p.studentId)
            );
        }
        
        // Apply student filter
        if (this.filters.student !== 'all') {
            filteredPerformance = filteredPerformance.filter(p => p.studentId === this.filters.student);
            filteredProgress = filteredProgress.filter(p => p.studentId === this.filters.student);
            filteredPredictions = filteredPredictions.filter(p => p.studentId === this.filters.student);
        }
        
        // Filter engagement by date range
        const filteredEngagement = this.data.engagement.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= this.dateRange.start && entryDate <= this.dateRange.end;
        });
        
        return {
            performance: filteredPerformance,
            engagement: filteredEngagement,
            progress: filteredProgress,
            predictions: filteredPredictions
        };
    }
    
    calculateAverageScore(performanceData) {
        if (performanceData.length === 0) return 0;
        const total = performanceData.reduce((sum, p) => sum + p.score, 0);
        return Math.round(total / performanceData.length);
    }
    
    calculateAverageEngagement(engagementData) {
        if (engagementData.length === 0) return 0;
        const total = engagementData.reduce((sum, e) => sum + e.averageEngagement, 0);
        return Math.round(total / engagementData.length);
    }
    
    calculateImprovementRate(progressData) {
        if (progressData.length === 0) return 0;
        const total = progressData.reduce((sum, p) => sum + (p.weeklyChange > 0 ? p.weeklyChange : 0), 0);
        return Math.round(total / progressData.length);
    }
    
    updateCharts() {
        this.renderCharts();
        this.showToast('Charts updated', 'success');
    }
    
    refreshData() {
        this.loadAnalyticsData().then(() => {
            this.renderCharts();
            this.showToast('Data refreshed', 'success');
        });
    }
    
    resetFilters() {
        this.filters = {
            subject: 'all',
            grade: 'all',
            student: 'all'
        };
        
        // Reset filter controls
        document.getElementById('subjectFilter').value = 'all';
        document.getElementById('gradeFilter').value = 'all';
        document.getElementById('studentFilter').value = 'all';
        
        this.updateCharts();
        this.showToast('Filters reset', 'info');
    }
    
    async exportToPDF() {
        this.showToast('Generating PDF report...', 'info');
        
        // In a real app, this would generate and download a PDF
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.showToast('PDF report downloaded', 'success');
    }
    
    async exportToCSV() {
        this.showToast('Exporting CSV data...', 'info');
        
        const filteredData = this.getFilteredData();
        const csvContent = this.generateCSVContent(filteredData);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('CSV data exported', 'success');
    }
    
    generateCSVContent(data) {
        let csv = 'Category,Student,Subject,Score,Engagement,Progress,Date\n';
        
        // Add performance data
        data.performance.forEach(item => {
            csv += `Performance,${item.studentName},${item.subject},${item.score},,,${item.date || ''}\n`;
        });
        
        // Add engagement data
        data.engagement.forEach(item => {
            csv += `Engagement,,,${item.averageEngagement},${item.totalTime},,${item.date}\n`;
        });
        
        // Add progress data
        data.progress.forEach(item => {
            csv += `Progress,${item.studentName},,${item.overallProgress},,${item.weeklyChange},\n`;
        });
        
        return csv;
    }
    
    showToast(message, type = 'info') {
        // Use existing notification system
        if (window.TeacherApp && TeacherApp.showNotification) {
            TeacherApp.showNotification(message, type);
        } else {
            // Fallback to simple alert
            alert(message);
        }
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isTeacher()) {
        window.TeacherAnalytics = new TeacherAnalytics();
    }
});     