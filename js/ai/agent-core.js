// js/ai/agent-core.js
class EmpathicAgent {
    constructor() {
        this.name = Config.AI_AGENT.NAME;
        this.avatar = Config.AI_AGENT.AVATAR;
        this.isActive = false;
        this.conversationHistory = [];
        this.studentState = {
            emotion: 'neutral',
            focus: 1.0,
            confidence: 0.5,
            engagement: 0.7,
            frustrationLevel: 0.0
        };
        this.interventionHistory = [];
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.setupEventListeners();
        console.log(`${this.name} initialized`);
    }
    
    loadHistory() {
        const memory = Storage.getAgentMemory();
        if (memory) {
            this.conversationHistory = memory.conversationHistory || [];
            this.interventionHistory = memory.interventionHistory || [];
        }
    }
    
    saveHistory() {
        const memory = Storage.getAgentMemory();
        if (memory) {
            memory.conversationHistory = this.conversationHistory;
            memory.interventionHistory = this.interventionHistory;
            Storage.saveAgentMemory(memory);
        }
    }
    
    setupEventListeners() {
        // Listen for student activity
        document.addEventListener('studentActivity', (e) => {
            this.updateStudentState(e.detail);
        });
        
        // Listen for learning events
        document.addEventListener('lessonStarted', (e) => {
            this.onLessonStart(e.detail);
        });
        
        document.addEventListener('lessonCompleted', (e) => {
            this.onLessonComplete(e.detail);
        });
        
        document.addEventListener('lessonStruggle', (e) => {
            this.onLessonStruggle(e.detail);
        });
        
        // Listen for focus events
        document.addEventListener('focusLost', (e) => {
            this.onFocusLost(e.detail);
        });
        
        document.addEventListener('focusRegained', (e) => {
            this.onFocusRegained(e.detail);
        });
    }
    
    async chat(message) {
        if (!this.isActive) {
            this.activate();
        }
        
        // Add student message to history
        this.addConversation('student', message);
        
        // Analyze student message
        const analysis = await this.analyzeMessage(message);
        
        // Update student state based on analysis
        this.updateStateFromAnalysis(analysis);
        
        // Generate response
        const response = await this.generateResponse(message, analysis);
        
        // Add agent response to history
        this.addConversation('agent', response.message);
        
        // Check if intervention is needed
        const intervention = await this.checkForIntervention();
        if (intervention.needed) {
            await this.performIntervention(intervention);
        }
        
        // Save history
        this.saveHistory();
        
        return response;
    }
    
    async analyzeMessage(message) {
        // Mock analysis - in real implementation, this would use NLP
        const emotions = this.detectEmotion(message);
        const intent = this.detectIntent(message);
        const urgency = this.detectUrgency(message);
        
        return {
            emotions: emotions,
            intent: intent,
            urgency: urgency,
            keywords: this.extractKeywords(message),
            sentiment: this.analyzeSentiment(message),
            timestamp: new Date().toISOString()
        };
    }
    
    detectEmotion(message) {
        const emotionKeywords = {
            happy: ['great', 'good', 'awesome', 'excited', 'love', 'fun'],
            sad: ['sad', 'upset', 'unhappy', 'bad', 'terrible'],
            frustrated: ['frustrated', 'angry', 'mad', 'annoyed', 'stuck'],
            confused: ['confused', 'dont understand', 'help', '?', 'what'],
            bored: ['bored', 'tired', 'boring', 'sick of', 'enough']
        };
        
        const detected = [];
        const lowerMessage = message.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                detected.push(emotion);
            }
        }
        
        return detected.length > 0 ? detected : ['neutral'];
    }
    
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return 'request_help';
        } else if (lowerMessage.includes('break') || lowerMessage.includes('tired')) {
            return 'request_break';
        } else if (lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
            return 'report_difficulty';
        } else if (lowerMessage.includes('done') || lowerMessage.includes('finished')) {
            return 'report_completion';
        } else {
            return 'general_chat';
        }
    }
    
    detectUrgency(message) {
        const urgentWords = ['help', 'emergency', 'urgent', 'now', 'immediately'];
        const lowerMessage = message.toLowerCase();
        
        if (urgentWords.some(word => lowerMessage.includes(word))) {
            return 'high';
        } else if (lowerMessage.includes('?')) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    extractKeywords(message) {
        // Simple keyword extraction
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = message.toLowerCase().split(/\W+/);
        return words.filter(word => 
            word.length > 2 && !commonWords.includes(word)
        );
    }
    
    analyzeSentiment(message) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'excited'];
        const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'angry', 'frustrated'];
        
        let score = 0;
        const lowerMessage = message.toLowerCase();
        
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) score += 1;
        });
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) score -= 1;
        });
        
        return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    }
    
    async generateResponse(message, analysis) {
        // Mock response generation
        await new Promise(resolve => 
            setTimeout(resolve, Config.AI_AGENT.RESPONSE_DELAY)
        );
        
        const responses = {
            request_help: [
                "I'd be happy to help! Let me explain that in a different way.",
                "I understand you need help. Let's work through this together.",
                "That's a great question! Here's how I can help..."
            ],
            request_break: [
                "Taking breaks is important! How about a 5-minute break?",
                "I notice you might need a rest. Let's pause for a moment.",
                "Good idea to take a break! You'll come back refreshed."
            ],
            report_difficulty: [
                "It's okay to find this challenging. Let's break it down.",
                "I understand this is difficult. Would you like a hint?",
                "Don't worry, everyone finds this tough at first. Let me help."
            ],
            report_completion: [
                "Fantastic work! You should be proud of yourself.",
                "Congratulations on completing that! Ready for the next challenge?",
                "Well done! Your hard work is paying off."
            ],
            general_chat: [
                "I'm here to support you. How are you feeling about the lesson?",
                "Thanks for sharing! Let's keep going with the learning.",
                "I appreciate you talking to me. How can I help you learn better?"
            ]
        };
        
        const responsePool = responses[analysis.intent] || responses.general_chat;
        const randomResponse = responsePool[Math.floor(Math.random() * responsePool.length)];
        
        return {
            message: randomResponse,
            type: analysis.intent,
            suggestions: this.generateSuggestions(analysis),
            emotion: 'empathetic'
        };
    }
    
    generateSuggestions(analysis) {
        const suggestions = [];
        
        if (analysis.emotions.includes('frustrated')) {
            suggestions.push('Take a deep breath', 'Try a different approach', 'Ask for a hint');
        }
        
        if (analysis.emotions.includes('confused')) {
            suggestions.push('Review the instructions', 'Watch the video again', 'Ask specific questions');
        }
        
        if (analysis.emotions.includes('bored')) {
            suggestions.push('Take a short break', 'Try a different activity', 'Set a timer for focus');
        }
        
        if (analysis.intent === 'request_help') {
            suggestions.push('Break it into smaller steps', 'Look at similar examples', 'Explain it in your own words');
        }
        
        return suggestions.length > 0 ? suggestions : ['Keep up the good work!', 'You\'re doing great!'];
    }
    
    updateStudentState(activity) {
        // Update student state based on activity
        if (activity.type === 'focus') {
            this.studentState.focus = activity.value;
        } else if (activity.type === 'emotion') {
            this.studentState.emotion = activity.value;
        } else if (activity.type === 'confidence') {
            this.studentState.confidence = activity.value;
        }
        
        // Check if teacher alert is needed
        this.checkForTeacherAlert();
    }
    
    updateStateFromAnalysis(analysis) {
        // Update based on message analysis
        if (analysis.emotions.includes('frustrated')) {
            this.studentState.frustrationLevel += 0.2;
            this.studentState.emotion = 'frustrated';
        }
        
        if (analysis.emotions.includes('confused')) {
            this.studentState.confidence -= 0.1;
        }
        
        if (analysis.sentiment === 'positive') {
            this.studentState.confidence += 0.1;
        }
    }
    
    async checkForIntervention() {
        const needsIntervention = 
            this.studentState.frustrationLevel > Config.AI_AGENT.INTERVENTION_THRESHOLDS.FRUSTRATION ||
            this.studentState.focus < 0.3 ||
            this.studentState.confidence < 0.3;
        
        if (needsIntervention) {
            return {
                needed: true,
                type: this.determineInterventionType(),
                severity: this.determineInterventionSeverity(),
                reason: this.getInterventionReason()
            };
        }
        
        return { needed: false };
    }
    
    determineInterventionType() {
        if (this.studentState.frustrationLevel > 0.7) {
            return 'emotional_support';
        } else if (this.studentState.focus < 0.3) {
            return 'focus_assistance';
        } else if (this.studentState.confidence < 0.3) {
            return 'confidence_boost';
        } else {
            return 'general_guidance';
        }
    }
    
    determineInterventionSeverity() {
        if (this.studentState.frustrationLevel > 0.8 || this.studentState.focus < 0.2) {
            return 'high';
        } else if (this.studentState.frustrationLevel > 0.6 || this.studentState.focus < 0.4) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    getInterventionReason() {
        if (this.studentState.frustrationLevel > 0.7) {
            return 'High frustration level detected';
        } else if (this.studentState.focus < 0.3) {
            return 'Low focus level detected';
        } else if (this.studentState.confidence < 0.3) {
            return 'Low confidence detected';
        } else {
            return 'General assistance needed';
        }
    }
    
    async performIntervention(intervention) {
        console.log(`Performing ${intervention.type} intervention (${intervention.severity})`);
        
        const interventionData = {
            type: intervention.type,
            severity: intervention.severity,
            reason: intervention.reason,
            timestamp: new Date().toISOString(),
            studentState: { ...this.studentState }
        };
        
        this.interventionHistory.push(interventionData);
        
        // Show intervention to student
        this.showIntervention(intervention);
        
        // If high severity, alert teacher
        if (intervention.severity === 'high') {
            await this.alertTeacher(intervention);
        }
        
        // Save intervention history
        this.saveHistory();
    }
    
    showIntervention(intervention) {
        const interventions = {
            emotional_support: {
                title: 'I notice you might be frustrated',
                message: 'Let\'s take a moment to breathe and try a different approach.',
                actions: ['Take a break', 'Try easier problem', 'Listen to calming music']
            },
            focus_assistance: {
                title: 'Let\'s refocus together',
                message: 'Try these focus exercises to get back on track.',
                actions: ['5-minute timer', 'Focus game', 'Remove distractions']
            },
            confidence_boost: {
                title: 'You\'re doing better than you think!',
                message: 'Remember your past successes. You can do this!',
                actions: ['Review achievements', 'Positive affirmation', 'Share progress']
            },
            general_guidance: {
                title: 'I\'m here to help',
                message: 'Would you like some guidance with this?',
                actions: ['Get a hint', 'See example', 'Step-by-step help']
            }
        };
        
        const interventionData = interventions[intervention.type] || interventions.general_guidance;
        
        // Dispatch event for UI to handle
        const event = new CustomEvent('agentIntervention', {
            detail: {
                ...interventionData,
                severity: intervention.severity
            }
        });
        window.dispatchEvent(event);
    }
    
    async alertTeacher(intervention) {
        const alertData = {
            studentId: Auth.getCurrentUser()?.id,
            studentName: Auth.getCurrentUser()?.name,
            interventionType: intervention.type,
            severity: intervention.severity,
            reason: intervention.reason,
            studentState: this.studentState,
            timestamp: new Date().toISOString()
        };
        
        // In real implementation, this would send to server
        console.log('Teacher alert:', alertData);
        
        // Dispatch event for teacher UI
        const event = new CustomEvent('teacherAlert', {
            detail: alertData
        });
        window.dispatchEvent(event);
    }
    
    checkForTeacherAlert() {
        // Check if conditions warrant immediate teacher alert
        const needsImmediateAlert = 
            this.studentState.frustrationLevel > 0.9 ||
            this.studentState.focus < 0.1;
        
        if (needsImmediateAlert) {
            this.alertTeacher({
                type: 'immediate_attention',
                severity: 'critical',
                reason: 'Student needs immediate attention'
            });
        }
    }
    
    addConversation(sender, message) {
        this.conversationHistory.push({
            sender: sender,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 messages
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }
    
    activate() {
        this.isActive = true;
        console.log(`${this.name} activated`);
        
        // Dispatch activation event
        const event = new CustomEvent('agentActivated');
        window.dispatchEvent(event);
    }
    
    deactivate() {
        this.isActive = false;
        console.log(`${this.name} deactivated`);
        
        // Dispatch deactivation event
        const event = new CustomEvent('agentDeactivated');
        window.dispatchEvent(event);
    }
    
    getConversationHistory() {
        return [...this.conversationHistory];
    }
    
    getStudentState() {
        return { ...this.studentState };
    }
    
    getInterventionHistory() {
        return [...this.interventionHistory];
    }
    
    reset() {
        this.studentState = {
            emotion: 'neutral',
            focus: 1.0,
            confidence: 0.5,
            engagement: 0.7,
            frustrationLevel: 0.0
        };
        this.conversationHistory = [];
        this.interventionHistory = [];
        console.log(`${this.name} reset`);
    }
    
    // Event handlers
    onLessonStart(lesson) {
        console.log(`Lesson started: ${lesson.title}`);
        this.studentState.focus = 1.0;
        this.studentState.engagement = 0.8;
    }
    
    onLessonComplete(lesson) {
        console.log(`Lesson completed: ${lesson.title}`);
        this.studentState.confidence += 0.2;
        this.studentState.frustrationLevel = Math.max(0, this.studentState.frustrationLevel - 0.3);
    }
    
    onLessonStruggle(lesson) {
        console.log(`Struggling with: ${lesson.title}`);
        this.studentState.frustrationLevel += 0.1;
        this.studentState.confidence -= 0.1;
    }
    
    onFocusLost(duration) {
        console.log(`Focus lost for ${duration} seconds`);
        this.studentState.focus = 0.1;
        
        if (duration > 300) { // 5 minutes
            this.studentState.frustrationLevel += 0.2;
        }
    }
    
    onFocusRegained() {
        console.log('Focus regained');
        this.studentState.focus = 0.8;
    }
}

// Create global instance
window.EmpathicAgent = new EmpathicAgent();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmpathicAgent;
}

// In your agent-core.js, add:
class EmpathicAgent {
    // ... existing code ...
    
    respondWithEmotionAwareness(message) {
        if (!window.EmotionDetector) {
            return this.getDefaultResponse(message);
        }
        
        const emotion = window.EmotionDetector.getCurrentEmotion();
        const attention = window.EmotionDetector.getAttentionScore();
        
        // Customize response based on emotion
        let response = this.generateBaseResponse(message);
        
        if (emotion.confidence > 0.6) {
            response = this.addEmotionalContext(response, emotion.emotion);
        }
        
        if (attention < 0.3) {
            response = this.addAttentionPrompt(response);
        }
        
        return response;
    }
    
    addEmotionalContext(response, emotion) {
        const contexts = {
            'frustrated': "I can see this is frustrating. Let's try a different approach...",
            'confused': "I notice you seem confused. Would you like me to explain this differently?",
            'bored': "This might not be engaging enough. How about we switch to something more interesting?",
            'happy': "Great! I can see you're enjoying this. Let's keep going!",
            'sad': "I sense you might be feeling down. Remember, it's okay to take a break.",
            'anxious': "Take a deep breath. We can go through this step by step."
        };
        
        return contexts[emotion] 
            ? `${contexts[emotion]} ${response}`
            : response;
    }
    
    addAttentionPrompt(response) {
        return `${response} \n\n(P.S. I notice your attention might be wandering. Try focusing on the screen for better results!)`;
    }
}

// In agent-core.js, replace the bottom part:
if (typeof window !== 'undefined') {
    if (!window.EmpathicAgent) {
        window.EmpathicAgent = new EmpathicAgent();
    } else {
        console.warn('EmpathicAgent already exists on window');
    }
}