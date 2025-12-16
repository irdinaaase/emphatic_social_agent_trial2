// js/modules/api.js
class APIModule {
    constructor() {
        this.baseURL = Config.API_BASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        this.init();
    }
    
    init() {
        this.setupInterceptors();
        this.loadAuthToken();
    }
    
    loadAuthToken() {
        const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            this.setAuthToken(token);
        }
    }
    
    setAuthToken(token) {
        this.headers['Authorization'] = `Bearer ${token}`;
    }
    
    clearAuthToken() {
        delete this.headers['Authorization'];
    }
    
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        
        // Use mock data if enabled
        if (Config.MOCK_DATA.ENABLED) {
            return this.mockRequest(endpoint, options);
        }
        
        const config = {
            method: options.method || 'GET',
            headers: { ...this.headers, ...options.headers },
            body: options.body ? JSON.stringify(options.body) : undefined
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 0
            };
        }
    }
    
    async mockRequest(endpoint, options) {
        // Simulate network delay
        await new Promise(resolve => 
            setTimeout(resolve, Config.MOCK_DATA.DELAY)
        );
        
        // Simulate occasional errors
        if (Math.random() < Config.MOCK_DATA.ERROR_RATE) {
            return {
                success: false,
                error: 'Mock API error',
                status: 500
            };
        }
        
        // Route to appropriate mock handler
        const handler = this.getMockHandler(endpoint, options.method);
        return handler(options);
    }
    
    getMockHandler(endpoint, method) {
        const handlers = {
            // Authentication
            '/auth/login': this.mockLogin.bind(this),
            '/auth/register': this.mockRegister.bind(this),
            '/auth/logout': this.mockLogout.bind(this),
            
            // Student endpoints
            '/student/progress': this.mockStudentProgress.bind(this),
            '/student/lessons': this.mockStudentLessons.bind(this),
            '/student/achievements': this.mockStudentAchievements.bind(this),
            
            // Teacher endpoints
            '/teacher/students': this.mockTeacherStudents.bind(this),
            '/teacher/classes': this.mockTeacherClasses.bind(this),
            '/teacher/alerts': this.mockTeacherAlerts.bind(this),
            '/teacher/analytics': this.mockTeacherAnalytics.bind(this),
            
            // AI Agent endpoints
            '/agent/chat': this.mockAgentChat.bind(this),
            '/agent/analysis': this.mockAgentAnalysis.bind(this),
            '/agent/intervention': this.mockAgentIntervention.bind(this)
        };
        
        return handlers[endpoint] || this.mockDefault.bind(this);
    }
    
    // Mock handlers
    async mockLogin(options) {
        const { email, password } = options.body || {};
        
        const mockUsers = {
            'student@example.com': {
                id: 'student-001',
                email: 'student@example.com',
                name: 'Alex Johnson',
                role: 'student',
                disabilityType: 'dyslexia',
                avatar: '👨‍🎓'
            },
            'teacher@example.com': {
                id: 'teacher-001',
                email: 'teacher@example.com',
                name: 'Ms. Sarah Rodriguez',
                role: 'teacher',
                avatar: '👩‍🏫'
            }
        };
        
        const user = mockUsers[email];
        
        if (user && password === 'password123') {
            const token = `mock_token_${user.id}_${Date.now()}`;
            this.setAuthToken(token);
            
            return {
                success: true,
                data: {
                    user: user,
                    token: token
                }
            };
        }
        
        return {
            success: false,
            error: 'Invalid credentials',
            status: 401
        };
    }
    
    async mockRegister(options) {
        const userData = options.body;
        const token = `mock_token_${userData.id}_${Date.now()}`;
        
        return {
            success: true,
            data: {
                user: userData,
                token: token
            }
        };
    }
    
    async mockLogout() {
        this.clearAuthToken();
        return { success: true, data: { message: 'Logged out successfully' } };
    }
    
    async mockStudentProgress() {
        const progress = {
            overall: 65,
            completedLessons: 12,
            totalLessons: 20,
            averageScore: 78,
            streak: 5,
            weeklyProgress: [
                { day: 'Mon', progress: 40 },
                { day: 'Tue', progress: 55 },
                { day: 'Wed', progress: 65 },
                { day: 'Thu', progress: 70 },
                { day: 'Fri', progress: 65 },
                { day: 'Sat', progress: 75 },
                { day: 'Sun', progress: 80 }
            ],
            bySubject: {
                math: { progress: 70, score: 85 },
                reading: { progress: 60, score: 75 },
                science: { progress: 65, score: 70 }
            }
        };
        
        return { success: true, data: progress };
    }
    
    async mockStudentLessons() {
        const lessons = [
            {
                id: 'math-001',
                title: 'Introduction to Fractions',
                subject: 'Math',
                description: 'Learn the basics of fractions and how to use them.',
                difficulty: 'beginner',
                estimatedTime: 30,
                progress: 80,
                status: 'in-progress',
                lastAccessed: '2024-01-15T10:30:00Z'
            },
            {
                id: 'reading-001',
                title: 'Reading Comprehension',
                subject: 'Reading',
                description: 'Improve your reading comprehension skills.',
                difficulty: 'intermediate',
                estimatedTime: 45,
                progress: 100,
                status: 'completed',
                lastAccessed: '2024-01-14T14:20:00Z'
            },
            {
                id: 'science-001',
                title: 'The Solar System',
                subject: 'Science',
                description: 'Explore the planets in our solar system.',
                difficulty: 'beginner',
                estimatedTime: 40,
                progress: 40,
                status: 'in-progress',
                lastAccessed: '2024-01-13T09:15:00Z'
            }
        ];
        
        return { success: true, data: lessons };
    }
    
    async mockStudentAchievements() {
        const achievements = [
            {
                id: 'ach-001',
                name: 'Quick Learner',
                description: 'Complete 5 lessons in one day',
                icon: '⚡',
                earned: true,
                earnedDate: '2024-01-10'
            },
            {
                id: 'ach-002',
                name: 'Math Master',
                description: 'Score 90% or higher on 10 math lessons',
                icon: '🧮',
                earned: true,
                earnedDate: '2024-01-12'
            },
            {
                id: 'ach-003',
                name: 'Reading Champion',
                description: 'Read for 10 hours total',
                icon: '📚',
                earned: false,
                progress: 65
            },
            {
                id: 'ach-004',
                name: 'Consistency King',
                description: 'Maintain a 7-day learning streak',
                icon: '👑',
                earned: false,
                progress: 5
            }
        ];
        
        return { success: true, data: achievements };
    }
    
    async mockTeacherStudents() {
        const students = [
            {
                id: 'student-001',
                name: 'Alex Johnson',
                email: 'alex@example.com',
                disabilityType: 'dyslexia',
                grade: '5th Grade',
                status: 'online',
                focus: 85,
                progress: 65,
                lastActivity: '2024-01-15T10:45:00Z',
                needsAttention: false
            },
            {
                id: 'student-002',
                name: 'Maya Patel',
                email: 'maya@example.com',
                disabilityType: 'adhd',
                grade: '5th Grade',
                status: 'online',
                focus: 45,
                progress: 40,
                lastActivity: '2024-01-15T10:30:00Z',
                needsAttention: true
            },
            {
                id: 'student-003',
                name: 'Jamal Williams',
                email: 'jamal@example.com',
                disabilityType: 'autism',
                grade: '5th Grade',
                status: 'offline',
                focus: 0,
                progress: 75,
                lastActivity: '2024-01-14T15:20:00Z',
                needsAttention: false
            }
        ];
        
        return { success: true, data: students };
    }
    
    async mockTeacherClasses() {
        const classes = [
            {
                id: 'class-001',
                name: '5th Grade Math',
                subject: 'Math',
                studentCount: 12,
                averageProgress: 68,
                activeStudents: 8,
                lastUpdated: '2024-01-15T10:00:00Z'
            },
            {
                id: 'class-002',
                name: '5th Grade Science',
                subject: 'Science',
                studentCount: 12,
                averageProgress: 72,
                activeStudents: 6,
                lastUpdated: '2024-01-15T09:30:00Z'
            }
        ];
        
        return { success: true, data: classes };
    }
    
    async mockTeacherAlerts() {
        const alerts = [
            {
                id: 'alert-001',
                studentId: 'student-002',
                studentName: 'Maya Patel',
                type: 'focus',
                severity: 'high',
                title: 'Low Focus Detected',
                description: 'Student has been distracted for more than 5 minutes',
                timestamp: '2024-01-15T10:35:00Z',
                resolved: false
            },
            {
                id: 'alert-002',
                studentId: 'student-001',
                studentName: 'Alex Johnson',
                type: 'frustration',
                severity: 'medium',
                title: 'Frustration Detected',
                description: 'Student showing signs of frustration in math lesson',
                timestamp: '2024-01-15T09:45:00Z',
                resolved: true
            }
        ];
        
        return { success: true, data: alerts };
    }
    
    async mockTeacherAnalytics() {
        const analytics = {
            classOverview: {
                totalStudents: 24,
                activeStudents: 14,
                averageProgress: 65,
                completionRate: 58
            },
            subjectPerformance: {
                math: { average: 70, trend: 'up' },
                reading: { average: 65, trend: 'stable' },
                science: { average: 60, trend: 'up' }
            },
            engagementMetrics: {
                averageFocus: 68,
                averageTimeSpent: 45,
                completionRate: 62
            },
            recentActivity: [
                { student: 'Alex Johnson', action: 'Completed math lesson', time: '10:30 AM' },
                { student: 'Maya Patel', action: 'Started reading lesson', time: '10:25 AM' },
                { student: 'Jamal Williams', action: 'Earned achievement', time: 'Yesterday' }
            ]
        };
        
        return { success: true, data: analytics };
    }
    
    async mockAgentChat(options) {
        const { message } = options.body || {};
        
        const responses = [
            "I understand you're working on fractions. Would you like me to explain it in a different way?",
            "It's okay to find this challenging. Let's break it down into smaller steps together.",
            "I notice you've been working hard! How about we take a short break and come back to this?",
            "Great progress so far! You're really getting the hang of this.",
            "I can see you're getting frustrated. Let me help you with a hint..."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            success: true,
            data: {
                response: randomResponse,
                emotion: 'supportive',
                suggestions: ['Take a break', 'Try a different approach', 'Review previous lesson']
            }
        };
    }
    
    async mockAgentAnalysis() {
        return {
            success: true,
            data: {
                studentState: {
                    emotion: 'focused',
                    focusLevel: 75,
                    engagement: 80,
                    confidence: 65
                },
                recommendations: [
                    'Continue with current lesson',
                    'Consider shorter breaks',
                    'Provide positive reinforcement'
                ]
            }
        };
    }
    
    async mockAgentIntervention() {
        return {
            success: true,
            data: {
                intervention: 'provide_hint',
                message: 'Try breaking the problem into smaller parts',
                resources: ['step_by_step_guide.pdf', 'video_explanation.mp4']
            }
        };
    }
    
    async mockDefault() {
        return {
            success: true,
            data: { message: 'Mock API response' }
        };
    }
    
    // Setup interceptors for request/response handling
    setupInterceptors() {
        // Can be extended for real API logging, error handling, etc.
    }
    
    // Convenience methods
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    
    post(endpoint, data, options = {}) {
        return this.request(endpoint, { 
            ...options, 
            method: 'POST', 
            body: data 
        });
    }
    
    put(endpoint, data, options = {}) {
        return this.request(endpoint, { 
            ...options, 
            method: 'PUT', 
            body: data 
        });
    }
    
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    
    // File upload helper
    async uploadFile(endpoint, file, fieldName = 'file') {
        if (Config.MOCK_DATA.ENABLED) {
            await new Promise(resolve => 
                setTimeout(resolve, Config.MOCK_DATA.DELAY)
            );
            
            return {
                success: true,
                data: {
                    url: `mock://uploads/${file.name}`,
                    size: file.size,
                    type: file.type
                }
            };
        }
        
        const formData = new FormData();
        formData.append(fieldName, file);
        
        const headers = {
            ...this.headers,
            'Authorization': this.headers['Authorization']
        };
        delete headers['Content-Type']; // Let browser set content-type for FormData
        
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.API = new APIModule();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIModule;
}