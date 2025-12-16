// js/student/agent-interaction.js
class AgentInteraction {
    constructor() {
        this.conversationHistory = [];
        this.agentState = 'available';
        this.emotionAnalysis = {
            current: 'neutral',
            confidence: 0,
            history: []
        };
        this.learningContext = {};
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isStudent()) {
            return;
        }
        
        this.loadConversationHistory();
        this.setupEventListeners();
        this.startAgentHeartbeat();
        
        console.log('Agent interaction initialized');
    }
    
    async loadConversationHistory() {
        try {
            this.conversationHistory = Storage.get('agent_conversation') || [];
            this.renderConversation();
        } catch (error) {
            console.error('Error loading conversation:', error);
            this.conversationHistory = [];
        }
    }
    
    setupEventListeners() {
        // Message sending
        const sendBtn = document.getElementById('sendAgentMessage');
        const messageInput = document.getElementById('agentMessageInput');
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Voice input
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceInput());
        }
        
        // Emotion buttons
        const emotionBtns = document.querySelectorAll('.emotion-btn');
        emotionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emotion = e.target.dataset.emotion;
                this.reportEmotion(emotion);
            });
        });
        
        // Quick actions
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
    }
    
    async sendMessage() {
        const input = document.getElementById('agentMessageInput');
        const message = input?.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        input.value = '';
        input.focus();
        
        // Update textarea height
        this.adjustTextareaHeight(input);
        
        // Analyze emotion from message
        const emotion = await this.analyzeTextEmotion(message);
        this.updateEmotionAnalysis(emotion);
        
        // Process message and get agent response
        setTimeout(async () => {
            const response = await this.generateAgentResponse(message);
            this.addMessage(response, 'agent');
        }, 1000);
    }
    
    async analyzeTextEmotion(text) {
        // Simple emotion analysis (in a real app, use NLP)
        const emotionKeywords = {
            happy: ['good', 'great', 'love', 'excited', 'happy', 'yay', 'wow'],
            sad: ['sad', 'bad', 'hate', 'upset', 'cry', 'unhappy'],
            confused: ['confused', 'dont understand', 'help', 'stuck', '?'],
            frustrated: ['frustrated', 'angry', 'mad', 'annoyed', 'ugh'],
            neutral: ['ok', 'fine', 'alright', 'maybe']
        };
        
        const lowerText = text.toLowerCase();
        let detectedEmotion = 'neutral';
        let confidence = 0;
        
        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            const matches = keywords.filter(keyword => lowerText.includes(keyword));
            if (matches.length > confidence) {
                confidence = matches.length;
                detectedEmotion = emotion;
            }
        });
        
        return {
            emotion: detectedEmotion,
            confidence: confidence / Math.max(1, text.split(' ').length)
        };
    }
    
    updateEmotionAnalysis(emotionData) {
        this.emotionAnalysis.current = emotionData.emotion;
        this.emotionAnalysis.confidence = emotionData.confidence;
        
        // Add to history
        this.emotionAnalysis.history.push({
            ...emotionData,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 entries
        if (this.emotionAnalysis.history.length > 10) {
            this.emotionAnalysis.history.shift();
        }
        
        // Update UI
        this.updateEmotionDisplay();
        
        // Send to analytics
        this.reportEmotionToAnalytics();
    }
    
    async generateAgentResponse(userMessage) {
        // Get current learning context
        const learningContext = this.getLearningContext();
        
        // Analyze message intent
        const intent = await this.analyzeIntent(userMessage);
        
        // Generate response based on intent and context
        let response = '';
        
        switch(intent.type) {
            case 'question':
                response = await this.generateAnswer(userMessage, learningContext);
                break;
            case 'help_request':
                response = this.generateHelpResponse(learningContext);
                break;
            case 'emotional_state':
                response = this.generateEmotionalResponse(intent.emotion);
                break;
            case 'progress_check':
                response = this.generateProgressResponse(learningContext);
                break;
            default:
                response = this.generateGeneralResponse();
        }
        
        // Add context to response
        response = this.addLearningContext(response, learningContext);
        
        // Save conversation
        this.saveConversation(userMessage, response);
        
        return response;
    }
    
    async analyzeIntent(message) {
        // Simple intent analysis (in a real app, use NLP)
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('?') || 
            lowerMessage.includes('what is') ||
            lowerMessage.includes('how to') ||
            lowerMessage.includes('explain')) {
            return { type: 'question' };
        }
        
        if (lowerMessage.includes('help') ||
            lowerMessage.includes('stuck') ||
            lowerMessage.includes('dont understand')) {
            return { type: 'help_request' };
        }
        
        // Check for emotional phrases
        const emotionalPhrases = {
            happy: ['feeling good', 'happy', 'excited'],
            sad: ['feeling sad', 'unhappy', 'bad'],
            confused: ['confused', 'dont get it'],
            frustrated: ['frustrated', 'angry', 'annoyed']
        };
        
        for (const [emotion, phrases] of Object.entries(emotionalPhrases)) {
            if (phrases.some(phrase => lowerMessage.includes(phrase))) {
                return { type: 'emotional_state', emotion };
            }
        }
        
        if (lowerMessage.includes('progress') ||
            lowerMessage.includes('how am i doing') ||
            lowerMessage.includes('my score')) {
            return { type: 'progress_check' };
        }
        
        return { type: 'general' };
    }
    
    async generateAnswer(question, context) {
        // In a real app, this would query a knowledge base
        const answers = {
            math: {
                'fraction': "A fraction represents a part of a whole. It has a numerator (top) and denominator (bottom).",
                'decimal': "Decimals are another way to represent fractions using a base-10 system.",
                'percentage': "Percent means 'per hundred'. It's a special type of fraction with denominator 100."
            },
            science: {
                'photosynthesis': "Photosynthesis is how plants make food using sunlight, water, and carbon dioxide.",
                'gravity': "Gravity is the force that attracts objects with mass toward each other."
            }
        };
        
        // Find relevant topic
        let topic = 'general';
        for (const [subject, topics] of Object.entries(answers)) {
            for (const [key, answer] of Object.entries(topics)) {
                if (question.toLowerCase().includes(key)) {
                    return answer;
                }
            }
        }
        
        return "That's a great question! Let me help you understand that concept. Can you tell me what specific part you'd like to learn about?";
    }
    
    generateHelpResponse(context) {
        const helpResponses = [
            "I see you need help. Let's break this down step by step.",
            "Don't worry, many students find this challenging. Let me explain it differently.",
            "Here's a different approach that might help you understand better.",
            "Let's go back to the basics and build up from there."
        ];
        
        const randomResponse = helpResponses[Math.floor(Math.random() * helpResponses.length)];
        
        // Add specific help based on context
        if (context.currentTopic) {
            return `${randomResponse} For ${context.currentTopic}, try thinking about it this way...`;
        }
        
        return randomResponse;
    }
    
    generateEmotionalResponse(emotion) {
        const responses = {
            happy: [
                "That's wonderful to hear! 😊",
                "Great! Positive emotions help with learning!",
                "I'm glad you're feeling happy! Let's make the most of it!"
            ],
            sad: [
                "I'm sorry to hear that. Learning can be tough sometimes. 😔",
                "It's okay to feel this way. Let's take it slow.",
                "Remember, every challenge is an opportunity to grow."
            ],
            confused: [
                "It's normal to feel confused when learning something new. 🤔",
                "Let me explain that in a different way.",
                "Which part is confusing you? Let's focus on that."
            ],
            frustrated: [
                "I understand this can be frustrating. 😓",
                "Let's take a deep breath and try again.",
                "How about we take a short break and come back to this?"
            ]
        };
        
        const emotionResponses = responses[emotion] || responses.confused;
        return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    }
    
    generateProgressResponse(context) {
        const progress = context.progress || 0;
        
        if (progress >= 80) {
            return `You're doing excellent! You've completed ${progress}% of the material. Keep up the great work! 🎉`;
        } else if (progress >= 50) {
            return `Good progress! You're at ${progress}%. You're more than halfway there! 💪`;
        } else {
            return `You're making progress! Currently at ${progress}%. Every step counts! 🚶‍♂️`;
        }
    }
    
    generateGeneralResponse() {
        const responses = [
            "Thanks for sharing! How can I help you with your learning today?",
            "That's interesting! Tell me more about what you're working on.",
            "Great! Let me know if you have any questions about the material.",
            "I'm here to help you learn. What would you like to focus on?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addLearningContext(response, context) {
        if (!context.currentTopic) return response;
        
        const contextualResponses = [
            `Regarding ${context.currentTopic}, ${response.toLowerCase()}`,
            `In the context of ${context.currentTopic}, ${response.toLowerCase()}`,
            `For ${context.currentTopic}, here's what I suggest: ${response}`
        ];
        
        return Math.random() > 0.5 ? 
            contextualResponses[Math.floor(Math.random() * contextualResponses.length)] : 
            response;
    }
    
    getLearningContext() {
        // Get current learning context from other modules
        const studentData = Storage.get('student_data') || {};
        const currentModule = studentData.currentModule || {};
        
        return {
            currentTopic: currentModule.title,
            subject: currentModule.subject,
            progress: currentModule.progress || 0,
            lastActivity: studentData.lastActivity
        };
    }
    
    addMessage(message, sender) {
        const chatContainer = document.getElementById('agentChat');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({
            message,
            sender,
            timestamp: new Date().toISOString()
        });
        
        // Save conversation
        this.saveConversation();
    }
    
    renderConversation() {
        const chatContainer = document.getElementById('agentChat');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = '';
        
        this.conversationHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message-bubble ${msg.sender}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = msg.message;
            
            const messageTime = document.createElement('div');
            messageTime.className = 'message-time';
            messageTime.textContent = new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTime);
            chatContainer.appendChild(messageDiv);
        });
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    saveConversation() {
        // Keep only last 100 messages
        if (this.conversationHistory.length > 100) {
            this.conversationHistory = this.conversationHistory.slice(-100);
        }
        
        Storage.set('agent_conversation', this.conversationHistory);
    }
    
    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    async startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.addMessage("Voice input is not supported in your browser.", 'system');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.start();
        
        this.addMessage("Listening... 🎤", 'system');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('agentMessageInput').value = transcript;
            this.sendMessage();
        };
        
        recognition.onerror = (event) => {
            this.addMessage("Voice input failed. Please try typing.", 'system');
        };
        
        recognition.onend = () => {
            // Voice recognition ended
        };
    }
    
    reportEmotion(emotion) {
        this.updateEmotionAnalysis({
            emotion,
            confidence: 1.0
        });
        
        this.addMessage(`I'm feeling ${emotion}.`, 'user');
        
        setTimeout(() => {
            const response = this.generateEmotionalResponse(emotion);
            this.addMessage(response, 'agent');
        }, 1000);
    }
    
    updateEmotionDisplay() {
        const emotionDisplay = document.getElementById('currentEmotion');
        if (emotionDisplay) {
            emotionDisplay.textContent = this.emotionAnalysis.current;
            emotionDisplay.className = `emotion-display emotion-${this.emotionAnalysis.current}`;
        }
        
        // Update confidence indicator
        const confidenceBar = document.getElementById('emotionConfidence');
        if (confidenceBar) {
            confidenceBar.style.width = `${this.emotionAnalysis.confidence * 100}%`;
        }
    }
    
    reportEmotionToAnalytics() {
        // Send emotion data to analytics system
        const emotionData = {
            emotion: this.emotionAnalysis.current,
            confidence: this.emotionAnalysis.confidence,
            timestamp: new Date().toISOString(),
            context: this.getLearningContext()
        };
        
        // In a real app, send to analytics API
        console.log('Emotion reported:', emotionData);
    }
    
    handleQuickAction(actionType) {
        const actions = {
            explain: "Can you explain this concept in simpler terms?",
            example: "Can you give me an example?",
            practice: "I need more practice with this.",
            break: "I think I need a break."
        };
        
        if (actions[actionType]) {
            document.getElementById('agentMessageInput').value = actions[actionType];
            this.sendMessage();
        }
    }
    
    startAgentHeartbeat() {
        // Send periodic updates to agent
        setInterval(() => {
            this.sendHeartbeat();
        }, 60000); // Every minute
    }
    
    sendHeartbeat() {
        const context = this.getLearningContext();
        const heartbeat = {
            timestamp: new Date().toISOString(),
            emotion: this.emotionAnalysis.current,
            focus: this.getCurrentFocus(),
            engagement: this.getCurrentEngagement(),
            context: context
        };
        
        // In a real app, send to agent API
        console.log('Agent heartbeat:', heartbeat);
    }
    
    getCurrentFocus() {
        // Get from focus monitor module
        return window.FocusMonitor?.currentFocus || 75;
    }
    
    getCurrentEngagement() {
        // Get from engagement tracker module
        return window.EngagementTracker?.currentEngagement || 70;
    }
    
    suggestLearningPath() {
        const context = this.getLearningContext();
        const progress = context.progress || 0;
        
        let suggestion = "";
        
        if (progress < 30) {
            suggestion = "Let's focus on building a strong foundation with the basics.";
        } else if (progress < 60) {
            suggestion = "You're making good progress. Let's tackle some intermediate concepts.";
        } else if (progress < 90) {
            suggestion = "Great work! Let's work on advanced topics and applications.";
        } else {
            suggestion = "You're almost there! Let's review and reinforce what you've learned.";
        }
        
        this.addMessage(suggestion, 'agent');
    }
    
    provideMotivation() {
        const motivations = [
            "You're doing great! Keep up the good work! 💪",
            "Every step forward is progress, no matter how small.",
            "Remember why you started. You've got this!",
            "Learning is a journey. Enjoy the process!",
            "Your effort today is building a better tomorrow."
        ];
        
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
        this.addMessage(randomMotivation, 'agent');
    }
    
    checkUnderstanding() {
        const checkQuestions = [
            "Do you feel like you understand this concept?",
            "Would you like me to explain anything differently?",
            "Are there any parts you'd like to review?",
            "How confident do you feel about what we just covered?"
        ];
        
        const randomQuestion = checkQuestions[Math.floor(Math.random() * checkQuestions.length)];
        this.addMessage(randomQuestion, 'agent');
    }
}

// js/student/agent-interaction.js

class AgentInteraction {
    constructor() {
        this.agentState = {
            isTyping: false,
            isListening: false,
            isThinking: false,
            currentMood: 'neutral',
            sessionId: null,
            emotionHistory: [],
            conversationHistory: []
        };
        
        this.userState = {
            currentEmotion: 'neutral',
            focusLevel: 100,
            engagementScore: 100,
            learningStyle: null,
            currentTopic: null,
            difficultyLevel: 'beginner'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeSession();
        this.loadUserPreferences();
        this.setupSpeechRecognition();
        this.setupVoiceSynthesis();
        this.startEmotionTracking();
        this.startFocusMonitoring();
    }
    
    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        const voiceButton = document.getElementById('voiceInput');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (voiceButton) {
            voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        // Emotion buttons
        const emotionButtons = document.querySelectorAll('.emotion-btn');
        emotionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emotion = e.target.dataset.emotion;
                this.setUserEmotion(emotion);
                this.updateEmotionIndicator(emotion);
            });
        });
        
        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
        
        // Clear chat
        const clearChatBtn = document.getElementById('clearChat');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearConversation());
        }
        
        // Save conversation
        const saveChatBtn = document.getElementById('saveChat');
        if (saveChatBtn) {
            saveChatBtn.addEventListener('click', () => this.saveConversation());
        }
        
        // Feedback buttons
        const feedbackButtons = document.querySelectorAll('.feedback-btn');
        feedbackButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedback = e.target.dataset.feedback;
                this.sendFeedback(feedback);
            });
        });
    }
    
    initializeSession() {
        this.agentState.sessionId = 'session_' + Date.now();
        this.agentState.conversationHistory = [];
        
        // Send welcome message
        setTimeout(() => {
            this.addAgentMessage(this.getWelcomeMessage());
        }, 1000);
    }
    
    getWelcomeMessage() {
        const greetings = [
            "Hi there! I'm your empathic learning assistant. How can I help you learn today? 😊",
            "Hello! I'm here to help you with your learning journey. What would you like to explore? 📚",
            "Welcome back! Ready to continue our learning adventure? 🚀",
            "Hey! I notice you're back. Let's make today's learning session amazing! ✨"
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        messageInput.value = '';
        
        // Show agent typing indicator
        this.showTypingIndicator();
        
        // Process message
        try {
            const response = await this.processUserMessage(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add agent response
            this.addAgentMessage(response.message, response.options);
            
            // Update agent state
            if (response.mood) {
                this.updateAgentMood(response.mood);
            }
            
            // Update conversation history
            this.agentState.conversationHistory.push({
                user: message,
                agent: response.message,
                timestamp: new Date().toISOString(),
                userEmotion: this.userState.currentEmotion,
                agentMood: response.mood
            });
            
            // Save conversation
            this.saveConversationToStorage();
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.hideTypingIndicator();
            this.addAgentMessage("I apologize, but I'm having trouble processing that. Could you try rephrasing? 🤔");
        }
    }
    
    async processUserMessage(message) {
        // Analyze message for emotion
        const emotion = await this.analyzeMessageEmotion(message);
        this.setUserEmotion(emotion);
        
        // Analyze learning intent
        const intent = await this.analyzeLearningIntent(message);
        
        // Update user state
        this.userState.currentTopic = intent.topic;
        this.userState.difficultyLevel = intent.difficulty;
        
        // Generate response based on intent and emotion
        const response = await this.generateResponse(message, intent, emotion);
        
        return response;
    }
    
    async analyzeMessageEmotion(message) {
        // Simple emotion detection based on keywords
        const emotionKeywords = {
            happy: ['happy', 'excited', 'great', 'awesome', 'love', 'wow'],
            sad: ['sad', 'upset', 'frustrated', 'stuck', 'hard', 'difficult'],
            confused: ['confused', 'dont understand', 'what', 'how', '?'],
            neutral: ['ok', 'fine', 'alright', 'ready', 'start']
        };
        
        const lowerMessage = message.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return emotion;
            }
        }
        
        return 'neutral';
    }
    
    async analyzeLearningIntent(message) {
        // Simple intent detection
        const topics = {
            math: ['math', 'algebra', 'calculus', 'equation', 'number'],
            science: ['science', 'physics', 'chemistry', 'biology'],
            language: ['english', 'grammar', 'vocabulary', 'writing'],
            history: ['history', 'historical', 'past', 'war'],
            general: ['help', 'explain', 'teach', 'learn']
        };
        
        const difficulties = {
            beginner: ['easy', 'basic', 'simple', 'start'],
            intermediate: ['medium', 'normal', 'regular'],
            advanced: ['hard', 'advanced', 'complex', 'challenging']
        };
        
        const lowerMessage = message.toLowerCase();
        let detectedTopic = 'general';
        let detectedDifficulty = 'beginner';
        
        // Detect topic
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                detectedTopic = topic;
                break;
            }
        }
        
        // Detect difficulty
        for (const [difficulty, keywords] of Object.entries(difficulties)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                detectedDifficulty = difficulty;
                break;
            }
        }
        
        return {
            topic: detectedTopic,
            difficulty: detectedDifficulty,
            requiresExplanation: lowerMessage.includes('what') || 
                               lowerMessage.includes('how') || 
                               lowerMessage.includes('why')
        };
    }
    
    async generateResponse(message, intent, emotion) {
        // Response templates based on emotion and intent
        const responseTemplates = this.getResponseTemplates(intent.topic, emotion);
        
        // Select random template
        const template = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
        
        // Customize based on user state
        let response = template.replace('{topic}', intent.topic)
                              .replace('{difficulty}', intent.difficulty);
        
        // Add learning resources if needed
        if (intent.requiresExplanation) {
            const resources = this.getLearningResources(intent.topic, intent.difficulty);
            response += `\n\nHere are some resources that might help:\n${resources}`;
        }
        
        // Determine agent mood based on user emotion
        const agentMood = this.getAppropriateAgentMood(emotion);
        
        return {
            message: response,
            mood: agentMood,
            options: {
                showResources: intent.requiresExplanation,
                suggestPractice: emotion === 'confused' || emotion === 'sad',
                encourage: emotion === 'sad' || emotion === 'frustrated'
            }
        };
    }
    
    getResponseTemplates(topic, emotion) {
        const templates = {
            happy: [
                "I'm glad you're excited about {topic}! That's a great attitude to have. 😊",
                "Your enthusiasm for {topic} is contagious! Let's dive in. 🚀",
                "Awesome! {topic} is much more fun when you're excited about it. What specific area would you like to explore?",
                "I love your positive energy! {topic} at {difficulty} level sounds perfect for you right now."
            ],
            sad: [
                "I understand that {topic} can be challenging sometimes. Let's take it step by step. 🤗",
                "It's okay to feel stuck. Everyone struggles with {topic} sometimes. How can I help make it easier?",
                "I'm here to support you through the tough parts of {topic}. Let's break it down together. 💪",
                "I sense you're finding {topic} difficult. Would you like to try a different approach?"
            ],
            confused: [
                "Let me help clarify {topic} for you. What specific part is confusing? 🤔",
                "{topic} can be tricky! Let me explain it in a simpler way.",
                "I understand the confusion. Let's work through {topic} together step by step.",
                "That's a great question about {topic}! Let me break it down for you."
            ],
            neutral: [
                "Let's explore {topic} together. What would you like to know? 📚",
                "Ready to learn about {topic}? I'm here to guide you. 🧭",
                "{topic} is an interesting subject. What aspect would you like to focus on?",
                "Let's work on {topic} at {difficulty} level. Where should we start?"
            ]
        };
        
        return templates[emotion] || templates.neutral;
    }
    
    getLearningResources(topic, difficulty) {
        const resources = {
            math: {
                beginner: "• Basic arithmetic practice problems\n• Number line visualizations\n• Counting games",
                intermediate: "• Algebra equation solver\n• Geometry shapes explorer\n• Fraction practice",
                advanced: "• Calculus concepts explained\n• Statistics and probability\n• Advanced problem sets"
            },
            science: {
                beginner: "• Simple experiments you can do at home\n• Animal and plant identification\n• Basic physics concepts",
                intermediate: "• Chemistry periodic table\n• Human body systems\n• Earth science topics",
                advanced: "• Quantum physics introduction\n• Organic chemistry\n• Astrophysics basics"
            },
            general: {
                beginner: "• Learning how to learn\n• Study techniques\n• Time management tips",
                intermediate: "• Critical thinking exercises\n• Research methods\n• Presentation skills",
                advanced: "• Advanced study strategies\n• Academic writing\n• Research project guidance"
            }
        };
        
        const topicResources = resources[topic] || resources.general;
        return topicResources[difficulty] || topicResources.beginner;
    }
    
    getAppropriateAgentMood(userEmotion) {
        const moodMap = {
            happy: 'excited',
            sad: 'encouraging',
            confused: 'thinking',
            neutral: 'neutral'
        };
        
        return moodMap[userEmotion] || 'neutral';
    }
    
    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
            <div class="message-avatar">
                <div class="avatar-small">U</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addAgentMessage(message, options = {}) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message agent-message';
        
        let messageContent = this.escapeHtml(message);
        
        // Add suggested actions if provided
        if (options.suggestPractice) {
            messageContent += '\n\nWould you like to try a practice exercise?';
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="agent-avatar-small">🤖</div>
            </div>
            <div class="message-content">
                <div class="message-text">${messageContent.replace(/\n/g, '<br>')}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
                ${options.showResources ? `
                    <div class="message-actions">
                        <button class="btn btn-sm btn-outline" data-action="show-more">Show More Resources</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Speak the message if voice is enabled
        if (this.isVoiceEnabled()) {
            this.speakMessage(message);
        }
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message agent-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="agent-avatar-small">🤖</div>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        this.agentState.isTyping = true;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.agentState.isTyping = false;
    }
    
    toggleVoiceInput() {
        if (this.agentState.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }
    
    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.agentState.isListening = true;
            this.updateVoiceButton(true);
            this.showListeningIndicator();
        };
        
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = transcript;
            }
        };
        
        this.recognition.onend = () => {
            this.agentState.isListening = false;
            this.updateVoiceButton(false);
            this.hideListeningIndicator();
            
            // Auto-send if we have text
            const messageInput = document.getElementById('messageInput');
            if (messageInput && messageInput.value.trim()) {
                setTimeout(() => this.sendMessage(), 500);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.agentState.isListening = false;
            this.updateVoiceButton(false);
            this.hideListeningIndicator();
        };
        
        this.recognition.start();
    }
    
    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.agentState.isListening = false;
        this.updateVoiceButton(false);
        this.hideListeningIndicator();
    }
    
    updateVoiceButton(isListening) {
        const voiceButton = document.getElementById('voiceInput');
        if (voiceButton) {
            voiceButton.classList.toggle('active', isListening);
            voiceButton.innerHTML = isListening ? 
                '<span class="voice-icon">🎤</span><span>Listening...</span>' :
                '<span class="voice-icon">🎤</span><span>Voice Input</span>';
        }
    }
    
    showListeningIndicator() {
        // Show visual indicator that agent is listening
        const agentAvatar = document.querySelector('.agent-avatar');
        if (agentAvatar) {
            agentAvatar.classList.add('listening');
        }
    }
    
    hideListeningIndicator() {
        const agentAvatar = document.querySelector('.agent-avatar');
        if (agentAvatar) {
            agentAvatar.classList.remove('listening');
        }
    }
    
    setupSpeechRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
    }
    
    setupVoiceSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            
            // Get available voices
            this.loadVoices();
            
            // Set up voice change listener
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    loadVoices() {
        if (!this.synthesis) return;
        
        this.voices = this.synthesis.getVoices();
        
        // Prefer a friendly, educational voice
        const preferredVoices = [
            'Google UK English Female',
            'Microsoft Zira Desktop',
            'Samantha' // macOS default
        ];
        
        this.selectedVoice = this.voices.find(voice => 
            preferredVoices.includes(voice.name)
        ) || this.voices[0];
    }
    
    speakMessage(message) {
        if (!this.synthesis || !this.selectedVoice) return;
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9; // Slightly slower for learning
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Update agent avatar to show speaking
        const agentAvatar = document.querySelector('.agent-avatar');
        if (agentAvatar) {
            agentAvatar.classList.add('speaking');
        }
        
        utterance.onend = () => {
            if (agentAvatar) {
                agentAvatar.classList.remove('speaking');
            }
        };
        
        utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            if (agentAvatar) {
                agentAvatar.classList.remove('speaking');
            }
        };
        
        this.synthesis.speak(utterance);
    }
    
    setUserEmotion(emotion) {
        this.userState.currentEmotion = emotion;
        this.agentState.emotionHistory.push({
            emotion,
            timestamp: new Date().toISOString()
        });
        
        // Update UI
        this.updateEmotionIndicator(emotion);
        
        // Store in session
        localStorage.setItem('currentEmotion', emotion);
    }
    
    updateEmotionIndicator(emotion) {
        const emotionIndicator = document.getElementById('emotionIndicator');
        if (!emotionIndicator) return;
        
        const emotionIcons = {
            happy: '😊',
            sad: '😔',
            confused: '😕',
            neutral: '😐',
            excited: '😄',
            frustrated: '😤'
        };
        
        emotionIndicator.innerHTML = `
            <span class="emotion-icon">${emotionIcons[emotion] || '😐'}</span>
            <span class="emotion-text">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
        `;
        
        // Add animation
        emotionIndicator.classList.add('pulse');
        setTimeout(() => {
            emotionIndicator.classList.remove('pulse');
        }, 1000);
    }
    
    startEmotionTracking() {
        // Simulate emotion changes based on interaction
        this.emotionInterval = setInterval(() => {
            this.simulateEmotionChange();
        }, 30000); // Every 30 seconds
    }
    
    simulateEmotionChange() {
        // Simulate natural emotion fluctuations
        const emotions = ['happy', 'neutral', 'confused', 'excited'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        // Only change if not in a strong emotional state
        if (this.userState.currentEmotion !== 'sad' && 
            this.userState.currentEmotion !== 'frustrated') {
            this.setUserEmotion(randomEmotion);
        }
    }
    
    startFocusMonitoring() {
        // Monitor user focus based on interaction patterns
        this.focusInterval = setInterval(() => {
            this.updateFocusLevel();
        }, 60000); // Every minute
    }
    
    updateFocusLevel() {
        // Decrease focus over time
        this.userState.focusLevel = Math.max(20, this.userState.focusLevel - 5);
        
        // Update engagement score
        this.userState.engagementScore = Math.max(30, this.userState.engagementScore - 2);
        
        // Update UI
        this.updateFocusIndicator();
        
        // Trigger intervention if focus is too low
        if (this.userState.focusLevel < 40) {
            this.suggestBreak();
        }
    }
    
    updateFocusIndicator() {
        const focusIndicator = document.getElementById('focusIndicator');
        if (!focusIndicator) return;
        
        const focusLevel = this.userState.focusLevel;
        focusIndicator.innerHTML = `
            <div class="focus-bar">
                <div class="focus-fill" style="width: ${focusLevel}%"></div>
            </div>
            <div class="focus-text">Focus: ${focusLevel}%</div>
        `;
        
        // Color coding
        const focusFill = focusIndicator.querySelector('.focus-fill');
        if (focusLevel > 70) {
            focusFill.style.background = 'var(--success-color)';
        } else if (focusLevel > 40) {
            focusFill.style.background = 'var(--warning-color)';
        } else {
            focusFill.style.background = 'var(--danger-color)';
        }
    }
    
    suggestBreak() {
        if (this.agentState.isTyping || this.agentState.isThinking) return;
        
        const breakMessages = [
            "I notice your focus might be dropping. Would you like to take a short break? 🧘‍♂️",
            "Let's pause for a moment. A quick break can help you learn better! ☕",
            "How about we take a 2-minute break and then come back refreshed? ⏸️"
        ];
        
        const randomMessage = breakMessages[Math.floor(Math.random() * breakMessages.length)];
        this.addAgentMessage(randomMessage);
    }
    
    handleQuickAction(actionType) {
        const actions = {
            'explain': {
                message: "Could you explain this concept in simpler terms?",
                response: "Sure! Let me break this down into simpler parts. What specific aspect would you like me to explain first?"
            },
            'example': {
                message: "Can you give me an example?",
                response: "Absolutely! Here's a practical example to help you understand better..."
            },
            'practice': {
                message: "I'd like to practice this",
                response: "Great idea! Practice makes perfect. Let me generate some exercises for you..."
            },
            'hint': {
                message: "I need a hint",
                response: "Here's a hint to guide you in the right direction, without giving away the answer..."
            }
        };
        
        const action = actions[actionType];
        if (action) {
            this.addUserMessage(action.message);
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addAgentMessage(action.response);
            }, 1500);
        }
    }
    
    sendFeedback(feedback) {
        // Send feedback to server or store locally
        const feedbackData = {
            sessionId: this.agentState.sessionId,
            feedback,
            timestamp: new Date().toISOString(),
            message: this.getLastAgentMessage()
        };
        
        console.log('Feedback sent:', feedbackData);
        
        // Show confirmation
        this.showFeedbackConfirmation(feedback);
        
        // Store feedback locally
        this.storeFeedback(feedbackData);
    }
    
    getLastAgentMessage() {
        const messages = document.querySelectorAll('.agent-message .message-text');
        return messages.length > 0 ? 
            messages[messages.length - 1].textContent : '';
    }
    
    showFeedbackConfirmation(feedback) {
        const feedbackIcons = {
            'helpful': '✅',
            'confusing': '🤔',
            'incorrect': '❌'
        };
        
        const confirmation = document.createElement('div');
        confirmation.className = 'feedback-confirmation';
        confirmation.innerHTML = `
            <span class="feedback-icon">${feedbackIcons[feedback] || '👍'}</span>
            <span>Thank you for your feedback!</span>
        `;
        
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.appendChild(confirmation);
            
            setTimeout(() => {
                confirmation.remove();
            }, 3000);
        }
    }
    
    storeFeedback(feedbackData) {
        let allFeedback = JSON.parse(localStorage.getItem('agentFeedback') || '[]');
        allFeedback.push(feedbackData);
        localStorage.setItem('agentFeedback', JSON.stringify(allFeedback));
    }
    
    clearConversation() {
        if (confirm('Are you sure you want to clear the conversation?')) {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            
            // Reset session but keep user state
            this.agentState.conversationHistory = [];
            this.agentState.emotionHistory = [];
            
            // Send new welcome message
            setTimeout(() => {
                this.addAgentMessage(this.getWelcomeMessage());
            }, 500);
        }
    }
    
    saveConversation() {
        const conversationData = {
            sessionId: this.agentState.sessionId,
            timestamp: new Date().toISOString(),
            conversation: this.agentState.conversationHistory,
            userState: this.userState,
            agentState: this.agentState
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(conversationData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${this.agentState.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show confirmation
        this.showSaveConfirmation();
    }
    
    showSaveConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.textContent = 'Conversation saved successfully!';
        
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.appendChild(confirmation);
            
            setTimeout(() => {
                confirmation.remove();
            }, 3000);
        }
    }
    
    saveConversationToStorage() {
        // Auto-save conversation to localStorage
        const conversationData = {
            sessionId: this.agentState.sessionId,
            lastUpdated: new Date().toISOString(),
            conversation: this.agentState.conversationHistory.slice(-50), // Last 50 messages
            userEmotion: this.userState.currentEmotion
        };
        
        localStorage.setItem('lastConversation', JSON.stringify(conversationData));
    }
    
    loadUserPreferences() {
        const savedPreferences = localStorage.getItem('agentPreferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            // Load voice preference
            if (preferences.voiceEnabled !== undefined) {
                this.voiceEnabled = preferences.voiceEnabled;
            }
            
            // Load learning style
            if (preferences.learningStyle) {
                this.userState.learningStyle = preferences.learningStyle;
            }
        }
    }
    
    isVoiceEnabled() {
        return localStorage.getItem('agentVoiceEnabled') === 'true';
    }
    
    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Cleanup
    destroy() {
        if (this.emotionInterval) clearInterval(this.emotionInterval);
        if (this.focusInterval) clearInterval(this.focusInterval);
        if (this.recognition) this.recognition.stop();
        if (this.synthesis) this.synthesis.cancel();
        
        // Save final state
        this.saveConversationToStorage();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chatMessages')) {
        window.agentInteraction = new AgentInteraction();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentInteraction;
}

// Initialize agent interaction
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isStudent()) {
        window.AgentInteraction = new AgentInteraction();
    }
});