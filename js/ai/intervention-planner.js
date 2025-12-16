// js/ai/intervention-planner.js
class InterventionPlanner {
    constructor() {
        this.interventions = this.loadInterventions();
        this.history = [];
        this.effectivenessTracker = {};
        
        this.init();
    }
    
    init() {
        this.loadEffectivenessData();
        console.log('Intervention planner initialized');
    }
    
    loadInterventions() {
        return {
            // Emotional support interventions
            emotional_support: [
                {
                    id: 'emotion-001',
                    type: 'encouragement',
                    title: 'Words of Encouragement',
                    description: 'Provide positive reinforcement and encouragement',
                    triggers: ['frustration', 'low_confidence', 'sadness'],
                    actions: [
                        'Say: "You\'re doing great! Keep going!"',
                        'Remind of past successes',
                        'Offer motivational quote'
                    ],
                    duration: 'immediate',
                    effectiveness: 0.8
                },
                {
                    id: 'emotion-002',
                    type: 'calming',
                    title: 'Calming Exercise',
                    description: 'Guide through calming breathing exercises',
                    triggers: ['anxiety', 'frustration', 'stress'],
                    actions: [
                        'Guide 4-7-8 breathing',
                        'Suggest taking a moment',
                        'Offer calming visual'
                    ],
                    duration: '2 minutes',
                    effectiveness: 0.7
                },
                {
                    id: 'emotion-003',
                    type: 'empathy',
                    title: 'Empathetic Listening',
                    description: 'Acknowledge feelings and show understanding',
                    triggers: ['frustration', 'confusion', 'overwhelm'],
                    actions: [
                        'Acknowledge: "I understand this is challenging"',
                        'Validate feelings',
                        'Offer to help differently'
                    ],
                    duration: 'immediate',
                    effectiveness: 0.75
                }
            ],
            
            // Focus interventions
            focus_assistance: [
                {
                    id: 'focus-001',
                    type: 'timer',
                    title: 'Pomodoro Timer',
                    description: 'Set focused work intervals with breaks',
                    triggers: ['distraction', 'low_focus', 'procrastination'],
                    actions: [
                        'Set 25-minute focus timer',
                        'Schedule 5-minute break',
                        'Provide progress tracking'
                    ],
                    duration: '25 minutes',
                    effectiveness: 0.85
                },
                {
                    id: 'focus-002',
                    type: 'exercise',
                    title: 'Focus Exercise',
                    description: 'Short activity to improve concentration',
                    triggers: ['mind_wandering', 'restlessness'],
                    actions: [
                        'Spot the difference game',
                        'Counting exercise',
                        'Attention shifting practice'
                    ],
                    duration: '3 minutes',
                    effectiveness: 0.65
                },
                {
                    id: 'focus-003',
                    type: 'environment',
                    title: 'Environment Check',
                    description: 'Suggest environment improvements',
                    triggers: ['frequent_distractions', 'noise_sensitivity'],
                    actions: [
                        'Suggest quiet space',
                        'Recommend headphones',
                        'Remove visual distractions'
                    ],
                    duration: 'immediate',
                    effectiveness: 0.6
                }
            ],
            
            // Learning difficulty interventions
            learning_support: [
                {
                    id: 'learn-001',
                    type: 'hint',
                    title: 'Progressive Hints',
                    description: 'Provide hints that increase in specificity',
                    triggers: ['stuck', 'confusion', 'difficulty'],
                    actions: [
                        'Give subtle hint',
                        'Offer more specific guidance',
                        'Show worked example'
                    ],
                    duration: 'immediate',
                    effectiveness: 0.9
                },
                {
                    id: 'learn-002',
                    type: 'alternative',
                    title: 'Alternative Explanation',
                    description: 'Explain concept in different way',
                    triggers: ['misunderstanding', 'confusion'],
                    actions: [
                        'Use analogy',
                        'Show visual representation',
                        'Break into smaller steps'
                    ],
                    duration: '5 minutes',
                    effectiveness: 0.8
                },
                {
                    id: 'learn-003',
                    type: 'scaffolding',
                    title: 'Learning Scaffolds',
                    description: 'Provide support structures',
                    triggers: ['overwhelm', 'complex_task'],
                    actions: [
                        'Provide template',
                        'Offer step-by-step guide',
                        'Give vocabulary support'
                    ],
                    duration: 'variable',
                    effectiveness: 0.85
                }
            ],
            
            // Motivation interventions
            motivation_boost: [
                {
                    id: 'motivate-001',
                    type: 'goal',
                    title: 'Goal Setting',
                    description: 'Help set achievable learning goals',
                    triggers: ['lack_motivation', 'aimlessness'],
                    actions: [
                        'Set SMART goal',
                        'Break into milestones',
                        'Track progress visually'
                    ],
                    duration: '5 minutes',
                    effectiveness: 0.75
                },
                {
                    id: 'motivate-002',
                    type: 'reward',
                    title: 'Reward System',
                    description: 'Implement immediate rewards',
                    triggers: ['boredom', 'low_engagement'],
                    actions: [
                        'Offer virtual badge',
                        'Track streak',
                        'Provide positive feedback'
                    ],
                    duration: 'immediate',
                    effectiveness: 0.7
                },
                {
                    id: 'motivate-003',
                    type: 'social',
                    title: 'Social Motivation',
                    description: 'Connect learning to social aspects',
                    triggers: ['loneliness', 'need_connection'],
                    actions: [
                        'Share progress with teacher',
                        'Connect with peer',
                        'Join study group'
                    ],
                    duration: 'variable',
                    effectiveness: 0.65
                }
            ]
        };
    }
    
    loadEffectivenessData() {
        this.effectivenessTracker = Storage.get('intervention_effectiveness', {});
    }
    
    saveEffectivenessData() {
        Storage.set('intervention_effectiveness', this.effectivenessTracker);
    }
    
    planIntervention(studentState, context) {
        const triggers = this.identifyTriggers(studentState, context);
        const suitableInterventions = this.findSuitableInterventions(triggers);
        const rankedInterventions = this.rankInterventions(suitableInterventions, studentState);
        
        const selected = this.selectOptimalIntervention(rankedInterventions);
        
        if (selected) {
            return {
                ...selected,
                plannedAt: new Date().toISOString(),
                context: context,
                studentStateAtTime: { ...studentState }
            };
        }
        
        return null;
    }
    
    identifyTriggers(studentState, context) {
        const triggers = [];
        
        // Emotional triggers
        if (studentState.emotion === 'frustrated' || studentState.frustrationLevel > 0.6) {
            triggers.push('frustration');
        }
        if (studentState.emotion === 'confused') {
            triggers.push('confusion');
        }
        if (studentState.emotion === 'bored') {
            triggers.push('boredom');
        }
        if (studentState.confidence < 0.3) {
            triggers.push('low_confidence');
        }
        
        // Focus triggers
        if (studentState.focus < 0.3) {
            triggers.push('low_focus', 'distraction');
        }
        
        // Learning triggers
        if (context.attempts > 3) {
            triggers.push('stuck', 'difficulty');
        }
        if (context.timeSpent > 300) { // 5 minutes on one task
            triggers.push('overwhelm');
        }
        
        // Engagement triggers
        if (studentState.engagement < 0.4) {
            triggers.push('low_engagement', 'lack_motivation');
        }
        
        return [...new Set(triggers)]; // Remove duplicates
    }
    
    findSuitableInterventions(triggers) {
        const suitable = [];
        
        for (const [category, interventions] of Object.entries(this.interventions)) {
            for (const intervention of interventions) {
                if (intervention.triggers.some(trigger => triggers.includes(trigger))) {
                    suitable.push({
                        ...intervention,
                        category: category,
                        triggerMatch: intervention.triggers.filter(t => triggers.includes(t)).length,
                        recentEffectiveness: this.getRecentEffectiveness(intervention.id)
                    });
                }
            }
        }
        
        return suitable;
    }
    
    rankInterventions(interventions, studentState) {
        return interventions.map(intervention => {
            let score = intervention.effectiveness;
            
            // Adjust based on recent effectiveness
            if (intervention.recentEffectiveness) {
                score = (score + intervention.recentEffectiveness) / 2;
            }
            
            // Adjust based on trigger match
            score += intervention.triggerMatch * 0.1;
            
            // Adjust based on student preferences (if available)
            const preferences = this.getStudentPreferences();
            if (preferences.preferredInterventions?.includes(intervention.type)) {
                score += 0.2;
            }
            
            // Adjust based on time of day
            score += this.getTimeOfDayAdjustment();
            
            // Penalize if used recently
            if (this.wasUsedRecently(intervention.id)) {
                score -= 0.3;
            }
            
            return {
                ...intervention,
                score: Math.max(0.1, Math.min(1.0, score))
            };
        }).sort((a, b) => b.score - a.score);
    }
    
    getRecentEffectiveness(interventionId) {
        const history = this.effectivenessTracker[interventionId];
        if (!history || history.length === 0) return null;
        
        // Calculate average effectiveness from recent uses
        const recent = history.slice(-5); // Last 5 uses
        const sum = recent.reduce((total, record) => total + record.effectiveness, 0);
        return sum / recent.length;
    }
    
    getStudentPreferences() {
        return Storage.get('student_preferences', {
            preferredInterventions: [],
            dislikedInterventions: []
        });
    }
    
    getTimeOfDayAdjustment() {
        const hour = new Date().getHours();
        
        if (hour >= 9 && hour <= 11) {
            return 0.1; // Morning peak
        } else if (hour >= 14 && hour <= 16) {
            return 0.05; // Afternoon
        } else if (hour >= 20 || hour <= 7) {
            return -0.1; // Evening/night
        }
        
        return 0;
    }
    
    wasUsedRecently(interventionId) {
        const recentUses = this.history.filter(record => 
            record.interventionId === interventionId &&
            Date.now() - new Date(record.timestamp).getTime() < 3600000 // Last hour
        );
        
        return recentUses.length > 0;
    }
    
    selectOptimalIntervention(rankedInterventions) {
        if (rankedInterventions.length === 0) return null;
        
        // Top 3 candidates
        const candidates = rankedInterventions.slice(0, 3);
        
        // Add some randomness to avoid predictability
        const randomFactor = Math.random();
        let selected;
        
        if (randomFactor < 0.6) {
            selected = candidates[0]; // 60% chance for top choice
        } else if (randomFactor < 0.9) {
            selected = candidates[1]; // 30% chance for second choice
        } else {
            selected = candidates[2]; // 10% chance for third choice
        }
        
        return selected;
    }
    
    executeIntervention(interventionPlan) {
        console.log('Executing intervention:', interventionPlan.title);
        
        const execution = {
            ...interventionPlan,
            executedAt: new Date().toISOString(),
            executionId: `interv-${Date.now()}`
        };
        
        this.history.push(execution);
        
        // Keep history manageable
        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
        }
        
        // Dispatch event for UI to handle
        const event = new CustomEvent('interventionExecuted', {
            detail: execution
        });
        window.dispatchEvent(event);
        
        return execution;
    }
    
    recordEffectiveness(interventionId, effectiveness, feedback = null) {
        if (!this.effectivenessTracker[interventionId]) {
            this.effectivenessTracker[interventionId] = [];
        }
        
        const record = {
            interventionId: interventionId,
            effectiveness: effectiveness,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
        
        this.effectivenessTracker[interventionId].push(record);
        
        // Keep only last 20 records per intervention
        if (this.effectivenessTracker[interventionId].length > 20) {
            this.effectivenessTracker[interventionId] = 
                this.effectivenessTracker[interventionId].slice(-20);
        }
        
        this.saveEffectivenessData();
        
        console.log(`Recorded effectiveness for ${interventionId}: ${effectiveness}`);
    }
    
    calculateEffectiveness(interventionId, studentStateBefore, studentStateAfter) {
        // Calculate improvement in key metrics
        const improvements = {
            frustration: Math.max(0, studentStateBefore.frustrationLevel - studentStateAfter.frustrationLevel),
            focus: Math.max(0, studentStateAfter.focus - studentStateBefore.focus),
            confidence: Math.max(0, studentStateAfter.confidence - studentStateBefore.confidence),
            engagement: Math.max(0, studentStateAfter.engagement - studentStateBefore.engagement)
        };
        
        // Weighted average of improvements
        const weights = {
            frustration: 0.3,
            focus: 0.3,
            confidence: 0.2,
            engagement: 0.2
        };
        
        let effectiveness = 0;
        for (const [metric, improvement] of Object.entries(improvements)) {
            effectiveness += improvement * weights[metric];
        }
        
        // Normalize to 0-1 scale
        effectiveness = Math.max(0, Math.min(1, effectiveness * 2));
        
        return effectiveness;
    }
    
    getInterventionHistory(duration = 86400000) { // Default: last 24 hours
        const cutoff = Date.now() - duration;
        return this.history.filter(record => 
            new Date(record.timestamp).getTime() > cutoff
        );
    }
    
    getMostEffectiveInterventions(category = null) {
        const interventions = category ? 
            this.interventions[category] : 
            Object.values(this.interventions).flat();
        
        return interventions.map(intervention => ({
            ...intervention,
            recentEffectiveness: this.getRecentEffectiveness(intervention.id) || 0
        })).sort((a, b) => 
            (b.recentEffectiveness || 0) - (a.recentEffectiveness || 0)
        ).slice(0, 5);
    }
    
    getStudentSpecificRecommendations(studentProfile) {
        const recommendations = [];
        const history = this.getInterventionHistory(604800000); // Last week
        
        // Analyze which interventions worked well for this student
        const studentHistory = history.filter(record => 
            record.studentStateAtTime?.disabilityType === studentProfile.disabilityType
        );
        
        if (studentHistory.length > 0) {
            const effectivenessByType = {};
            
            studentHistory.forEach(record => {
                if (!effectivenessByType[record.type]) {
                    effectivenessByType[record.type] = { total: 0, count: 0 };
                }
                
                const effectiveness = this.calculateEffectiveness(
                    record.id,
                    record.studentStateAtTime,
                    { /* would need after state */ }
                );
                
                effectivenessByType[record.type].total += effectiveness;
                effectivenessByType[record.type].count++;
            });
            
            // Find best performing types
            Object.entries(effectivenessByType).forEach(([type, data]) => {
                const avg = data.total / data.count;
                if (avg > 0.7) {
                    recommendations.push({
                        type: type,
                        effectiveness: avg,
                        frequency: data.count
                    });
                }
            });
        }
        
        return recommendations.sort((a, b) => b.effectiveness - a.effectiveness);
    }
    
    reset() {
        this.history = [];
        this.effectivenessTracker = {};
        console.log('Intervention planner reset');
    }
}

// Create global instance
window.InterventionPlanner = new InterventionPlanner();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterventionPlanner;
}