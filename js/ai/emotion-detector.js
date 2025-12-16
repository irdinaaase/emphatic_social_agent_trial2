// js/ai/emotion-detector.js
/**
 * Main Emotion Detector Class
 * Integrates text analysis, behavior monitoring, and facial emotion detection
 */

class EmotionDetector {
    constructor() {
        this.emotions = [
            'happy', 'sad', 'angry', 'frustrated', 'confused', 
            'bored', 'excited', 'neutral', 'anxious', 'proud', 'surprised'
        ];
        
        this.emotionHistory = [];
        this.currentEmotion = 'neutral';
        this.confidence = 0.0;
        this.emotionSources = {};
        
        // Detection modules
        this.webcamDetector = null;
        this.behaviorMonitor = null;
        
        // Configuration
        this.config = {
            enabled: true,
            webcamEnabled: false,
            textAnalysis: true,
            behaviorAnalysis: true,
            fusionEnabled: true,
            storageEnabled: true,
            samplingInterval: 2000, // ms
            maxHistory: 100
        };
        
        // Weights for fusion (sum to 1.0)
        this.sourceWeights = {
            facial: 0.5,
            text: 0.3,
            behavior: 0.15,
            manual: 0.05
        };
        
        // Emotion intensity tracking
        this.emotionIntensity = {
            happy: 0,
            sad: 0,
            angry: 0,
            frustrated: 0,
            confused: 0,
            bored: 0,
            excited: 0,
            neutral: 0,
            anxious: 0,
            proud: 0,
            surprised: 0
        };
        
        // Event tracking
        this.listeners = {};
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Emotion Detector...');
        
        // Load configuration
        this.loadConfig();
        
        // Initialize modules
        await this.initializeModules();
        
        // Start monitoring
        this.startMonitoring();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Emotion Detector initialized successfully');
    }
    
    loadConfig() {
        try {
            const savedConfig = Storage.get('emotion_detector_config', {});
            this.config = { ...this.config, ...savedConfig };
        } catch (error) {
            console.warn('Could not load emotion detector config:', error);
        }
    }
    
    saveConfig() {
        if (this.config.storageEnabled) {
            Storage.set('emotion_detector_config', this.config);
        }
    }
    
    async initializeModules() {
        // Initialize webcam detector if enabled
        if (this.config.webcamEnabled) {
            try {
                if (typeof WebcamEmotionDetector !== 'undefined') {
                    this.webcamDetector = new WebcamEmotionDetector();
                    await this.webcamDetector.initialize();
                    console.log('Webcam Emotion Detector initialized');
                } else {
                    console.warn('WebcamEmotionDetector not available');
                    this.config.webcamEnabled = false;
                }
            } catch (error) {
                console.warn('Failed to initialize webcam detector:', error);
                this.config.webcamEnabled = false;
            }
        }
        
        // Initialize behavior monitor - FIXED VERSION
        if (this.config.behaviorAnalysis) {
            try {
                if (typeof BehaviorEmotionMonitor !== 'undefined') {
                    this.behaviorMonitor = new BehaviorEmotionMonitor();
                    if (this.behaviorMonitor.initialize) {
                        this.behaviorMonitor.initialize();
                    }
                    console.log('Behavior Emotion Monitor initialized');
                } else {
                    // Create a minimal fallback
                    console.warn('BehaviorEmotionMonitor not found - using fallback');
                    this.behaviorMonitor = this.createFallbackBehaviorMonitor();
                }
            } catch (error) {
                console.warn('Error initializing behavior monitor:', error);
                this.behaviorMonitor = this.createFallbackBehaviorMonitor();
            }
        }
    }

    createFallbackBehaviorMonitor() {
        return {
            initialize: () => Promise.resolve(),
            stop: () => {},
            on: () => {},
            analyzeInteraction: () => ({
                engagement: 50,
                mood: 'neutral',
                confidence: 0.3
            })
        };
    }
    
    setupEventListeners() {
        // Text input monitoring
        if (this.config.textAnalysis) {
            document.addEventListener('input', this.handleTextInput.bind(this));
        }
        
        // Manual emotion selection
        document.addEventListener('manualEmotionSelect', this.handleManualEmotion.bind(this));
        
        // Webcam events
        if (this.webcamDetector) {
            this.webcamDetector.on('emotionUpdate', this.handleFacialEmotion.bind(this));
            this.webcamDetector.on('attentionUpdate', this.handleAttentionUpdate.bind(this));
        }
        
        // Behavior events
        if (this.behaviorMonitor) {
            this.behaviorMonitor.on('boredomDetected', this.handleBoredom.bind(this));
            this.behaviorMonitor.on('confusionDetected', this.handleConfusion.bind(this));
            this.behaviorMonitor.on('frustrationDetected', this.handleFrustration.bind(this));
        }
    }
    
    startMonitoring() {
        // Start periodic emotion fusion
        this.monitoringInterval = setInterval(() => {
            this.performEmotionFusion();
            this.updateEmotionIntensity();
            this.checkForAlerts();
        }, this.config.samplingInterval);
    }
    
    handleTextInput(event) {
        if (!event.target.matches('[data-emotion-monitor]')) return;
        
        const text = event.target.value;
        if (text.length < 3) return;
        
        const analysis = this.analyzeText(text);
        if (analysis) {
            this.emotionSources.text = analysis;
            this.emit('textEmotion', analysis);
        }
    }
    
    analyzeText(text) {
        const lowerText = text.toLowerCase().trim();
        
        // Enhanced emotion patterns
        const emotionPatterns = {
            happy: [
                /\b(great|good|awesome|excellent|wonderful|fantastic|amazing)\b/i,
                /\b(love|like|enjoy|adore)\b.*\b(this|it|learning|activity)\b/i,
                /\b(fun|interesting|exciting|engaging)\b/i,
                /\b(yay|woohoo|nice|cool|perfect)\b/i,
                /\b(understand|got it|clear|easy)\b/i
            ],
            sad: [
                /\b(sad|unhappy|depressed|miserable|down|blue)\b/i,
                /\b(disappointed|let down|failed|missed)\b/i,
                /\b(cry|tears|upset|hurt)\b/i,
                /\b(can't|won't|don't).*\b(try|continue|care)\b/i,
                /\b(give up|quit|stop|end)\b/i
            ],
            angry: [
                /\b(angry|mad|furious|enraged|irritated)\b/i,
                /\b(hate|detest|despise|loathe)\b/i,
                /\b(stupid|dumb|ridiculous|annoying)\b/i,
                /([A-Z]{2,}|!{2,})/g, // ALL CAPS or multiple exclamation
                /\b(pissed|aggravated)\b/i
            ],
            frustrated: [
                /\b(frustrated|annoyed|irked|exasperated)\b/i,
                /\b(don't understand|confusing|complicated|unclear)\b/i,
                /\b(hard|difficult|challenging|tough)\b/i,
                /\b(stuck|blocked|can't|unable).*\b(do|solve|understand|figure)\b/i,
                /\b(again|repeat|over).*\b(and over)\b/i
            ],
            confused: [
                /\b(confused|puzzled|perplexed|baffled|lost)\b/i,
                /\b(what|how|why).*\b(mean|work|do|happening)\b/i,
                /\b(help|explain|clarify|elaborate)\b/i,
                /\b(don't get|not sure|uncertain|unclear)\b/i,
                /\b(mixed up|tangled|contradiction)\b/i
            ],
            bored: [
                /\b(bored|tired|sleepy|drowsy|lethargic)\b/i,
                /\b(boring|monotonous|repetitive|tedious)\b/i,
                /\b(enough|stop|quit).*\b(this|now|already)\b/i,
                /\b(when.*end|how.*long|taking.*forever)\b/i,
                /\b(mindless|pointless|useless)\b/i
            ],
            excited: [
                /\b(excited|thrilled|enthusiastic|eager|pumped)\b/i,
                /\b(can't wait|looking forward|anticipating)\b/i,
                /\b(wow|awesome|great).*\b(can't believe)\b/i,
                /!{2,}/g, // Multiple exclamation marks
                /\b(ready|set|go|start)\b/i
            ],
            anxious: [
                /\b(anxious|nervous|worried|stressed|tense)\b/i,
                /\b(panic|fear|scared|afraid|frightened)\b/i,
                /\b(what if|maybe|possibly|hopefully)\b/i,
                /\b(pressure|deadline|time|rush)\b/i,
                /\b(heart.*racing|sweaty|shaky)\b/i
            ],
            proud: [
                /\b(proud|accomplished|achieved|completed)\b/i,
                /\b(did it|finished|succeeded|mastered)\b/i,
                /\b(best|better|improved|progress)\b/i,
                /\b(learned|understood|figured|solved)\b/i,
                /\b(confidence|capable|able|competent)\b/i
            ]
        };
        
        // Count matches for each emotion
        const emotionScores = {};
        let totalMatches = 0;
        
        for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
            let matches = 0;
            patterns.forEach(pattern => {
                const result = lowerText.match(pattern);
                if (result) matches += result.length;
            });
            
            if (matches > 0) {
                emotionScores[emotion] = matches;
                totalMatches += matches;
            }
        }
        
        // Calculate confidence and dominant emotion
        let dominantEmotion = 'neutral';
        let highestScore = 0;
        let confidence = 0;
        
        for (const [emotion, score] of Object.entries(emotionScores)) {
            const normalizedScore = score / totalMatches;
            if (normalizedScore > highestScore) {
                highestScore = normalizedScore;
                dominantEmotion = emotion;
                confidence = normalizedScore;
            }
        }
        
        // Boost confidence for strong indicators
        const strongIndicators = lowerText.match(/\b(very|really|extremely|totally|completely)\s+\b\w+/gi);
        if (strongIndicators) {
            confidence = Math.min(1, confidence * 1.3);
        }
        
        // Extract keywords
        const keywords = this.extractKeywords(lowerText);
        
        // Analyze sentiment
        const sentiment = this.analyzeSentiment(lowerText);
        
        return {
            emotion: dominantEmotion,
            confidence: Math.min(1, confidence),
            source: 'text',
            sentiment: sentiment,
            keywords: keywords,
            rawText: text.substring(0, 100), // Store first 100 chars for context
            timestamp: Date.now()
        };
    }
    
    extractKeywords(text) {
        const emotionKeywords = {
            happy: ['happy', 'joy', 'great', 'good', 'love', 'like', 'fun', 'excited'],
            sad: ['sad', 'unhappy', 'cry', 'tears', 'hurt', 'lonely', 'miserable'],
            angry: ['angry', 'mad', 'hate', 'rage', 'furious', 'annoyed', 'upset'],
            frustrated: ['frustrated', 'stuck', 'hard', 'difficult', 'challenge', 'struggle'],
            confused: ['confuse', 'puzzle', 'lost', 'understand', 'what', 'how', 'why'],
            bored: ['bored', 'boring', 'tired', 'sleepy', 'monotonous', 'repeat'],
            anxious: ['anxious', 'nervous', 'worried', 'stress', 'tense', 'panic'],
            proud: ['proud', 'accomplish', 'achieve', 'success', 'complete', 'master']
        };
        
        const keywords = [];
        const words = text.toLowerCase().split(/\W+/);
        
        for (const word of words) {
            if (word.length < 3) continue;
            
            for (const [emotion, emotionWords] of Object.entries(emotionKeywords)) {
                if (emotionWords.includes(word)) {
                    keywords.push({
                        word: word,
                        emotion: emotion,
                        position: text.indexOf(word)
                    });
                    break;
                }
            }
        }
        
        return keywords;
    }
    
    analyzeSentiment(text) {
        const positiveWords = [
            'good', 'great', 'excellent', 'awesome', 'wonderful',
            'fantastic', 'amazing', 'love', 'like', 'enjoy',
            'happy', 'joy', 'pleased', 'satisfied', 'content',
            'perfect', 'best', 'better', 'improved', 'progress',
            'success', 'achievement', 'proud', 'confident'
        ];
        
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'worst',
            'hate', 'dislike', 'frustrated', 'angry', 'sad',
            'unhappy', 'disappointed', 'failed', 'worse',
            'difficult', 'hard', 'challenging', 'struggle',
            'confused', 'bored', 'tired', 'anxious', 'worried'
        ];
        
        const intensifiers = ['very', 'really', 'extremely', 'totally', 'completely'];
        const negators = ['not', 'never', 'no', "don't", "can't", "won't"];
        
        let score = 0;
        const words = text.toLowerCase().split(/\W+/);
        let nextWordMultiplier = 1;
        let isNegated = false;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            // Check for negators
            if (negators.includes(word)) {
                isNegated = true;
                continue;
            }
            
            // Check for intensifiers
            if (intensifiers.includes(word)) {
                nextWordMultiplier = 1.5;
                continue;
            }
            
            // Check for positive words
            if (positiveWords.includes(word)) {
                let wordScore = 1 * nextWordMultiplier;
                if (isNegated) wordScore *= -1;
                score += wordScore;
            }
            
            // Check for negative words
            if (negativeWords.includes(word)) {
                let wordScore = -1 * nextWordMultiplier;
                if (isNegated) wordScore *= -1;
                score += wordScore;
            }
            
            // Reset modifiers
            nextWordMultiplier = 1;
            isNegated = false;
        }
        
        // Normalize score to -1 to 1 range
        const maxPossible = Math.max(positiveWords.length, negativeWords.length);
        const normalizedScore = score / maxPossible;
        
        if (normalizedScore > 0.1) return 'positive';
        if (normalizedScore < -0.1) return 'negative';
        return 'neutral';
    }
    
    handleManualEmotion(event) {
        const emotionData = event.detail;
        
        const analysis = {
            emotion: emotionData.emotion,
            confidence: emotionData.confidence || 1.0,
            source: 'manual',
            reason: emotionData.reason || 'User selected',
            timestamp: Date.now()
        };
        
        this.emotionSources.manual = analysis;
        this.emit('manualEmotion', analysis);
    }
    
    handleFacialEmotion(data) {
        this.emotionSources.facial = data;
        this.emit('facialEmotion', data);
    }
    
    handleAttentionUpdate(data) {
        this.attentionData = data;
        this.emit('attentionUpdate', data);
    }
    
    handleBoredom(data) {
        const analysis = {
            emotion: 'bored',
            confidence: 0.7,
            source: 'behavior',
            reason: data.reason || 'Inactivity detected',
            duration: data.duration,
            timestamp: Date.now()
        };
        
        this.emotionSources.behavior = analysis;
        this.emit('behaviorEmotion', analysis);
    }
    
    handleConfusion(data) {
        const analysis = {
            emotion: 'confused',
            confidence: 0.6,
            source: 'behavior',
            reason: data.reason || 'Typing patterns indicate confusion',
            patterns: data.patterns,
            timestamp: Date.now()
        };
        
        this.emotionSources.behavior = analysis;
        this.emit('behaviorEmotion', analysis);
    }
    
    handleFrustration(data) {
        const analysis = {
            emotion: 'frustrated',
            confidence: 0.65,
            source: 'behavior',
            reason: data.reason || 'Interaction patterns indicate frustration',
            patterns: data.patterns,
            timestamp: Date.now()
        };
        
        this.emotionSources.behavior = analysis;
        this.emit('behaviorEmotion', analysis);
    }
    
    performEmotionFusion() {
        if (!this.config.fusionEnabled) return;
        
        const activeSources = Object.entries(this.emotionSources).filter(
            ([_, data]) => data && Date.now() - data.timestamp < 10000
        );
        
        if (activeSources.length === 0) {
            // No recent data, decay confidence
            this.confidence = Math.max(0, this.confidence * 0.9);
            return;
        }
        
        // Calculate weighted scores for each emotion
        const emotionScores = {};
        
        for (const [source, data] of activeSources) {
            const weight = this.sourceWeights[source] || 0.1;
            const score = data.confidence * weight;
            
            if (emotionScores[data.emotion]) {
                emotionScores[data.emotion] += score;
            } else {
                emotionScores[data.emotion] = score;
            }
        }
        
        // Find fused emotion
        let fusedEmotion = 'neutral';
        let fusedScore = 0;
        
        for (const [emotion, score] of Object.entries(emotionScores)) {
            if (score > fusedScore) {
                fusedScore = score;
                fusedEmotion = emotion;
            }
        }
        
        // Normalize confidence
        fusedScore = Math.min(1, fusedScore);
        
        // Apply smoothing to avoid rapid changes
        const smoothing = 0.3;
        const newConfidence = (this.confidence * (1 - smoothing)) + (fusedScore * smoothing);
        
        // Only change emotion if confidence is high enough
        let newEmotion = this.currentEmotion;
        if (fusedScore > 0.6 && fusedEmotion !== this.currentEmotion) {
            newEmotion = fusedEmotion;
            
            // Emit emotion change event
            this.emit('emotionChange', {
                from: this.currentEmotion,
                to: newEmotion,
                confidence: newConfidence,
                sources: activeSources.map(([s, d]) => s)
            });
        }
        
        // Update emotion
        this.updateEmotion(newEmotion, newConfidence, activeSources);
    }
    
    updateEmotion(emotion, confidence, sources = []) {
        const previousEmotion = this.currentEmotion;
        this.currentEmotion = emotion;
        this.confidence = confidence;
        
        // Update emotion intensity
        this.emotionIntensity[emotion] = Math.min(1, (this.emotionIntensity[emotion] || 0) + 0.1);
        
        // Decay other emotions
        Object.keys(this.emotionIntensity).forEach(e => {
            if (e !== emotion) {
                this.emotionIntensity[e] = Math.max(0, (this.emotionIntensity[e] || 0) * 0.9);
            }
        });
        
        // Create history entry
        const entry = {
            emotion: emotion,
            confidence: confidence,
            intensity: this.emotionIntensity[emotion],
            sources: sources.reduce((obj, [source, data]) => {
                obj[source] = {
                    emotion: data.emotion,
                    confidence: data.confidence
                };
                return obj;
            }, {}),
            attention: this.attentionData,
            timestamp: Date.now()
        };
        
        // Add to history
        this.emotionHistory.push(entry);
        
        // Trim history
        if (this.emotionHistory.length > this.config.maxHistory) {
            this.emotionHistory = this.emotionHistory.slice(-this.config.maxHistory);
        }
        
        // Store if enabled
        if (this.config.storageEnabled) {
            this.storeEmotionData(entry);
        }
        
        // Emit update event
        this.emit('emotionUpdate', {
            emotion: emotion,
            confidence: confidence,
            intensity: this.emotionIntensity[emotion],
            previous: previousEmotion,
            timestamp: entry.timestamp
        });
        
        // Log for debugging
        if (confidence > 0.7) {
            console.log(`Emotion: ${emotion} (${confidence.toFixed(2)})`);
        }
    }
    
    updateEmotionIntensity() {
        // Gradually decay all intensities
        Object.keys(this.emotionIntensity).forEach(emotion => {
            this.emotionIntensity[emotion] *= 0.99;
        });
    }
    
    checkForAlerts() {
        // Check for sustained negative emotions
        const recentEmotions = this.getRecentEmotions(300000); // Last 5 minutes
        if (recentEmotions.length < 5) return;
        
        const negativeEmotions = ['sad', 'angry', 'frustrated', 'anxious'];
        const negativeCount = recentEmotions.filter(e => 
            negativeEmotions.includes(e.emotion) && e.confidence > 0.6
        ).length;
        
        // Alert if 70% of recent emotions are negative
        if (negativeCount >= recentEmotions.length * 0.7) {
            this.emit('negativeEmotionAlert', {
                emotions: recentEmotions,
                negativePercentage: (negativeCount / recentEmotions.length) * 100,
                duration: '5 minutes',
                timestamp: Date.now()
            });
        }
        
        // Check for extreme emotions
        const extremeEmotions = recentEmotions.filter(e => 
            e.confidence > 0.9 && ['angry', 'sad', 'frustrated'].includes(e.emotion)
        );
        
        if (extremeEmotions.length > 0) {
            this.emit('extremeEmotionAlert', {
                emotion: extremeEmotions[0].emotion,
                confidence: extremeEmotions[0].confidence,
                timestamp: Date.now()
            });
        }
    }
    
    storeEmotionData(entry) {
        try {
            const emotionLogs = Storage.get('emotion_logs', []);
            emotionLogs.push(entry);
            
            // Keep only last 500 logs
            if (emotionLogs.length > 500) {
                emotionLogs.splice(0, emotionLogs.length - 500);
            }
            
            Storage.set('emotion_logs', emotionLogs);
        } catch (error) {
            console.warn('Failed to store emotion data:', error);
        }
    }
    
    // Public API Methods
    
    getCurrentEmotion() {
        return {
            emotion: this.currentEmotion,
            confidence: this.confidence,
            intensity: this.emotionIntensity[this.currentEmotion],
            attention: this.attentionData,
            sources: Object.keys(this.emotionSources),
            timestamp: Date.now()
        };
    }
    
    getEmotionHistory(duration = 3600000) {
        const cutoff = Date.now() - duration;
        return this.emotionHistory.filter(entry => entry.timestamp > cutoff);
    }
    
    getRecentEmotions(duration = 300000) {
        return this.getEmotionHistory(duration);
    }
    
    getEmotionTrend() {
        const recent = this.getRecentEmotions(600000); // Last 10 minutes
        if (recent.length < 3) return 'stable';
        
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        // Map emotions to scores for trend calculation
        const emotionScores = {
            'happy': 1, 'excited': 1, 'proud': 0.8,
            'neutral': 0.5,
            'confused': 0.3, 'bored': 0.2, 'anxious': 0.2,
            'frustrated': 0.1, 'sad': 0.1, 'angry': 0
        };
        
        const firstScore = emotionScores[first.emotion] || 0.5;
        const lastScore = emotionScores[last.emotion] || 0.5;
        const difference = lastScore - firstScore;
        
        if (difference > 0.2) return 'improving';
        if (difference < -0.2) return 'declining';
        return 'stable';
    }
    
    getEmotionStatistics(duration = 3600000) {
        const history = this.getEmotionHistory(duration);
        if (history.length === 0) return null;
        
        const stats = {
            totalEntries: history.length,
            emotions: {},
            averageConfidence: 0,
            dominantEmotion: 'neutral',
            attentionAverage: 0
        };
        
        let totalConfidence = 0;
        let totalAttention = 0;
        const emotionCounts = {};
        
        history.forEach(entry => {
            // Count emotions
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
            
            // Sum confidence
            totalConfidence += entry.confidence;
            
            // Sum attention
            if (entry.attention && entry.attention.level) {
                totalAttention += entry.attention.level;
            }
        });
        
        // Calculate percentages
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            stats.emotions[emotion] = {
                count: count,
                percentage: (count / history.length) * 100,
                averageIntensity: history
                    .filter(e => e.emotion === emotion)
                    .reduce((sum, e) => sum + (e.intensity || 0), 0) / count
            };
        }
        
        // Find dominant emotion
        let maxCount = 0;
        for (const [emotion, data] of Object.entries(stats.emotions)) {
            if (data.count > maxCount) {
                maxCount = data.count;
                stats.dominantEmotion = emotion;
            }
        }
        
        stats.averageConfidence = totalConfidence / history.length;
        stats.attentionAverage = totalAttention / history.length;
        
        return stats;
    }
    
    getAttentionScore() {
        if (!this.attentionData) return 0.5;
        return this.attentionData.level || 0.5;
    }
    
    isStudentPresent() {
        if (!this.webcamDetector) return true; // Assume present if no webcam
        
        return this.webcamDetector.isFaceDetected();
    }
    
    getEngagementScoreFromEmotion() {
        const emotionEngagementMap = {
            'happy': 0.9, 'excited': 1.0, 'proud': 0.8,
            'neutral': 0.5, 'surprised': 0.6,
            'confused': 0.3, 'bored': 0.2, 'anxious': 0.3,
            'frustrated': 0.1, 'sad': 0.1, 'angry': 0
        };
        
        const baseEngagement = emotionEngagementMap[this.currentEmotion] || 0.5;
        const attention = this.getAttentionScore();
        const confidence = this.confidence;
        
        // Weighted combination
        const engagement = (
            baseEngagement * 0.4 +
            attention * 0.4 +
            confidence * 0.2
        );
        
        return Math.max(0, Math.min(1, engagement));
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
    
    // Configuration methods
    enableWebcam() {
        this.config.webcamEnabled = true;
        this.saveConfig();
        this.initializeModules();
    }
    
    disableWebcam() {
        this.config.webcamEnabled = false;
        if (this.webcamDetector) {
            this.webcamDetector.stop();
            this.webcamDetector = null;
        }
        this.saveConfig();
    }
    
    setSourceWeights(weights) {
        this.sourceWeights = { ...this.sourceWeights, ...weights };
        this.saveConfig();
    }
    
    reset() {
        this.currentEmotion = 'neutral';
        this.confidence = 0;
        this.emotionHistory = [];
        this.emotionSources = {};
        this.emotionIntensity = Object.keys(this.emotionIntensity).reduce((obj, key) => {
            obj[key] = 0;
            return obj;
        }, {});
        
        console.log('Emotion detector reset');
        this.emit('reset', { timestamp: Date.now() });
    }
    
    destroy() {
        clearInterval(this.monitoringInterval);
        
        if (this.webcamDetector) {
            this.webcamDetector.stop();
        }
        
        if (this.behaviorMonitor) {
            this.behaviorMonitor.stop();
        }
        
        this.listeners = {};
        console.log('Emotion detector destroyed');
    }
}

// Placeholder for BehaviorEmotionMonitor if it doesn't exist
if (typeof BehaviorEmotionMonitor === 'undefined') {
    console.warn('Creating placeholder BehaviorEmotionMonitor');
    
    class BehaviorEmotionMonitor {
        constructor() {
            console.log('Placeholder BehaviorEmotionMonitor created');
            this.events = {};
        }
        
        initialize() {
            console.log('Placeholder behavior monitor initialized');
            return Promise.resolve();
        }
        
        stop() {
            console.log('Placeholder behavior monitor stopped');
        }
        
        on(event, callback) {
            if (!this.events[event]) this.events[event] = [];
            this.events[event].push(callback);
        }
        
        // Placeholder methods that don't do anything
        analyzeInteraction() {
            return { engagement: 50, mood: 'neutral' };
        }
    }
    
    window.BehaviorEmotionMonitor = BehaviorEmotionMonitor;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionDetector;
}

// Global instance
window.EmotionDetector = new EmotionDetector();