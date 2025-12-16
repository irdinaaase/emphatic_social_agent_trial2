// js/student/dashboard.js
class StudentDashboard {
    constructor() {
        this.studentApp = window.StudentApp;
        this.progressData = null;
        this.lessons = [];
        this.achievements = [];
        this.todaysActivities = [];
        this.focusData = null;
        this.engagementData = null;
        
        this.init();
    }
    
    init() {
        if (!this.studentApp || !this.studentApp.isInitialized) {
            console.error('StudentDashboard requires StudentApp');
            // Create minimal StudentApp if not available
            this.createFallbackStudentApp();
        }
        
        this.loadData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        
        console.log('Student dashboard initialized');
    }
    
    createFallbackStudentApp() {
        window.StudentApp = window.StudentApp || {
            isInitialized: true,
            getProgress: () => ({
                overall: 35,
                bySubject: {
                    math: { progress: 40, score: 75 },
                    reading: { progress: 30, score: 80 },
                    science: { progress: 35, score: 70 }
                },
                streak: 5,
                completedLessons: 12,
                averageScore: 75
            }),
            getLessons: () => [
                {
                    id: 'lesson-1',
                    title: 'Introduction to Fractions',
                    subject: 'Math',
                    difficulty: 'easy',
                    progress: 75,
                    status: 'in-progress',
                    lastAccessed: new Date().toISOString()
                },
                {
                    id: 'lesson-2',
                    title: 'Reading Comprehension',
                    subject: 'Reading',
                    difficulty: 'medium',
                    progress: 50,
                    status: 'in-progress',
                    lastAccessed: new Date().toISOString()
                },
                {
                    id: 'lesson-3',
                    title: 'Solar System Basics',
                    subject: 'Science',
                    difficulty: 'easy',
                    progress: 100,
                    status: 'completed',
                    lastAccessed: new Date(Date.now() - 86400000).toISOString()
                }
            ],
            getAchievements: () => [
                { id: 'ach-1', name: 'First Lesson', icon: '🥇', earned: true, earnedDate: '2024-01-10' },
                { id: 'ach-2', name: '5-Day Streak', icon: '🔥', earned: true, earnedDate: '2024-01-15' },
                { id: 'ach-3', name: 'Math Whiz', icon: '🧮', earned: false }
            ],
            showModal: (options) => {
                console.log('Modal would show:', options);
                // Simple modal implementation
                const modal = document.createElement('div');
                modal.className = 'student-modal';
                modal.innerHTML = `
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${options.title || 'Modal'}</h3>
                            <button class="btn-icon" onclick="this.closest('.student-modal').remove()">×</button>
                        </div>
                        <div class="modal-body">${options.content}</div>
                    </div>
                `;
                document.body.appendChild(modal);
            },
            showNotification: (options) => {
                const notification = document.createElement('div');
                notification.className = `notification notification-${options.type || 'info'}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <span class="notification-icon">${options.type === 'success' ? '✅' : options.type === 'error' ? '❌' : 'ℹ️'}</span>
                        <span class="notification-message">${options.title || 'Notification'}: ${options.message || ''}</span>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
                `;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 5000);
            },
            recordLearningActivity: (activity) => {
                console.log('Activity recorded:', activity);
                const activities = JSON.parse(localStorage.getItem('learning_activities') || '[]');
                activities.push({
                    ...activity,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('learning_activities', JSON.stringify(activities));
            },
            toggleAgentInterface: () => {
                console.log('Toggle agent interface');
                // Simple implementation
                alert('Agent interface would open');
            }
        };
        
        this.studentApp = window.StudentApp;
    }
    
    async loadData() {
        try {
            if (this.studentApp && this.studentApp.getProgress) {
                this.progressData = this.studentApp.getProgress();
            } else {
                this.progressData = {
                    overall: 35,
                    bySubject: {
                        math: { progress: 40, score: 75 },
                        reading: { progress: 30, score: 80 },
                        science: { progress: 35, score: 70 }
                    },
                    streak: 5,
                    completedLessons: 12,
                    averageScore: 75
                };
            }
            
            if (this.studentApp && this.studentApp.getLessons) {
                this.lessons = this.studentApp.getLessons();
            } else {
                this.lessons = [
                    {
                        id: 'lesson-1',
                        title: 'Introduction to Fractions',
                        subject: 'Math',
                        difficulty: 'easy',
                        progress: 75,
                        status: 'in-progress',
                        lastAccessed: new Date().toISOString()
                    },
                    {
                        id: 'lesson-2',
                        title: 'Reading Comprehension',
                        subject: 'Reading',
                        difficulty: 'medium',
                        progress: 50,
                        status: 'in-progress',
                        lastAccessed: new Date().toISOString()
                    }
                ];
            }
            
            if (this.studentApp && this.studentApp.getAchievements) {
                this.achievements = this.studentApp.getAchievements();
            } else {
                this.achievements = [
                    { id: 'ach-1', name: 'First Lesson', icon: '🥇', earned: true, earnedDate: '2024-01-10' },
                    { id: 'ach-2', name: '5-Day Streak', icon: '🔥', earned: true, earnedDate: '2024-01-15' }
                ];
            }
            
            // Load additional data
            await this.loadAdditionalData();
            
            // Render dashboard after data is loaded
            this.renderDashboard();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Set default data to prevent crashes
            this.progressData = { 
                overall: 0, 
                bySubject: {}, 
                streak: 0, 
                completedLessons: 0, 
                averageScore: 0 
            };
            this.lessons = [];
            this.achievements = [];
            this.todaysActivities = [];
            this.focusData = { average: 0.7, trend: 'stable', history: [] };
            this.engagementData = { currentScore: 0.7, trend: 'stable' };
            
            // Render with fallback data
            this.renderDashboard();
        }
    }
    
    async loadAdditionalData() {
        try {
            // Load today's activities
            const today = new Date().toISOString().split('T')[0];
            const activities = JSON.parse(localStorage.getItem('learning_activities') || '[]')
                .filter(activity => activity && activity.timestamp && activity.timestamp.includes(today));
            
            this.todaysActivities = activities;
            
            // Load focus data (with fallback if FocusMonitor not available)
            if (typeof FocusMonitor !== 'undefined' && FocusMonitor) {
                const focusHistory = FocusMonitor.getFocusHistory ? 
                    FocusMonitor.getFocusHistory(86400000) : [];
                this.focusData = {
                    average: FocusMonitor.getAverageFocus ? 
                        FocusMonitor.getAverageFocus(86400000) : 0.7,
                    trend: FocusMonitor.getFocusTrend ? 
                        FocusMonitor.getFocusTrend() : 'stable',
                    history: focusHistory
                };
            } else {
                console.warn('FocusMonitor not available, using default focus data');
                this.focusData = {
                    average: 0.7,
                    trend: 'stable',
                    history: []
                };
            }
            
            // Load engagement data (with fallback)
            if (typeof EngagementTracker !== 'undefined' && EngagementTracker) {
                this.engagementData = EngagementTracker.getEngagementReport ? 
                    EngagementTracker.getEngagementReport() : 
                    { currentScore: 0.7, trend: 'stable' };
            } else {
                console.warn('EngagementTracker not available, using default data');
                this.engagementData = { currentScore: 0.7, trend: 'stable' };
            }
            
        } catch (error) {
            console.error('Error loading additional data:', error);
            // Set defaults to prevent crashes
            this.todaysActivities = [];
            this.focusData = { average: 0.7, trend: 'stable', history: [] };
            this.engagementData = { currentScore: 0.7, trend: 'stable' };
        }
    }
    
    renderDashboard() {
        this.renderWelcomeSection();
        this.renderProgressOverview();
        this.renderTodayLessons();
        this.renderAchievements();
        this.renderFocusTools();
        this.renderActivityFeed();
    }
    
    renderWelcomeSection() {
        const user = Auth.getCurrentUser();
        const welcomeSection = document.getElementById('welcome-section');
        
        if (welcomeSection) {
            const timeOfDay = this.getTimeOfDay();
            const motivationalQuote = this.getMotivationalQuote();
            
            welcomeSection.innerHTML = `
                <div class="welcome-card card">
                    <div class="welcome-header">
                        <h1>Good ${timeOfDay}, ${user?.name || 'Student'}! 👋</h1>
                        <p class="welcome-subtitle">${user?.grade || '5th Grade'} • ${user?.disabilityType ? this.formatDisability(user.disabilityType) : 'Student'}</p>
                    </div>
                    
                    <div class="welcome-content">
                        <div class="welcome-quote">
                            <span class="quote-icon">💭</span>
                            <p class="quote-text">"${motivationalQuote}"</p>
                        </div>
                        
                        <div class="welcome-stats">
                            <div class="welcome-stat">
                                <span class="stat-value">${this.progressData?.streak || 0}</span>
                                <span class="stat-label">Day Streak</span>
                            </div>
                            <div class="welcome-stat">
                                <span class="stat-value">${this.progressData?.completedLessons || 0}</span>
                                <span class="stat-label">Lessons Completed</span>
                            </div>
                            <div class="welcome-stat">
                                <span class="stat-value">${Math.round(this.progressData?.averageScore || 0)}%</span>
                                <span class="stat-label">Average Score</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="welcome-actions">
                        <button class="btn btn-primary" data-action="start-learning">
                            <span>🎯</span>
                            Start Learning
                        </button>
                        <button class="btn btn-secondary" data-action="chat-agent">
                            <span>🤖</span>
                            Chat with Companion
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    renderProgressOverview() {
        const progressSection = document.getElementById('progress-overview');
        if (!progressSection) return;
        
        const progress = this.progressData?.overall || 0;
        const bySubject = this.progressData?.bySubject || {};
        
        progressSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Learning Progress</h2>
                    <div class="card-subtitle">Overall: ${progress}% complete</div>
                </div>
                
                <div class="card-body">
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>Overall Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="subject-progress">
                        <h3 class="section-title">By Subject</h3>
                        ${Object.keys(bySubject).length > 0 ? 
                            Object.entries(bySubject).map(([subject, data]) => `
                                <div class="subject-item">
                                    <div class="subject-name">${this.formatSubject(subject)}</div>
                                    <div class="subject-details">
                                        <div class="subject-progress-bar">
                                            <div class="progress-fill" style="width: ${data.progress || 0}%"></div>
                                        </div>
                                        <div class="subject-score">${data.score || 0}% avg</div>
                                    </div>
                                </div>
                            `).join('') :
                            `<p class="no-data">No subject data available yet</p>`
                        }
                    </div>
                    
                    <div class="progress-tips">
                        <h3 class="section-title">Progress Tips</h3>
                        <div class="tips-list">
                            ${this.getProgressTips().map(tip => `
                                <div class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    <span class="tip-text">${tip}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderTodayLessons() {
        const lessonsSection = document.getElementById('today-lessons');
        if (!lessonsSection) return;
        
        // Ensure lessons is an array
        const lessons = Array.isArray(this.lessons) ? this.lessons : [];
        
        const todaysLessons = lessons.filter(lesson => 
            lesson && (lesson.status === 'in-progress' || 
            (lesson.status === 'completed' && this.isToday(lesson.lastAccessed)))
        ).slice(0, 3);
        
        lessonsSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Today's Lessons</h2>
                    <a href="learning.html" class="btn-link">View All →</a>
                </div>
                
                <div class="card-body">
                    ${todaysLessons.length > 0 ? `
                        <div class="lessons-list">
                            ${todaysLessons.map(lesson => `
                                <div class="lesson-item" data-lesson-id="${lesson.id || ''}">
                                    <div class="lesson-icon ${(lesson.subject || '').toLowerCase()}">
                                        ${this.getSubjectIcon(lesson.subject)}
                                    </div>
                                    <div class="lesson-info">
                                        <div class="lesson-title">${lesson.title || 'Untitled Lesson'}</div>
                                        <div class="lesson-meta">
                                            <span class="lesson-subject">${lesson.subject || 'General'}</span>
                                            <span class="lesson-difficulty ${lesson.difficulty || 'medium'}">${lesson.difficulty || 'medium'}</span>
                                            <span class="lesson-progress">${lesson.progress || 0}%</span>
                                        </div>
                                        <div class="lesson-progress-bar">
                                            <div class="progress-fill" style="width: ${lesson.progress || 0}%"></div>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-primary" data-action="continue-lesson" data-lesson-id="${lesson.id || ''}">
                                        ${lesson.status === 'completed' ? 'Review' : 'Continue'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-icon">📚</div>
                            <h3>No lessons for today</h3>
                            <p>Start a new learning journey!</p>
                            <button class="btn btn-primary" data-action="start-new-lesson">
                                Start New Lesson
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    renderAchievements() {
        const achievementsSection = document.getElementById('achievements-section');
        if (!achievementsSection) return;
        
        // Ensure achievements is an array
        const achievements = Array.isArray(this.achievements) ? this.achievements : [];
        
        const earnedAchievements = achievements.filter(a => a && a.earned);
        const recentAchievements = earnedAchievements.slice(-3).reverse();
        
        achievementsSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Recent Achievements</h2>
                    <div class="badge badge-primary">${earnedAchievements.length} earned</div>
                </div>
                
                <div class="card-body">
                    ${recentAchievements.length > 0 ? `
                        <div class="achievements-grid">
                            ${recentAchievements.map(achievement => `
                                <div class="achievement-badge earned" data-achievement-id="${achievement.id || ''}">
                                    <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                                    <div class="achievement-name">${achievement.name || 'Achievement'}</div>
                                    ${achievement.earnedDate ? `
                                        <div class="achievement-date">Earned ${this.formatDate(achievement.earnedDate)}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state small">
                            <div class="empty-icon">🏆</div>
                            <p>No achievements yet. Start learning to earn badges!</p>
                        </div>
                    `}
                    
                    <div class="motivation-meter">
                        <div class="motivation-label">
                            <span>Learning Motivation</span>
                            <span>${Math.round((this.engagementData?.currentScore || 0.7) * 100)}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${(this.engagementData?.currentScore || 0.7) * 100}%"></div>
                        </div>
                        <div class="motivation-tip">
                            ${this.getMotivationTip()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFocusTools() {
        const focusSection = document.getElementById('focus-tools');
        if (!focusSection) return;
        
        // Use focusData from loadAdditionalData()
        const focusLevel = this.focusData?.average || 0.7;
        const focusTrend = this.focusData?.trend || 'stable';
        
        const needsBreak = focusLevel < 0.4; // Simple heuristic
        const breakSuggestion = needsBreak ? {
            reason: 'Your focus level is getting low. Take a short break!',
            duration: 300,
            activities: ['Stretch', 'Look away from screen', 'Take deep breaths']
        } : null;
        
        focusSection.innerHTML = `
            <div class="card focus-card">
                <div class="card-header">
                    <h2 class="card-title">Focus & Wellness</h2>
                    <div class="focus-status ${focusLevel > 0.6 ? 'good' : focusLevel > 0.3 ? 'warning' : 'poor'}">
                        ${Math.round(focusLevel * 100)}% Focus
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="focus-overview">
                        <div class="focus-visual">
                            <div class="focus-circle ${focusLevel > 0.6 ? 'good' : focusLevel > 0.3 ? 'warning' : 'poor'}" data-focus-level="${focusLevel}">
                                <div class="circle-value">${Math.round(focusLevel * 100)}%</div>
                                <div class="circle-label">Current Focus</div>
                            </div>
                            <div class="focus-stats">
                                <div class="focus-stat">
                                    <div class="stat-value">${this.todaysActivities?.length || 0}</div>
                                    <div class="stat-label">Activities Today</div>
                                </div>
                                <div class="focus-stat">
                                    <div class="stat-value">${focusTrend === 'improving' ? '↑' : focusTrend === 'declining' ? '↓' : '→'}</div>
                                    <div class="stat-label">Trend</div>
                                </div>
                            </div>
                        </div>
                        
                        ${needsBreak && breakSuggestion ? `
                            <div class="break-suggestion">
                                <div class="suggestion-icon">⏰</div>
                                <div class="suggestion-content">
                                    <div class="suggestion-title">Break Time!</div>
                                    <div class="suggestion-text">${breakSuggestion.reason}</div>
                                    <button class="btn btn-sm btn-primary" data-action="start-break">
                                        Start ${breakSuggestion.duration}s Break
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="focus-tools-grid">
                        <div class="focus-tool" data-action="pomodoro-timer">
                            <div class="tool-icon">🍅</div>
                            <div class="tool-name">Pomodoro Timer</div>
                            <div class="tool-desc">25 min focus, 5 min break</div>
                        </div>
                        <div class="focus-tool" data-action="breathing-exercise">
                            <div class="tool-icon">🌬️</div>
                            <div class="tool-name">Breathing Exercise</div>
                            <div class="tool-desc">Calm your mind in 1 minute</div>
                        </div>
                        <div class="focus-tool" data-action="focus-game">
                            <div class="tool-icon">🎯</div>
                            <div class="tool-name">Focus Game</div>
                            <div class="tool-desc">Sharpen your attention</div>
                        </div>
                        <div class="focus-tool" data-action="distraction-blocker">
                            <div class="tool-icon">🚫</div>
                            <div class="tool-name">Distraction Blocker</div>
                            <div class="tool-desc">Block distracting sites</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderActivityFeed() {
        const activitySection = document.getElementById('activity-feed');
        if (!activitySection) return;
        
        const recentActivities = Array.isArray(this.todaysActivities) ? 
            this.todaysActivities.slice(-5).reverse() : [];
        
        activitySection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Recent Activity</h2>
                    <button class="btn btn-sm btn-secondary" data-action="refresh-activity">Refresh</button>
                </div>
                
                <div class="card-body">
                    ${recentActivities.length > 0 ? `
                        <div class="activity-timeline">
                            ${recentActivities.map(activity => `
                                <div class="activity-item">
                                    <div class="activity-icon ${activity.type || 'default'}">
                                        ${this.getActivityIcon(activity.type)}
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-title">${activity.title || 'Activity'}</div>
                                        <div class="activity-description">${activity.description || ''}</div>
                                        <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state small">
                            <div class="empty-icon">📝</div>
                            <p>No activities recorded yet today</p>
                        </div>
                    `}
                    
                    <div class="agent-status-widget">
                        <div class="agent-avatar-small">🤖</div>
                        <div class="agent-status-content">
                            <div class="agent-status-text">
                                Learning Companion is 
                                <span class="status-online">online</span>
                                and ready to help
                            </div>
                            <button class="btn btn-sm btn-primary" data-action="chat-agent">
                                Ask for Help
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;
            
            if (!action) return;
            
            switch(action) {
                case 'start-learning':
                    window.location.href = 'learning.html';
                    break;
                    
                case 'chat-agent':
                    if (this.studentApp && this.studentApp.toggleAgentInterface) {
                        this.studentApp.toggleAgentInterface();
                    } else {
                        alert('Chat with learning companion');
                    }
                    break;
                    
                case 'continue-lesson':
                    const lessonId = e.target.dataset.lessonId || 
                                   e.target.closest('[data-lesson-id]')?.dataset.lessonId;
                    this.startLesson(lessonId);
                    break;
                    
                case 'start-new-lesson':
                    this.showLessonSelector();
                    break;
                    
                case 'refresh-activity':
                    this.loadAdditionalData().then(() => {
                        this.renderActivityFeed();
                    });
                    break;
                    
                case 'start-break':
                    this.startBreakTimer();
                    break;
                    
                case 'pomodoro-timer':
                    this.startPomodoroTimer();
                    break;
                    
                case 'breathing-exercise':
                    this.startBreathingExercise();
                    break;
                    
                case 'focus-game':
                    this.startFocusGame();
                    break;
                    
                case 'distraction-blocker':
                    this.showDistractionBlocker();
                    break;
                    
                case 'close-modal':
                    const modal = e.target.closest('.student-modal');
                    if (modal) modal.remove();
                    break;
            }
        });
        
        // Listen for real-time updates
        window.addEventListener('progressUpdate', () => {
            this.refreshProgressData();
        });
        
        window.addEventListener('focusUpdate', (e) => {
            this.updateFocusDisplay(e.detail);
        });
        
        window.addEventListener('engagementUpdate', () => {
            this.refreshEngagementData();
        });
    }
    
    startLesson(lessonId) {
        if (!lessonId) return;
        
        // Record lesson start activity
        if (this.studentApp && this.studentApp.recordLearningActivity) {
            this.studentApp.recordLearningActivity({
                type: 'lesson_start',
                lessonId: lessonId,
                title: 'Started Lesson',
                description: 'Began working on a learning module'
            });
        }
        
        // In real implementation, this would navigate to lesson player
        console.log('Starting lesson:', lessonId);
        
        // For now, show a message
        this.showNotification({
            title: 'Lesson Started',
            message: 'Opening lesson player...',
            type: 'info'
        });
        
        // Navigate to learning page
        setTimeout(() => {
            window.location.href = 'learning.html?lesson=' + lessonId;
        }, 1000);
    }
    
    showLessonSelector() {
        // Ensure lessons is an array
        const lessons = Array.isArray(this.lessons) ? this.lessons : [];
        
        // Create modal with lesson selection
        const modalContent = `
            <div class="lesson-selector">
                <h3>Choose a Lesson</h3>
                <div class="lesson-options">
                    ${lessons.length > 0 ? lessons.map(lesson => `
                        <div class="lesson-option" data-lesson-id="${lesson.id || ''}">
                            <div class="option-icon ${(lesson.subject || '').toLowerCase()}">
                                ${this.getSubjectIcon(lesson.subject)}
                            </div>
                            <div class="option-content">
                                <div class="option-title">${lesson.title || 'Untitled Lesson'}</div>
                                <div class="option-meta">
                                    <span class="option-subject">${lesson.subject || 'General'}</span>
                                    <span class="option-difficulty ${lesson.difficulty || 'medium'}">${lesson.difficulty || 'medium'}</span>
                                </div>
                                <div class="option-progress">${lesson.progress || 0}% complete</div>
                            </div>
                        </div>
                    `).join('') : 
                    '<p class="no-lessons">No lessons available</p>'}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Select a Lesson',
                content: modalContent,
                showClose: true
            });
            
            // Add click handlers for lesson options
            setTimeout(() => {
                document.querySelectorAll('.lesson-option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        const lessonId = e.currentTarget.dataset.lessonId;
                        if (lessonId) {
                            this.startLesson(lessonId);
                        }
                    });
                });
            }, 100);
        }
    }
    
    startBreakTimer() {
        const breakSuggestion = {
            reason: 'Take a short break to refresh your mind',
            duration: 300,
            activities: ['Stretch', 'Look away from screen', 'Take deep breaths']
        };
        
        // Show break timer
        const timerContent = `
            <div class="break-timer">
                <div class="timer-display" id="break-timer-display">${breakSuggestion.duration}</div>
                <div class="timer-label">Break Time</div>
                <div class="break-suggestions">
                    <h4>Try during your break:</h4>
                    <ul>
                        ${breakSuggestion.activities.map(activity => 
                            `<li>${activity}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="timer-controls">
                    <button class="btn btn-primary" id="start-break-timer">Start Break</button>
                    <button class="btn btn-secondary" data-action="close-modal">Skip</button>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Take a Break',
                content: timerContent,
                showClose: true
            });
            
            // Timer logic
            let timeLeft = breakSuggestion.duration;
            let timerInterval = null;
            
            setTimeout(() => {
                const startBtn = document.getElementById('start-break-timer');
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        startBtn.disabled = true;
                        startBtn.textContent = 'Break in progress...';
                        
                        timerInterval = setInterval(() => {
                            timeLeft--;
                            const display = document.getElementById('break-timer-display');
                            if (display) display.textContent = timeLeft;
                            
                            if (timeLeft <= 0) {
                                clearInterval(timerInterval);
                                this.breakTimerComplete();
                            }
                        }, 1000);
                    });
                }
            }, 100);
        }
    }
    
    breakTimerComplete() {
        const display = document.querySelector('.break-timer .timer-display');
        const label = document.querySelector('.break-timer .timer-label');
        const timerControls = document.querySelector('.timer-controls');
        
        if (display) display.textContent = 'Break Complete!';
        if (label) label.textContent = 'Ready to resume?';
        
        if (timerControls) {
            timerControls.innerHTML = `
                <button class="btn btn-success" id="resume-learning">Resume Learning</button>
                <button class="btn btn-secondary" id="extend-break">Extend 2 min</button>
            `;
            
            setTimeout(() => {
                const resumeBtn = document.getElementById('resume-learning');
                const extendBtn = document.getElementById('extend-break');
                
                if (resumeBtn) {
                    resumeBtn.addEventListener('click', () => {
                        const modal = document.querySelector('.student-modal');
                        if (modal) modal.remove();
                        
                        this.showNotification({
                            title: 'Break Complete',
                            message: 'Refreshed and ready to learn!',
                            type: 'success'
                        });
                    });
                }
                
                if (extendBtn) {
                    extendBtn.addEventListener('click', () => {
                        // Add 2 more minutes
                        this.startBreakTimer();
                    });
                }
            }, 100);
        }
    }
    
    startPomodoroTimer() {
        const pomodoroContent = `
            <div class="pomodoro-timer">
                <div class="pomodoro-phase">
                    <div class="phase-label">Focus Session</div>
                    <div class="phase-time">25:00</div>
                </div>
                <div class="pomodoro-display" id="pomodoro-display">25:00</div>
                <div class="pomodoro-controls">
                    <button class="btn btn-primary" id="start-pomodoro">Start Focus Session</button>
                    <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
                </div>
                <div class="pomodoro-info">
                    <p>Focus for 25 minutes, then take a 5-minute break.</p>
                    <p>After 4 sessions, take a longer 15-30 minute break.</p>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Pomodoro Timer',
                content: pomodoroContent,
                showClose: true
            });
            
            // Pomodoro timer logic would go here
        }
    }
    
    startBreathingExercise() {
        const breathingContent = `
            <div class="breathing-exercise">
                <div class="breathing-visual" id="breathing-circle">
                    <div class="breathing-text">Breathe In</div>
                </div>
                <div class="breathing-instructions">
                    <p>Follow the circle as it expands and contracts:</p>
                    <ol>
                        <li>Breathe IN for 4 seconds</li>
                        <li>Hold for 4 seconds</li>
                        <li>Breathe OUT for 6 seconds</li>
                        <li>Repeat for 1 minute</li>
                    </ol>
                </div>
                <div class="breathing-controls">
                    <button class="btn btn-primary" id="start-breathing">Start Exercise</button>
                    <button class="btn btn-secondary" data-action="close-modal">Close</button>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Breathing Exercise',
                content: breathingContent,
                showClose: true
            });
            
            // Breathing exercise logic would go here
        }
    }
    
    startFocusGame() {
        // Simple focus game - spot the difference
        const gameContent = `
            <div class="focus-game">
                <div class="game-instructions">
                    <h4>Spot the Difference</h4>
                    <p>Find 3 differences between the two images below.</p>
                </div>
                <div class="game-images">
                    <div class="image-container" id="image-a">
                        <div class="difference-spot" style="top: 20%; left: 30%;" data-difference="1"></div>
                        <div class="difference-spot" style="top: 60%; left: 70%;" data-difference="2"></div>
                        <div class="difference-spot" style="top: 80%; left: 40%;" data-difference="3"></div>
                    </div>
                    <div class="image-container" id="image-b"></div>
                </div>
                <div class="game-progress">
                    <div class="progress-text">Found: <span id="found-count">0</span>/3 differences</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="btn btn-secondary" data-action="close-modal">Close Game</button>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Focus Game',
                content: gameContent,
                showClose: true
            });
            
            // Game logic would go here
        }
    }
    
    showDistractionBlocker() {
        const blockerContent = `
            <div class="distraction-blocker">
                <div class="blocker-info">
                    <h4>Block Distractions</h4>
                    <p>Temporarily block distracting websites to improve focus.</p>
                </div>
                <div class="blocker-settings">
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="block-social" checked>
                            Block social media sites
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="block-videos">
                            Block video streaming sites
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="block-games">
                            Block gaming sites
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            Duration:
                            <select id="block-duration">
                                <option value="30">30 minutes</option>
                                <option value="60" selected>1 hour</option>
                                <option value="120">2 hours</option>
                                <option value="240">4 hours</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="blocker-actions">
                    <button class="btn btn-primary" id="activate-blocker">Activate Blocker</button>
                    <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        if (this.studentApp && this.studentApp.showModal) {
            this.studentApp.showModal({
                title: 'Distraction Blocker',
                content: blockerContent,
                showClose: true
            });
            
            // Blocker logic would go here
        }
    }
    
    showNotification(options) {
        if (this.studentApp && this.studentApp.showNotification) {
            this.studentApp.showNotification(options);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${options.type || 'info'}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${options.type === 'success' ? '✅' : options.type === 'error' ? '❌' : 'ℹ️'}</span>
                    <span class="notification-message">${options.title || 'Notification'}: ${options.message || ''}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">×</button>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
        }
    }
    
    refreshProgressData() {
        this.loadData().then(() => {
            this.renderProgressOverview();
            this.renderTodayLessons();
            this.renderAchievements();
        });
    }
    
    updateFocusDisplay(focusData) {
        const focusCircle = document.querySelector('.focus-circle');
        if (focusCircle) {
            const focusLevel = focusData?.focusLevel || 0.7;
            focusCircle.dataset.focusLevel = focusLevel;
            const circleValue = focusCircle.querySelector('.circle-value');
            if (circleValue) {
                circleValue.textContent = `${Math.round(focusLevel * 100)}%`;
            }
            
            // Update color based on focus level
            focusCircle.className = `focus-circle ${
                focusLevel > 0.6 ? 'good' : 
                focusLevel > 0.3 ? 'warning' : 'poor'
            }`;
        }
    }
    
    refreshEngagementData() {
        this.loadAdditionalData().then(() => {
            this.renderAchievements();
        });
    }
    
    startRealTimeUpdates() {
        // Update focus display every 10 seconds
        this.focusUpdateInterval = setInterval(() => {
            this.updateFocusDisplay({
                focusLevel: this.focusData?.average || 0.7
            });
        }, 10000);
        
        // Refresh data every 2 minutes
        this.dataRefreshInterval = setInterval(() => {
            this.loadAdditionalData();
        }, 120000);
    }
    
    // Utility methods
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    
    getMotivationalQuote() {
        const quotes = [
            "Every expert was once a beginner. Keep going!",
            "Mistakes are proof that you are trying.",
            "The beautiful thing about learning is that no one can take it away from you.",
            "Don't let what you cannot do interfere with what you can do.",
            "Your only limit is your mind. Keep learning, keep growing!",
            "Small progress is still progress. Celebrate every step!"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    formatDisability(disability) {
        const formats = {
            'dyslexia': 'Dyslexia',
            'adhd': 'ADHD',
            'autism': 'Autism Spectrum',
            'visual_impairment': 'Visual Impairment',
            'general': 'General Learning Needs'
        };
        return formats[disability] || disability;
    }
    
    formatSubject(subject) {
        if (!subject) return 'General';
        return subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    
    getSubjectIcon(subject) {
        const icons = {
            'Math': '🧮',
            'Reading': '📚',
            'Science': '🔬',
            'Writing': '✏️',
            'History': '📜',
            'English': '📖',
            'General': '📚'
        };
        return icons[subject] || '📖';
    }
    
    isToday(dateString) {
        if (!dateString) return false;
        try {
            const date = new Date(dateString);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        } catch (e) {
            return false;
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return '';
        }
    }
    
    formatTime(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            return '';
        }
    }
    
    getProgressTips() {
        const tips = [
            "Try to complete at least one lesson each day",
            "Review completed lessons to reinforce learning",
            "Take breaks every 25-30 minutes",
            "Use the focus tools when feeling distracted",
            "Ask your learning companion for help when stuck"
        ];
        
        // Return 2-3 random tips
        const count = Math.floor(Math.random() * 2) + 2;
        const shuffled = [...tips].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    getMotivationTip() {
        const tips = [
            "You're making great progress! Keep up the momentum.",
            "Remember why you started. You've got this!",
            "Every minute of learning brings you closer to your goals.",
            "Take a deep breath and tackle one thing at a time.",
            "Your effort today is an investment in your tomorrow."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
    
    getActivityIcon(type) {
        const icons = {
            'lesson_start': '🎯',
            'lesson_complete': '✅',
            'achievement': '🏆',
            'focus_session': '🎯',
            'break': '⏸️',
            'chat': '💬',
            'default': '📝'
        };
        return icons[type] || '📝';
    }
    
    // Cleanup
    destroy() {
        if (this.focusUpdateInterval) clearInterval(this.focusUpdateInterval);
        if (this.dataRefreshInterval) clearInterval(this.dataRefreshInterval);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is a student
    if (!Auth.isLoggedIn()) {
        console.log('User not logged in, redirecting to login');
        window.location.href = '../../shared/login.html';
        return;
    }
    
    if (!Auth.isStudent()) {
        console.log('User is not a student, redirecting to teacher dashboard');
        window.location.href = '../../html/teacher/dashboard.html';
        return;
    }
    
    // Create a fallback FocusMonitor if not available
    if (typeof FocusMonitor === 'undefined') {
        window.FocusMonitor = {
            getFocusLevel: () => 0.7,
            getFocusHistory: () => [],
            getAverageFocus: () => 0.7,
            getFocusTrend: () => 'stable',
            getRecentActivityCount: () => 0,
            needsBreak: () => false,
            suggestBreak: () => ({
                reason: 'Take a short break to refresh your mind',
                duration: 300,
                activities: ['Stretch', 'Look away', 'Breathe deeply']
            })
        };
    }
    
    // Create a fallback EngagementTracker if not available
    if (typeof EngagementTracker === 'undefined') {
        window.EngagementTracker = {
            getEngagementReport: () => ({
                currentScore: 0.7,
                trend: 'stable',
                recommendations: []
            }),
            getCurrentScore: () => 0.7,
            getTrend: () => 'stable'
        };
    }
    
    // Create a fallback Storage if not available
    if (typeof Storage === 'undefined') {
        window.Storage = {
            get: (key, defaultValue) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            set: (key, value) => {
                localStorage.setItem(key, JSON.stringify(value));
            }
        };
    }
    
    // Initialize dashboard
    setTimeout(() => {
        window.StudentDashboard = new StudentDashboard();
    }, 100);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentDashboard;
}