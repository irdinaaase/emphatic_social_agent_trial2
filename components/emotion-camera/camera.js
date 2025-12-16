// components/emotion-camera/camera.js
/**
 * Emotion Camera Component Controller
 */

class EmotionCameraComponent {
    constructor(container) {
        this.container = container || document.querySelector('[data-component="emotion-camera"]');
        this.elements = {};
        this.state = {
            cameraEnabled: false,
            overlayEnabled: true,
            settingsOpen: false,
            lastEmotionUpdate: null,
            lastAttentionUpdate: null
        };
        
        // Emotion mapping for icons
        this.emotionIcons = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'frustrated': '😤',
            'confused': '😕',
            'bored': '😴',
            'excited': '🤩',
            'neutral': '😐',
            'anxious': '😰',
            'proud': '😌',
            'surprised': '😲'
        };
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Emotion camera container not found');
            return;
        }
        
        this.cacheElements();
        this.setupEventListeners();
        this.initializeCamera();
        this.updateUI();
        
        console.log('Emotion Camera Component initialized');
    }
    
    cacheElements() {
        // Control buttons
        this.elements.cameraToggle = this.container.querySelector('[data-action="toggle-camera"]');
        this.elements.overlayToggle = this.container.querySelector('[data-action="toggle-overlay"]');
        this.elements.settingsBtn = this.container.querySelector('[data-action="settings"]');
        this.elements.closeSettings = this.container.querySelector('[data-action="close-settings"]');
        
        // Camera feed
        this.elements.cameraFeed = this.container.querySelector('[data-camera-feed]');
        this.elements.cameraPlaceholder = this.container.querySelector('[data-camera-placeholder]');
        this.elements.cameraVideo = this.container.querySelector('.camera-video');
        this.elements.emotionOverlay = this.container.querySelector('.emotion-overlay');
        this.elements.faceIndicator = this.container.querySelector('[data-face-indicator]');
        
        // Emotion display
        this.elements.emotionIcon = this.container.querySelector('[data-emotion-icon]');
        this.elements.emotionName = this.container.querySelector('[data-emotion-name]');
        this.elements.confidenceFill = this.container.querySelector('[data-confidence-fill]');
        this.elements.confidenceValue = this.container.querySelector('[data-confidence-value]');
        
        // Attention display
        this.elements.attentionFill = this.container.querySelector('[data-attention-fill]');
        this.elements.attentionValue = this.container.querySelector('[data-attention-value]');
        this.elements.attentionTip = this.container.querySelector('[data-attention-tip]');
        
        // Sources list
        this.elements.sourcesList = this.container.querySelector('[data-sources-list]');
        
        // Status text
        this.elements.cameraStatus = this.container.querySelector('[data-camera-status]');
        this.elements.overlayStatus = this.container.querySelector('[data-overlay-status]');
        
        // Settings modal
        this.elements.settingsModal = this.container.querySelector('[data-settings-modal]');
        this.elements.settingsCheckboxes = {
            'draw-face': this.container.querySelector('[data-setting="draw-face"]'),
            'draw-emotion': this.container.querySelector('[data-setting="draw-emotion"]'),
            'draw-attention': this.container.querySelector('[data-setting="draw-attention"]')
        };
        this.elements.sensitivitySlider = this.container.querySelector('[data-setting="sensitivity"]');
        this.elements.frequencySelect = this.container.querySelector('[data-setting="frequency"]');
        this.elements.resetSettings = this.container.querySelector('[data-action="reset-settings"]');
        this.elements.saveSettings = this.container.querySelector('[data-action="save-settings"]');
        
        // Privacy buttons
        this.elements.learnMoreBtn = this.container.querySelector('[data-action="learn-more"]');
        this.elements.disableCameraBtn = this.container.querySelector('[data-action="disable-camera"]');
    }
    
    setupEventListeners() {
        // Camera controls
        this.elements.cameraToggle?.addEventListener('click', () => this.toggleCamera());
        this.elements.overlayToggle?.addEventListener('click', () => this.toggleOverlay());
        this.elements.settingsBtn?.addEventListener('click', () => this.openSettings());
        this.elements.closeSettings?.addEventListener('click', () => this.closeSettings());
        
        // Settings controls
        this.elements.resetSettings?.addEventListener('click', () => this.resetSettings());
        this.elements.saveSettings?.addEventListener('click', () => this.saveSettings());
        
        // Privacy controls
        this.elements.learnMoreBtn?.addEventListener('click', () => this.showPrivacyInfo());
        this.elements.disableCameraBtn?.addEventListener('click', () => this.disableCamera());
        
        // Listen to emotion updates from the main system
        if (window.EmotionDetector) {
            window.EmotionDetector.on('emotionUpdate', this.handleEmotionUpdate.bind(this));
            window.EmotionDetector.on('attentionUpdate', this.handleAttentionUpdate.bind(this));
            window.EmotionDetector.on('facialEmotion', this.handleFacialEmotion.bind(this));
        }
        
        // Listen to webcam detector events
        if (window.EmotionDetector?.webcamDetector) {
            window.EmotionDetector.webcamDetector.on('emotionUpdate', this.handleWebcamEmotion.bind(this));
            window.EmotionDetector.webcamDetector.on('attentionUpdate', this.handleWebcamAttention.bind(this));
            window.EmotionDetector.webcamDetector.on('faceLost', this.handleFaceLost.bind(this));
        }
    }
    
    async initializeCamera() {
        try {
            // Check if webcam detector is available
            if (!window.EmotionDetector?.webcamDetector) {
                this.showCameraUnavailable();
                return;
            }
            
            // Initialize webcam
            const success = await window.EmotionDetector.webcamDetector.initialize();
            
            if (success) {
                this.state.cameraEnabled = true;
                this.startCamera();
                this.updateSourceStatus('facial', 'active');
            } else {
                this.showCameraUnavailable();
            }
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            this.showCameraUnavailable();
        }
    }
    
    startCamera() {
        if (window.EmotionDetector?.webcamDetector) {
            window.EmotionDetector.webcamDetector.start();
            
            // Hide placeholder, show video
            this.elements.cameraPlaceholder.style.display = 'none';
            this.elements.cameraVideo.style.display = 'block';
            
            this.updateUI();
        }
    }
    
    stopCamera() {
        if (window.EmotionDetector?.webcamDetector) {
            window.EmotionDetector.webcamDetector.stop();
            
            // Show placeholder, hide video
            this.elements.cameraPlaceholder.style.display = 'flex';
            this.elements.cameraVideo.style.display = 'none';
            
            this.updateUI();
        }
    }
    
    toggleCamera() {
        this.state.cameraEnabled = !this.state.cameraEnabled;
        
        if (this.state.cameraEnabled) {
            this.startCamera();
        } else {
            this.stopCamera();
        }
        
        this.updateUI();
    }
    
    toggleOverlay() {
        this.state.overlayEnabled = !this.state.overlayEnabled;
        
        if (window.EmotionDetector?.webcamDetector) {
            window.EmotionDetector.webcamDetector.updateConfig({
                drawFace: this.state.overlayEnabled,
                drawEmotion: this.state.overlayEnabled,
                drawAttention: this.state.overlayEnabled
            });
        }
        
        this.updateUI();
    }
    
    openSettings() {
        this.state.settingsOpen = true;
        this.elements.settingsModal.classList.add('active');
        this.loadSettings();
    }
    
    closeSettings() {
        this.state.settingsOpen = false;
        this.elements.settingsModal.classList.remove('active');
    }
    
    loadSettings() {
        // Load saved settings or use defaults
        const settings = Storage.get('emotion_camera_settings', {
            drawFace: true,
            drawEmotion: true,
            drawAttention: true,
            sensitivity: 5,
            frequency: 10
        });
        
        // Update checkboxes
        this.elements.settingsCheckboxes['draw-face'].checked = settings.drawFace;
        this.elements.settingsCheckboxes['draw-emotion'].checked = settings.drawEmotion;
        this.elements.settingsCheckboxes['draw-attention'].checked = settings.drawAttention;
        
        // Update slider and select
        this.elements.sensitivitySlider.value = settings.sensitivity;
        this.elements.frequencySelect.value = settings.frequency;
    }
    
    saveSettings() {
        const settings = {
            drawFace: this.elements.settingsCheckboxes['draw-face'].checked,
            drawEmotion: this.elements.settingsCheckboxes['draw-emotion'].checked,
            drawAttention: this.elements.settingsCheckboxes['draw-attention'].checked,
            sensitivity: parseInt(this.elements.sensitivitySlider.value),
            frequency: parseInt(this.elements.frequencySelect.value)
        };
        
        // Save to storage
        Storage.set('emotion_camera_settings', settings);
        
        // Apply to webcam detector
        if (window.EmotionDetector?.webcamDetector) {
            window.EmotionDetector.webcamDetector.updateConfig({
                drawFace: settings.drawFace,
                drawEmotion: settings.drawEmotion,
                drawAttention: settings.drawAttention,
                frameRate: settings.frequency
            });
        }
        
        // Update local state
        this.state.overlayEnabled = settings.drawFace || settings.drawEmotion || settings.drawAttention;
        
        this.closeSettings();
        this.updateUI();
        
        console.log('Camera settings saved:', settings);
    }
    
    resetSettings() {
        // Reset to defaults
        const defaults = {
            drawFace: true,
            drawEmotion: true,
            drawAttention: true,
            sensitivity: 5,
            frequency: 10
        };
        
        // Update UI
        this.elements.settingsCheckboxes['draw-face'].checked = defaults.drawFace;
        this.elements.settingsCheckboxes['draw-emotion'].checked = defaults.drawEmotion;
        this.elements.settingsCheckboxes['draw-attention'].checked = defaults.drawAttention;
        this.elements.sensitivitySlider.value = defaults.sensitivity;
        this.elements.frequencySelect.value = defaults.frequency;
        
        console.log('Camera settings reset to defaults');
    }
    
    showPrivacyInfo() {
        alert(
            'Privacy Information:\n\n' +
            '1. Camera Usage: The camera is used ONLY for real-time emotion detection.\n' +
            '2. Data Processing: All processing happens locally in your browser.\n' +
            '3. No Storage: No video or images are stored, recorded, or saved.\n' +
            '4. No Sharing: Data is never shared with third parties.\n' +
            '5. You Control: You can disable the camera anytime.\n\n' +
            'This system helps personalize your learning experience by understanding your emotional state.'
        );
    }
    
    disableCamera() {
        this.state.cameraEnabled = false;
        this.stopCamera();
        this.updateUI();
        
        // Also update the main emotion detector
        if (window.EmotionDetector) {
            window.EmotionDetector.disableWebcam();
        }
        
        alert('Camera has been disabled. You can re-enable it using the camera button.');
    }
    
    showCameraUnavailable() {
        const placeholder = this.elements.cameraPlaceholder;
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="placeholder-icon">🚫</div>
                <p class="placeholder-text">Camera Unavailable</p>
                <p style="font-size: 14px; opacity: 0.7; text-align: center;">
                    Please check camera permissions<br>or connect a webcam
                </p>
            `;
        }
        
        this.updateSourceStatus('facial', 'unavailable');
    }
    
    handleEmotionUpdate(data) {
        this.state.lastEmotionUpdate = Date.now();
        
        // Update emotion display
        if (this.elements.emotionName) {
            this.elements.emotionName.textContent = this.capitalizeFirstLetter(data.emotion);
        }
        
        if (this.elements.emotionIcon) {
            this.elements.emotionIcon.textContent = this.emotionIcons[data.emotion] || this.emotionIcons.neutral;
        }
        
        // Update confidence
        const confidencePercent = Math.round(data.confidence * 100);
        if (this.elements.confidenceFill) {
            this.elements.confidenceFill.style.width = `${confidencePercent}%`;
        }
        
        if (this.elements.confidenceValue) {
            this.elements.confidenceValue.textContent = `${confidencePercent}%`;
        }
        
        // Update source statuses
        if (data.sources) {
            data.sources.forEach(source => {
                this.updateSourceStatus(source, 'active');
            });
        }
    }
    
    handleAttentionUpdate(data) {
        this.state.lastAttentionUpdate = Date.now();
        
        // Update attention display
        const attentionPercent = Math.round(data.level * 100);
        if (this.elements.attentionFill) {
            this.elements.attentionFill.style.width = `${attentionPercent}%`;
        }
        
        if (this.elements.attentionValue) {
            this.elements.attentionValue.textContent = `${attentionPercent}%`;
        }
        
        // Update attention tip based on level
        if (this.elements.attentionTip) {
            if (data.level > 0.7) {
                this.elements.attentionTip.textContent = 'Great focus! Keep it up!';
            } else if (data.level > 0.4) {
                this.elements.attentionTip.textContent = 'Good focus. Try to minimize distractions.';
            } else {
                this.elements.attentionTip.textContent = 'Focus on the screen for better detection.';
            }
        }
    }
    
    handleFacialEmotion(data) {
        // Update facial source specifically
        this.updateSourceStatus('facial', 'active');
    }
    
    handleWebcamEmotion(data) {
        // Face detected
        if (this.elements.faceIndicator) {
            this.elements.faceIndicator.style.display = 'flex';
        }
    }
    
    handleWebcamAttention(data) {
        // Additional attention updates from webcam
    }
    
    handleFaceLost(data) {
        // Face lost
        if (this.elements.faceIndicator) {
            this.elements.faceIndicator.style.display = 'none';
        }
        
        this.updateSourceStatus('facial', 'inactive');
    }
    
    updateSourceStatus(sourceId, status) {
        const sourceItems = this.elements.sourcesList?.querySelectorAll('.source-item');
        if (!sourceItems) return;
        
        for (const item of sourceItems) {
            const sourceName = item.querySelector('.source-name')?.textContent;
            if (!sourceName) continue;
            
            // Map source names to IDs
            const sourceMap = {
                'Facial Analysis': 'facial',
                'Text Analysis': 'text',
                'Behavior': 'behavior',
                'Manual': 'manual'
            };
            
            if (sourceMap[sourceName] === sourceId) {
                const statusElement = item.querySelector('.source-status');
                if (statusElement) {
                    statusElement.textContent = this.capitalizeFirstLetter(status);
                    statusElement.className = `source-status ${status}`;
                }
                break;
            }
        }
    }
    
    updateUI() {
        // Update camera status
        if (this.elements.cameraStatus) {
            this.elements.cameraStatus.textContent = 
                `Camera: ${this.state.cameraEnabled ? 'On' : 'Off'}`;
        }
        
        // Update overlay status
        if (this.elements.overlayStatus) {
            this.elements.overlayStatus.textContent = 
                `Overlay: ${this.state.overlayEnabled ? 'On' : 'Off'}`;
        }
        
        // Update button states
        const updateButtonState = (button, enabled) => {
            if (button) {
                button.style.opacity = enabled ? '1' : '0.6';
                button.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
        };
        
        updateButtonState(this.elements.overlayToggle, this.state.cameraEnabled);
        
        // Update placeholder visibility
        if (this.elements.cameraPlaceholder && this.elements.cameraVideo) {
            this.elements.cameraPlaceholder.style.display = 
                this.state.cameraEnabled ? 'none' : 'flex';
            this.elements.cameraVideo.style.display = 
                this.state.cameraEnabled ? 'block' : 'none';
        }
    }
    
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    updateEmotionIntensity(emotion, intensity) {
        // Visual feedback for emotion intensity
        const icon = this.elements.emotionIcon;
        if (icon) {
            const baseSize = 48;
            const intensityScale = 0.5 + (intensity * 0.5);
            const newSize = baseSize * intensityScale;
            
            icon.style.fontSize = `${newSize}px`;
            icon.style.transform = `scale(${intensityScale})`;
            
            // Reset after animation
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `camera-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'absolute';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = '500';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        notification.style.animation = 'slideIn 0.3s ease';
        
        // Set background based on type
        const backgrounds = {
            'info': 'linear-gradient(135deg, #667eea, #764ba2)',
            'success': 'linear-gradient(135deg, #10b981, #34d399)',
            'warning': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            'error': 'linear-gradient(135deg, #ef4444, #f87171)'
        };
        
        notification.style.background = backgrounds[type] || backgrounds.info;
        
        // Add to container
        this.container.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Animation keyframes
    addAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes emotionPulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    destroy() {
        // Stop camera
        this.stopCamera();
        
        // Remove event listeners
        // (In a real implementation, you would properly remove all listeners)
        
        // Clear container
        this.container.innerHTML = '';
        
        console.log('Emotion Camera Component destroyed');
    }
}

// Auto-initialize if loaded as a module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionCameraComponent;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cameraElements = document.querySelectorAll('[data-component="emotion-camera"]');
    cameraElements.forEach(element => {
        new EmotionCameraComponent(element);
    });
});