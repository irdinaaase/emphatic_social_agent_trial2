// js/ai/engagement-tracker.js
class EngagementTracker {
    constructor() {
        this.engagementScore = 0.7; // 0.0 to 1.0
        this.engagementHistory = [];
        this.engagementFactors = {
            interaction: 0.3,
            completion: 0.4,
            timeSpent: 0.2,
            emotionalState: 0.1
        };
        this.metrics = {
            interactionsPerMinute: 0,
            completionRate: 0,
            averageTimePerTask: 0,
            positiveFeedbackCount: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupMetricsCollection();
        this.startPeriodicUpdate();
        console.log('Engagement tracker initialized');
    }
    
    setupMetricsCollection() {
        // Track lesson interactions
        document.addEventListener('lessonInteraction', (e) => {
            this.recordInteraction(e.detail);
        });
        
        // Track completions
        document.addEventListener('taskCompleted', (e) => {
            this.recordCompletion(e.detail);
        });
        
        // Track time spent
        document.addEventListener('timeUpdate', (e) => {
            this.recordTimeSpent(e.detail);
        });
        
        // Track emotional feedback
        document.addEventListener('emotionalFeedback', (e) => {
            this.recordEmotionalFeedback(e.detail);
        });
    }
    
    startPeriodicUpdate() {
        setInterval(() => {
            this.calculateEngagementScore();
            this.recordEngagementSnapshot();
            this.checkEngagementLevel();
        }, 30000); // Update every 30 seconds
    }
    
    recordInteraction(interaction) {
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        // Count interactions in last minute
        const recentInteractions = this.engagementHistory.filter(
            record => record.timestamp > minuteAgo && record.type === 'interaction'
        ).length;
        
        this.metrics.interactionsPerMinute = recentInteractions;
        
        this.engagementHistory.push({
            type: 'interaction',
            detail: interaction,
            timestamp: now
        });
    }
    
    recordCompletion(completion) {
        this.metrics.completionRate = completion.rate || 0;
        
        this.engagementHistory.push({
            type: 'completion',
            detail: completion,
            timestamp: Date.now()
        });
    }
    
    recordTimeSpent(timeData) {
        this.metrics.averageTimePerTask = timeData.averageTime || 0;
        
        this.engagementHistory.push({
            type: 'time_spent',
            detail: timeData,
            timestamp: Date.now()
        });
    }
    
    recordEmotionalFeedback(feedback) {
        if (feedback.sentiment === 'positive') {
            this.metrics.positiveFeedbackCount++;
        }
        
        this.engagementHistory.push({
            type: 'emotional_feedback',
            detail: feedback,
            timestamp: Date.now()
        });
    }
    
    calculateEngagementScore() {
        let score = 0;
        
        // Calculate based on interaction rate
        const optimalInteractions = 10; // per minute
        const interactionFactor = Math.min(this.metrics.interactionsPerMinute / optimalInteractions, 1);
        score += interactionFactor * this.engagementFactors.interaction;
        
        // Calculate based on completion rate
        score += this.metrics.completionRate * this.engagementFactors.completion;
        
        // Calculate based on time spent (optimal is 2-5 minutes per task)
        const optimalTime = 180; // 3 minutes in seconds
        const timeFactor = this.metrics.averageTimePerTask > 0 ? 
            Math.min(this.metrics.averageTimePerTask / optimalTime, 1) : 0;
        score += timeFactor * this.engagementFactors.timeSpent;
        
        // Calculate based on positive feedback (normalized)
        const positiveFeedbackFactor = Math.min(this.metrics.positiveFeedbackCount / 10, 1);
        score += positiveFeedbackFactor * this.engagementFactors.emotionalState;
        
        // Apply decay for inactivity
        const lastInteraction = this.getLastInteractionTime();
        const minutesSinceLast = (Date.now() - lastInteraction) / 60000;
        if (minutesSinceLast > 5) {
            score *= Math.max(0, 1 - (minutesSinceLast - 5) * 0.1);
        }
        
        this.engagementScore = Math.max(0, Math.min(1, score));
        
        return this.engagementScore;
    }
    
    getLastInteractionTime() {
        const interactions = this.engagementHistory.filter(
            record => record.type === 'interaction'
        );
        
        if (interactions.length === 0) return Date.now();
        
        return Math.max(...interactions.map(i => i.timestamp));
    }
    
    recordEngagementSnapshot() {
        const snapshot = {
            score: this.engagementScore,
            metrics: { ...this.metrics },
            timestamp: Date.now()
        };
        
        // Store in history
        const history = Storage.get('engagement_history', []);
        history.push(snapshot);
        
        // Keep only last 1000 snapshots
        if (history.length > 1000) {
            history.splice(0, history.length - 1000);
        }
        
        Storage.set('engagement_history', history);
        
        // Dispatch update event
        const event = new CustomEvent('engagementUpdate', {
            detail: snapshot
        });
        window.dispatchEvent(event);
    }
    
    checkEngagementLevel() {
        const level = this.getEngagementLevel();
        
        if (level === 'low') {
            this.triggerLowEngagementWarning();
        } else if (level === 'high') {
            this.recordHighEngagement();
        }
    }
    
    getEngagementLevel() {
        if (this.engagementScore >= 0.7) return 'high';
        if (this.engagementScore >= 0.4) return 'medium';
        return 'low';
    }
    
    triggerLowEngagementWarning() {
        const warning = {
            type: 'low_engagement',
            severity: 'medium',
            score: this.engagementScore,
            timestamp: new Date().toISOString(),
            suggestions: this.generateEngagementSuggestions()
        };
        
        console.log('Low engagement warning:', warning);
        
        const event = new CustomEvent('engagementWarning', {
            detail: warning
        });
        window.dispatchEvent(event);
        
        // If engagement has been low for extended period, alert teacher
        if (this.isPersistentlyLow()) {
            this.alertTeacher(warning);
        }
    }
    
    isPersistentlyLow() {
        const history = this.getEngagementHistory(600000); // Last 10 minutes
        if (history.length < 5) return false;
        
        const lowScores = history.filter(snapshot => 
            snapshot.score < 0.4
        ).length;
        
        return lowScores > history.length * 0.8; // 80% of time with low engagement
    }
    
    recordHighEngagement() {
        const achievement = {
            type: 'high_engagement',
            score: this.engagementScore,
            timestamp: new Date().toISOString(),
            streak: this.getHighEngagementStreak()
        };
        
        // Store achievement
        const achievements = Storage.get('engagement_achievements', []);
        achievements.push(achievement);
        Storage.set('engagement_achievements', achievements);
        
        // Dispatch event for positive reinforcement
        const event = new CustomEvent('engagementAchievement', {
            detail: achievement
        });
        window.dispatchEvent(event);
    }
    
    getHighEngagementStreak() {
        const history = this.getEngagementHistory(3600000); // Last hour
        let streak = 0;
        
        // Count consecutive high engagement snapshots
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].score >= 0.7) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    generateEngagementSuggestions() {
        const suggestions = [];
        
        if (this.metrics.interactionsPerMinute < 5) {
            suggestions.push('Try interacting more with the learning materials');
        }
        
        if (this.metrics.completionRate < 0.5) {
            suggestions.push('Break tasks into smaller, manageable parts');
        }
        
        if (this.metrics.averageTimePerTask > 300) { // > 5 minutes
            suggestions.push('Consider taking a break if stuck on a task');
        }
        
        if (this.metrics.positiveFeedbackCount < 3) {
            suggestions.push('Celebrate small successes to stay motivated');
        }
        
        // Add general suggestions
        suggestions.push(
            'Change learning activity to something more interesting',
            'Set a clear goal for this learning session',
            'Use the focus tools to improve concentration'
        );
        
        return suggestions;
    }
    
    alertTeacher(warning) {
        const teacherAlert = {
            ...warning,
            studentId: Auth.getCurrentUser()?.id,
            studentName: Auth.getCurrentUser()?.name,
            subject: 'Low Engagement Alert',
            metrics: { ...this.metrics }
        };
        
        console.log('Teacher engagement alert:', teacherAlert);
        
        const event = new CustomEvent('teacherEngagementAlert', {
            detail: teacherAlert
        });
        window.dispatchEvent(event);
    }
    
    getEngagementScore() {
        return this.engagementScore;
    }
    
    getEngagementHistory(duration = 3600000) { // Default: last hour
        const history = Storage.get('engagement_history', []);
        const cutoff = Date.now() - duration;
        
        return history.filter(snapshot => 
            snapshot.timestamp > cutoff
        );
    }
    
    getEngagementTrend() {
        const recentHistory = this.getEngagementHistory(300000); // Last 5 minutes
        if (recentHistory.length < 2) return 'stable';
        
        const first = recentHistory[0].score;
        const last = recentHistory[recentHistory.length - 1].score;
        const difference = last - first;
        
        if (difference > 0.1) return 'improving';
        if (difference < -0.1) return 'declining';
        return 'stable';
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    resetMetrics() {
        this.metrics = {
            interactionsPerMinute: 0,
            completionRate: 0,
            averageTimePerTask: 0,
            positiveFeedbackCount: 0
        };
        
        this.engagementScore = 0.7;
        console.log('Engagement metrics reset');
    }
    
    getEngagementReport() {
        return {
            currentScore: this.engagementScore,
            level: this.getEngagementLevel(),
            trend: this.getEngagementTrend(),
            metrics: this.getMetrics(),
            timestamp: new Date().toISOString(),
            suggestions: this.generateEngagementSuggestions()
        };
    }
}

// Create global instance
window.EngagementTracker = new EngagementTracker();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EngagementTracker;
}