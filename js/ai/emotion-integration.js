// js/ai/emotion-integration.js
/**
 * Integration script for all emotion detection modules
 */

class EmotionSystemIntegrator {
    constructor() {
        console.log('Creating EmotionSystemIntegrator instance');
        this.modules = {
            detector: null,
            webcam: null,
            fusion: null,
            cameraUI: null
        };
        
        this.config = {
            autoStart: false,
            enableWebcam: true,
            enableTextAnalysis: true,
            enableBehaviorAnalysis: true,
            storageEnabled: true,
            debugMode: false
        };
        
        this.eventBus = new EventTarget();
        this.initialized = false;
    }
    
    async init() {
        console.log('Initializing Emotion System...');
        
        // Load configuration
        this.loadConfig();
        
        // Initialize modules
        await this.initializeModules();
        
        // Setup event forwarding
        this.setupEventForwarding();
        
        // Setup cross-module communication
        this.setupCrossModuleCommunication();
        
        this.initialized = true;
        console.log('Emotion System initialized successfully');
        return this;
    }
    
    loadConfig() {
        try {
            const savedConfig = Storage.get('emotion_system_config', {});
            this.config = { ...this.config, ...savedConfig };
        } catch (error) {
            console.warn('Could not load emotion system config:', error);
        }
    }
    
    saveConfig() {
        if (this.config.storageEnabled) {
            Storage.set('emotion_system_config', this.config);
        }
    }
    
    async initializeModules() {
        console.log('Initializing emotion modules...');
        
        // Check if EmotionDetector exists
        if (!window.EmotionDetector) {
            console.error('EmotionDetector not found. Make sure emotion-detector.js is loaded.');
            throw new Error('EmotionDetector not found');
        }
        
        this.modules.detector = window.EmotionDetector;
        console.log('EmotionDetector loaded:', this.modules.detector);
        
        // Initialize fusion engine
        if (window.EmotionFusion) {
            this.modules.fusion = window.EmotionFusion;
            console.log('Emotion Fusion loaded');
            
            // Register sources with fusion engine
            this.modules.fusion.registerSource('facial', 0.5);
            this.modules.fusion.registerSource('text', 0.3);
            this.modules.fusion.registerSource('behavior', 0.15);
            this.modules.fusion.registerSource('manual', 0.05);
            console.log('Emotion sources registered');
        } else {
            console.warn('EmotionFusion not found');
        }
        
        // Initialize webcam detector if enabled
        if (this.config.enableWebcam) {
            try {
                // Check if WebcamEmotionDetector class exists
                if (typeof WebcamEmotionDetector !== 'undefined') {
                    this.modules.webcam = new WebcamEmotionDetector();
                    await this.modules.webcam.initialize();
                    
                    // Connect to main detector
                    if (this.modules.detector) {
                        this.modules.detector.webcamDetector = this.modules.webcam;
                    }
                    console.log('Webcam Emotion Detector initialized');
                } else {
                    console.warn('WebcamEmotionDetector class not found');
                    this.config.enableWebcam = false;
                }
            } catch (error) {
                console.warn('Failed to initialize webcam detector:', error);
                this.config.enableWebcam = false;
            }
        }
        
        console.log('All modules initialized');
    }
    
    setupEventForwarding() {
        console.log('Setting up event forwarding...');
        
        // Forward events from webcam to fusion engine
        if (this.modules.webcam && this.modules.fusion) {
            this.modules.webcam.on('emotionUpdate', (data) => {
                this.modules.fusion.updateSource('facial', data);
            });
            
            this.modules.webcam.on('attentionUpdate', (data) => {
                if (this.modules.detector && this.modules.detector.handleAttentionUpdate) {
                    this.modules.detector.handleAttentionUpdate(data);
                }
            });
            console.log('Webcam event forwarding set up');
        }
        
        // Forward events from main detector to fusion engine
        if (this.modules.detector && this.modules.fusion) {
            if (this.modules.detector.on) {
                this.modules.detector.on('textEmotion', (data) => {
                    this.modules.fusion.updateSource('text', data);
                });
                
                this.modules.detector.on('behaviorEmotion', (data) => {
                    this.modules.fusion.updateSource('behavior', data);
                });
                
                this.modules.detector.on('manualEmotion', (data) => {
                    this.modules.fusion.updateSource('manual', data);
                });
                console.log('Detector event forwarding set up');
            }
        }
        
        // Forward fused emotions back to main detector
        if (this.modules.fusion && this.modules.detector) {
            this.modules.fusion.on('fusionUpdate', (data) => {
                if (this.modules.detector) {
                    const detectorData = {
                        emotion: data.emotion,
                        confidence: data.confidence,
                        source: 'fusion',
                        timestamp: data.timestamp
                    };
                    
                    if (!this.modules.detector.emotionSources) {
                        this.modules.detector.emotionSources = {};
                    }
                    
                    this.modules.detector.emotionSources.fusion = detectorData;
                    
                    if (typeof this.modules.detector.performEmotionFusion === 'function') {
                        this.modules.detector.performEmotionFusion();
                    }
                }
            });
            console.log('Fusion event forwarding set up');
        }
    }
    
    setupCrossModuleCommunication() {
        console.log('Setting up cross-module communication...');
        
        // Forward important events to system bus
        if (this.modules.detector && this.modules.detector.on) {
            this.modules.detector.on('emotionUpdate', (data) => {
                const event = new CustomEvent('emotion:final', { detail: data });
                this.eventBus.dispatchEvent(event);
                
                if (window.EngagementTracker) {
                    window.EngagementTracker.recordEmotionalFeedback({
                        sentiment: this.getSentimentFromEmotion(data.emotion),
                        type: 'emotion_detection',
                        data: data
                    });
                }
            });
            
            this.modules.detector.on('attentionUpdate', (data) => {
                const event = new CustomEvent('attention:update', { detail: data });
                this.eventBus.dispatchEvent(event);
            });
        }
        
        console.log('Cross-module communication set up');
    }
    
    startSystem() {
        if (!this.initialized) {
            console.error('Emotion System not initialized. Call init() first.');
            return false;
        }
        
        console.log('Starting Emotion System...');
        
        // Start webcam if enabled
        if (this.modules.webcam && this.modules.webcam.start) {
            this.modules.webcam.start();
        }
        
        // Start main detector monitoring
        if (this.modules.detector && this.modules.detector.startMonitoring) {
            this.modules.detector.startMonitoring();
        }
        
        // Emit system started event
        const event = new CustomEvent('emotionSystem:started', {
            detail: { timestamp: Date.now() }
        });
        this.eventBus.dispatchEvent(event);
        
        console.log('Emotion System started');
        return true;
    }
    
    stopSystem() {
        console.log('Stopping Emotion System...');
        
        // Stop webcam
        if (this.modules.webcam && this.modules.webcam.stop) {
            this.modules.webcam.stop();
        }
        
        // Stop main detector
        if (this.modules.detector && this.modules.detector.destroy) {
            this.modules.detector.destroy();
        }
        
        // Emit system stopped event
        const event = new CustomEvent('emotionSystem:stopped', {
            detail: { timestamp: Date.now() }
        });
        this.eventBus.dispatchEvent(event);
        
        console.log('Emotion System stopped');
    }
    
    getSentimentFromEmotion(emotion) {
        const sentimentMap = {
            'happy': 'positive',
            'excited': 'positive',
            'proud': 'positive',
            'surprised': 'neutral',
            'neutral': 'neutral',
            'confused': 'negative',
            'bored': 'negative',
            'frustrated': 'negative',
            'sad': 'negative',
            'angry': 'negative',
            'anxious': 'negative'
        };
        
        return sentimentMap[emotion] || 'neutral';
    }
    
    getSystemStatus() {
        return {
            detector: {
                initialized: !!this.modules.detector,
                currentEmotion: this.modules.detector?.getCurrentEmotion?.(),
                historySize: this.modules.detector?.emotionHistory?.length || 0
            },
            webcam: {
                enabled: this.config.enableWebcam,
                running: this.modules.webcam?.isRunning?.() || false,
                faceDetected: this.modules.webcam?.isFaceDetected?.() || false
            },
            fusion: {
                initialized: !!this.modules.fusion,
                method: this.modules.fusion?.config?.fusionMethod,
                sourceCount: Object.keys(this.modules.fusion?.sources || {}).length
            },
            config: this.config,
            timestamp: Date.now()
        };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        
        if (newConfig.enableWebcam !== undefined) {
            if (newConfig.enableWebcam && !this.modules.webcam) {
                this.initializeWebcam();
            } else if (!newConfig.enableWebcam && this.modules.webcam) {
                this.modules.webcam.stop();
                if (this.modules.detector) {
                    this.modules.detector.webcamDetector = null;
                }
            }
        }
        
        console.log('Emotion System configuration updated');
    }
    
    async initializeWebcam() {
        try {
            if (typeof WebcamEmotionDetector !== 'undefined') {
                this.modules.webcam = new WebcamEmotionDetector();
                await this.modules.webcam.initialize();
                
                if (this.modules.detector) {
                    this.modules.detector.webcamDetector = this.modules.webcam;
                }
                
                // Setup event forwarding
                this.setupEventForwarding();
                
                console.log('Webcam detector initialized');
                return true;
            }
        } catch (error) {
            console.error('Failed to initialize webcam:', error);
        }
        return false;
    }
}

// Make it globally available IMMEDIATELY
window.EmotionSystemIntegrator = EmotionSystemIntegrator;
console.log('EmotionSystemIntegrator class registered globally');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionSystemIntegrator;
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, Emotion System ready');
    
    // Check if user has granted camera permission before
    const hasCameraPermission = Storage.get('camera_permission_granted', false);
    
    if (hasCameraPermission) {
        window.EmotionSystem.startSystem();
    }
});