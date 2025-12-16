// js/teacher/teacher-global.js
/**
 * Teacher Global Functions
 * Shared functionality for all teacher pages
 */

class TeacherApp {
    constructor() {
        this.currentTeacher = null;
        this.students = [];
        this.classes = [];
        this.init();
    }
    
    async init() {
        if (!Auth.isLoggedIn() || !Auth.isTeacher()) {
            window.location.href = '../../index.html';
            return;
        }
        
        this.currentTeacher = Auth.getCurrentUser();
        await this.loadTeacherData();
        this.setupHeader();
        this.setupNavigation();
        this.setupEventListeners();
        
        console.log('Teacher app initialized');
    }
    
    async loadTeacherData() {
        try {
            // Load teacher data from storage/API
            const teacherData = Storage.get('teacher_data') || await this.getMockTeacherData();
            
            this.students = teacherData.students || [];
            this.classes = teacherData.classes || [];
            
            // Save back to storage
            Storage.set('teacher_data', {
                students: this.students,
                classes: this.classes,
                lastUpdated: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error loading teacher data:', error);
            // Fallback to mock data
            this.students = await this.getMockStudents();
            this.classes = await this.getMockClasses();
        }
    }
    
    async getMockTeacherData() {
        return {
            students: await this.getMockStudents(),
            classes: await this.getMockClasses()
        };
    }
    
    async getMockStudents() {
        return [
            {
                id: 's1',
                name: 'Alex Johnson',
                email: 'alex@example.com',
                grade: '5th',
                avatar: 'AJ',
                status: 'active',
                progress: 85,
                lastActive: '2024-01-15T10:30:00Z',
                needsAttention: false,
                subjects: {
                    math: { score: 90, trend: 'up' },
                    reading: { score: 85, trend: 'up' },
                    science: { score: 80, trend: 'same' }
                }
            },
            {
                id: 's2',
                name: 'Maria Garcia',
                email: 'maria@example.com',
                grade: '5th',
                avatar: 'MG',
                status: 'active',
                progress: 72,
                lastActive: '2024-01-15T09:15:00Z',
                needsAttention: true,
                attentionReason: 'Low engagement',
                subjects: {
                    math: { score: 65, trend: 'down' },
                    reading: { score: 75, trend: 'up' },
                    science: { score: 70, trend: 'same' }
                }
            }
        ];
    }
    
    async getMockClasses() {
        return [
            {
                id: 'c1',
                name: 'Math 5A',
                subject: 'Mathematics',
                grade: '5th',
                students: ['s1', 's2'],
                schedule: 'Mon/Wed 9:00 AM'
            },
            {
                id: 'c2',
                name: 'Science Explorers',
                subject: 'Science',
                grade: '5th',
                students: ['s1', 's2'],
                schedule: 'Tue/Thu 10:00 AM'
            }
        ];
    }
    
    setupHeader() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const teacherName = this.currentTeacher?.name || 'Teacher';
        const teacherAvatar = this.currentTeacher?.avatar || '👨‍🏫';
        
        header.innerHTML = `
            <div class="header-left">
                <div class="logo">
                    <span class="logo-icon">🤖</span>
                    <span class="logo-text">Empathic Learning</span>
                </div>
                <nav class="main-nav">
                    <a href="dashboard.html" class="nav-link">Dashboard</a>
                    <a href="students.html" class="nav-link">Students</a>
                    <a href="monitoring.html" class="nav-link">Monitoring</a>
                    <a href="alerts.html" class="nav-link">Alerts</a>
                    <a href="analytics.html" class="nav-link">Analytics</a>
                </nav>
            </div>
            <div class="header-right">
                <button class="btn-icon" id="notificationsBtn" title="Notifications">
                    <span class="icon">🔔</span>
                    <span class="badge">3</span>
                </button>
                <div class="user-menu">
                    <div class="user-avatar">${teacherAvatar}</div>
                    <div class="user-info">
                        <div class="user-name">${teacherName}</div>
                        <div class="user-role">Teacher</div>
                    </div>
                    <button class="btn-icon" id="userMenuBtn">▼</button>
                    <div class="dropdown-menu">
                        <a href="profile.html" class="dropdown-item">Profile</a>
                        <a href="../shared/settings.html" class="dropdown-item">Settings</a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" id="logoutBtn">Logout</button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup header interactions
        this.setupHeaderInteractions();
    }
    
    setupHeaderInteractions() {
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (userMenuBtn && dropdownMenu) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
        
        // Notifications
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                window.location.href = 'alerts.html';
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                window.location.href = '../../index.html';
            });
        }
    }
    
    setupNavigation() {
        // Highlight current page in navigation
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    setupEventListeners() {
        // Global keyboard shortcuts for teachers
        document.addEventListener('keydown', (e) => {
            // Quick search (Ctrl + K)
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // New student (Ctrl + N)
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.addNewStudent();
            }
        });
    }
    
    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    addNewStudent() {
        // This would open the add student modal
        console.log('Add new student triggered');
    }
    
    // Student management methods
    getStudents(filter = {}) {
        let filteredStudents = [...this.students];
        
        if (filter.status) {
            filteredStudents = filteredStudents.filter(s => s.status === filter.status);
        }
        
        if (filter.grade) {
            filteredStudents = filteredStudents.filter(s => s.grade === filter.grade);
        }
        
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredStudents = filteredStudents.filter(s => 
                s.name.toLowerCase().includes(searchTerm) ||
                s.email.toLowerCase().includes(searchTerm)
            );
        }
        
        return filteredStudents;
    }
    
    getStudentById(studentId) {
        return this.students.find(s => s.id === studentId);
    }
    
    async addStudent(studentData) {
        const newStudent = {
            id: Utils.generateId('student'),
            ...studentData,
            joined: new Date().toISOString(),
            status: 'active',
            progress: 0
        };
        
        this.students.push(newStudent);
        await this.saveTeacherData();
        
        return newStudent;
    }
    
    async updateStudent(studentId, updates) {
        const studentIndex = this.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return null;
        
        this.students[studentIndex] = {
            ...this.students[studentIndex],
            ...updates,
            updated: new Date().toISOString()
        };
        
        await this.saveTeacherData();
        return this.students[studentIndex];
    }
    
    async removeStudent(studentId) {
        this.students = this.students.filter(s => s.id !== studentId);
        await this.saveTeacherData();
        return true;
    }
    
    // Class management methods
    getClasses() {
        return this.classes;
    }
    
    getClassById(classId) {
        return this.classes.find(c => c.id === classId);
    }
    
    async addClass(classData) {
        const newClass = {
            id: Utils.generateId('class'),
            ...classData
        };
        
        this.classes.push(newClass);
        await this.saveTeacherData();
        
        return newClass;
    }
    
    // Utility methods
    async saveTeacherData() {
        try {
            Storage.set('teacher_data', {
                students: this.students,
                classes: this.classes,
                lastUpdated: new Date().toISOString()
            });
            
            // Trigger data update event
            document.dispatchEvent(new CustomEvent('teacher-data-updated'));
            
            return true;
        } catch (error) {
            console.error('Error saving teacher data:', error);
            return false;
        }
    }
    
    showNotification(message, type = 'info') {
        Utils.createNotification(message, type);
    }
    
    showModal(options) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal modal-${options.size || 'medium'}">
                    <div class="modal-header">
                        <h3>${options.title}</h3>
                        <button class="modal-close">&times;</button>
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
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.querySelector('.modal-overlay:last-child');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        if (options.onShow) {
            options.onShow();
        }
        
        return modal;
    }
    
    // Analytics methods
    getClassAnalytics(classId) {
        const classData = this.getClassById(classId);
        if (!classData) return null;
        
        const classStudents = this.students.filter(s => 
            classData.students.includes(s.id)
        );
        
        return {
            classId,
            className: classData.name,
            totalStudents: classStudents.length,
            avgProgress: Math.round(classStudents.reduce((sum, s) => sum + s.progress, 0) / classStudents.length),
            attendance: this.calculateAttendance(classStudents),
            subjectPerformance: this.calculateSubjectPerformance(classStudents)
        };
    }
    
    calculateAttendance(students) {
        // Mock attendance calculation
        const totalDays = 20;
        const presentDays = students.reduce((sum, student) => {
            return sum + (Math.random() > 0.1 ? totalDays : totalDays - 3); // 90% attendance
        }, 0);
        
        return Math.round((presentDays / (students.length * totalDays)) * 100);
    }
    
    calculateSubjectPerformance(students) {
        const subjects = ['math', 'reading', 'science'];
        const performance = {};
        
        subjects.forEach(subject => {
            const scores = students.map(s => s.subjects?.[subject]?.score || 0);
            performance[subject] = {
                average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                highest: Math.max(...scores),
                lowest: Math.min(...scores)
            };
        });
        
        return performance;
    }
}

// Initialize teacher app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isTeacher()) {
        window.TeacherApp = new TeacherApp();
    }
});