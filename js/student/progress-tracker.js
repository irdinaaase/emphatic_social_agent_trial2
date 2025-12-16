// js/student/progress-tracker.js
class ProgressTracker {
    constructor() {
        this.progressData = null;
        this.init();
    }
    
    init() {
        this.loadProgressData();
        console.log('Progress tracker initialized');
    }
    
    async loadProgressData() {
        try {
            this.progressData = Storage.get('student_progress') || await this.getMockProgressData();
            return this.progressData;
        } catch (error) {
            console.error('Error loading progress data:', error);
            return this.getMockProgressData();
        }
    }
    
    async getMockProgressData() {
        return {
            overallProgress: 78,
            weeklyProgress: [
                { day: 'Mon', value: 70 },
                { day: 'Tue', value: 75 },
                { day: 'Wed', value: 82 },
                { day: 'Thu', value: 78 },
                { day: 'Fri', value: 85 },
                { day: 'Sat', value: 65 },
                { day: 'Sun', value: 72 }
            ],
            subjectProgress: {
                math: { completed: 12, total: 15, percentage: 80 },
                reading: { completed: 8, total: 12, percentage: 67 },
                science: { completed: 6, total: 10, percentage: 60 },
                writing: { completed: 5, total: 8, percentage: 63 }
            },
            learningHistory: [
                { date: '2024-01-15', duration: 45, focus: 85, module: 'Fractions' },
                { date: '2024-01-14', duration: 30, focus: 78, module: 'Reading Comprehension' },
                { date: '2024-01-13', duration: 60, focus: 92, module: 'Solar System' },
                { date: '2024-01-12', duration: 25, focus: 65, module: 'Multiplication' }
            ],
            streak: 5,
            totalLearningTime: 2560,
            completedModules: 15,
            averageFocus: 82,
            goals: [
                { id: 'g1', title: 'Complete Math Course', progress: 80, target: 100 },
                { id: 'g2', title: 'Read 50 pages', progress: 65, target: 100 },
                { id: 'g3', title: 'Improve Writing', progress: 45, target: 100 }
            ]
        };
    }
    
    // Public methods for other modules to use
    updateProgress(moduleId, score) {
        if (!this.progressData) return;
        
        // Find and update module progress
        // This would be called when a module is completed
        
        // Save updated progress
        Storage.set('student_progress', this.progressData);
        
        // Trigger progress update event
        this.triggerProgressUpdate();
    }
    
    recordLearningSession(duration, focus, module) {
        const session = {
            date: new Date().toISOString(),
            duration: duration,
            focus: focus,
            module: module,
            timestamp: Date.now()
        };
        
        if (!this.progressData.learningHistory) {
            this.progressData.learningHistory = [];
        }
        
        this.progressData.learningHistory.unshift(session);
        
        // Update total learning time
        this.progressData.totalLearningTime += duration;
        
        // Update streak if this is a new day
        this.updateStreak();
        
        // Save to storage
        Storage.set('student_progress', this.progressData);
        
        return session;
    }
    
    updateStreak() {
        const today = new Date().toDateString();
        const lastSession = this.progressData.learningHistory?.[0];
        
        if (!lastSession) {
            this.progressData.streak = 1;
            return;
        }
        
        const lastDate = new Date(lastSession.date).toDateString();
        
        if (today === lastDate) {
            // Already have session today, don't increment
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
            // Consecutive day
            this.progressData.streak++;
        } else {
            // Broken streak
            this.progressData.streak = 1;
        }
    }
    
    getOverallProgress() {
        return this.progressData?.overallProgress || 0;
    }
    
    getSubjectProgress(subject) {
        return this.progressData?.subjectProgress?.[subject] || { percentage: 0 };
    }
    
    getWeeklyProgress() {
        return this.progressData?.weeklyProgress || [];
    }
    
    getLearningHistory(limit = 10) {
        return this.progressData?.learningHistory?.slice(0, limit) || [];
    }
    
    getStreak() {
        return this.progressData?.streak || 0;
    }
    
    getTotalLearningTime() {
        return this.progressData?.totalLearningTime || 0;
    }
    
    addGoal(title, target) {
        if (!this.progressData.goals) {
            this.progressData.goals = [];
        }
        
        const goal = {
            id: Utils.generateId('goal'),
            title: title,
            progress: 0,
            target: target,
            created: new Date().toISOString()
        };
        
        this.progressData.goals.push(goal);
        Storage.set('student_progress', this.progressData);
        
        return goal;
    }
    
    updateGoalProgress(goalId, progress) {
        const goal = this.progressData.goals?.find(g => g.id === goalId);
        if (goal) {
            goal.progress = Math.min(progress, goal.target);
            Storage.set('student_progress', this.progressData);
            
            // Check if goal is completed
            if (goal.progress >= goal.target) {
                this.triggerGoalCompleted(goal);
            }
            
            return true;
        }
        return false;
    }
    
    triggerProgressUpdate() {
        const event = new CustomEvent('progress-updated', {
            detail: { progress: this.progressData }
        });
        document.dispatchEvent(event);
    }
    
    triggerGoalCompleted(goal) {
        const event = new CustomEvent('goal-completed', {
            detail: { goal: goal }
        });
        document.dispatchEvent(event);
    }
    
    // Generate progress report
    generateReport(type = 'weekly') {
        const report = {
            type: type,
            generated: new Date().toISOString(),
            overallProgress: this.getOverallProgress(),
            streak: this.getStreak(),
            totalTime: this.getTotalLearningTime(),
            subjectBreakdown: this.progressData?.subjectProgress || {},
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        // Find weakest subject
        const subjects = this.progressData?.subjectProgress || {};
        let weakestSubject = null;
        let lowestScore = 100;
        
        for (const [subject, data] of Object.entries(subjects)) {
            if (data.percentage < lowestScore) {
                lowestScore = data.percentage;
                weakestSubject = subject;
            }
        }
        
        if (weakestSubject && lowestScore < 70) {
            recommendations.push({
                type: 'improvement',
                message: `Focus on ${weakestSubject}. Your current score is ${lowestScore}%.`,
                priority: 'high'
            });
        }
        
        // Check streak
        if (this.progressData?.streak < 3) {
            recommendations.push({
                type: 'consistency',
                message: 'Try to maintain a daily learning habit to build your streak!',
                priority: 'medium'
            });
        }
        
        // Check focus level
        if (this.progressData?.averageFocus < 70) {
            recommendations.push({
                type: 'focus',
                message: 'Try using focus tools to improve your concentration during sessions.',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
    
    // Export progress data
    exportData(format = 'json') {
        const data = {
            student: Auth.getCurrentUser()?.email || 'Unknown',
            exportDate: new Date().toISOString(),
            progressData: this.progressData
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            // Convert to CSV format
            const csvRows = [];
            csvRows.push(['Date', 'Duration (min)', 'Focus (%)', 'Module']);
            
            if (this.progressData.learningHistory) {
                this.progressData.learningHistory.forEach(session => {
                    csvRows.push([
                        session.date,
                        session.duration,
                        session.focus,
                        session.module
                    ]);
                });
            }
            
            return csvRows.map(row => row.join(',')).join('\n');
        }
        
        return data;
    }
    
    // Reset progress (for testing/debugging)
    resetProgress() {
        this.progressData = this.getMockProgressData();
        Storage.set('student_progress', this.progressData);
        this.triggerProgressUpdate();
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.ProgressTracker = new ProgressTracker();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}