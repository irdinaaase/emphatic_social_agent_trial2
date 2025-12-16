// js/ai/focus-monitor.js
class FocusMonitor {
    constructor() {
        this.focusLevel = 0.7;
        this.attentionScore = 0.5;
        this.distractionCount = 0;
        this.lastInteraction = Date.now();
        this.monitoring = false;
        this.listeners = {};
        
        this.init();
    }
    
    async init() {
        console.log('Focus monitor initialized');
        
        // Load saved settings
        this.loadSettings();
        
        // Start monitoring
        this.startMonitoring();
    }
    
    loadSettings() {
        const saved = Storage.get('focus_monitor_settings', {});
        this.settings = {
            monitorEvenWhenHidden: true, // NEW: Always monitor even if webcam preview is hidden
            alertThreshold: 0.3,
            updateInterval: 5000,
            ...saved
        };
    }
    
    startMonitoring() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        
        // Start periodic focus updates
        this.monitoringInterval = setInterval(() => {
            this.updateFocusLevel();
        }, this.settings.updateInterval);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    stopMonitoring() {
        this.monitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
    
    setupEventListeners() {
        // Track user interactions
        document.addEventListener('mousemove', () => this.recordInteraction());
        document.addEventListener('click', () => this.recordInteraction());
        document.addEventListener('keydown', () => this.recordInteraction());
        document.addEventListener('scroll', () => this.recordInteraction());
        
        // Track tab/window visibility
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Track window focus
        window.addEventListener('focus', () => this.handleWindowFocus());
        window.addEventListener('blur', () => this.handleWindowBlur());
    }
    
    recordInteraction() {
        this.lastInteraction = Date.now();
        this.distractionCount = Math.max(0, this.distractionCount - 1);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // User switched tabs/windows
            this.focusLevel *= 0.8; // Reduce focus when not visible
        }
    }
    
    handleWindowFocus() {
        // Window regained focus
        this.focusLevel = Math.min(1, this.focusLevel * 1.2);
    }
    
    handleWindowBlur() {
        // Window lost focus
        this.focusLevel *= 0.7;
        this.distractionCount++;
    }
    
    updateFocusLevel() {
        // Calculate time since last interaction
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        const inactivityPenalty = Math.min(1, timeSinceInteraction / (5 * 60 * 1000)); // 5 minutes max penalty
        
        // Get webcam attention data if available
        let webcamAttention = 0.5;
        if (window.emotionSystem?.modules?.webcam) {
            webcamAttention = window.emotionSystem.modules.webcam.getAttentionLevel?.()?.level || 0.5;
        } else if (window.EmotionDetector?.attentionData) {
            webcamAttention = window.EmotionDetector.attentionData.level || 0.5;
        }
        
        // Combine factors
        const interactionFactor = Math.max(0, 1 - inactivityPenalty);
        const attentionFactor = webcamAttention;
        const distractionFactor = Math.max(0, 1 - (this.distractionCount * 0.1));
        
        // Weighted average
        const newFocusLevel = (
            interactionFactor * 0.3 +
            attentionFactor * 0.4 +
            distractionFactor * 0.3
        );
        
        // Smooth transition
        const smoothing = 0.3;
        this.focusLevel = (this.focusLevel * (1 - smoothing)) + (newFocusLevel * smoothing);
        
        // Check for low focus
        if (this.focusLevel < this.settings.alertThreshold) {
            this.emit('lowFocus', {
                level: this.focusLevel,
                reason: this.getFocusReason()
            });
        }
        
        // Emit update
        this.emit('focusUpdate', {
            level: this.focusLevel,
            attention: attentionFactor,
            distraction: distractionFactor,
            timestamp: Date.now()
        });
    }
    
    getFocusReason() {
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        
        if (timeSinceInteraction > 2 * 60 * 1000) { // 2 minutes
            return 'inactivity';
        }
        if (this.distractionCount > 3) {
            return 'frequent_distractions';
        }
        return 'low_attention';
    }
    
    // Static method for compatibility
    static getFocusLevel() {
        return window.FocusMonitor?.instance?.getCurrentFocusLevel() || 0.7;
    }
    
    getCurrentFocusLevel() {
        return this.focusLevel;
    }
    
    getAttentionScore() {
        return this.attentionScore;
    }
    
    reset() {
        this.focusLevel = 0.7;
        this.attentionScore = 0.5;
        this.distractionCount = 0;
        this.lastInteraction = Date.now();
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
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
}

// Create global instance
window.FocusMonitor = new FocusMonitor();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusMonitor;
}