// js/setup/emotion-setup.js
/**
 * Emotion System Setup Script
 * Handles initialization and configuration
 */

class EmotionSystemSetup {
    static async initialize() {
        console.log('Setting up Emotion Detection System...');
        
        // Check browser compatibility
        if (!this.checkCompatibility()) {
            console.warn('Emotion detection not fully supported in this browser');
            return false;
        }
        
        // Check user preferences
        const userPrefs = Storage.get('user_preferences', {});
        if (userPrefs.disableEmotionTracking) {
            console.log('Emotion tracking disabled by user preference');
            return false;
        }
        
        // Load Human.js dynamically
        await this.loadHumanJS();
        
        // Initialize the emotion system
        window.EmotionSystem = new EmotionSystemIntegrator();
        
        // Request camera permission if needed
        if (window.EmotionConfig?.webcam?.enabled) {
            await this.requestCameraPermission();
        }
        
        console.log('Emotion Detection System setup complete');
        return true;
    }
    
    static checkCompatibility() {
        const requiredFeatures = [
            'Promise',
            'fetch',
            'MediaDevices',
            'getUserMedia',
            'requestAnimationFrame',
            'localStorage'
        ];
        
        for (const feature of requiredFeatures) {
            if (!window[feature]) {
                console.warn(`Missing required feature: ${feature}`);
                return false;
            }
        }
        
        return true;
    }
    
    static async loadHumanJS() {
        // Only load if not already loaded
        if (window.Human) {
            return true;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/human/dist/human.esm.js';
            script.type = 'module';
            script.onload = () => {
                console.log('Human.js loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Failed to load Human.js:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    
    static async requestCameraPermission() {
        try {
            // Check existing permission
            const permission = await navigator.permissions.query({ name: 'camera' });
            
            if (permission.state === 'granted') {
                Storage.set('camera_permission_granted', true);
                return true;
            }
            
            if (permission.state === 'denied') {
                console.log('Camera permission previously denied');
                return false;
            }
            
            // Show permission dialog
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            
            Storage.set('camera_permission_granted', true);
            return true;
            
        } catch (error) {
            console.log('Camera permission not granted:', error.message);
            Storage.set('camera_permission_granted', false);
            return false;
        }
    }
    
    static showPrivacyConsent() {
        // Show privacy consent modal on first visit
        const hasConsented = Storage.get('emotion_privacy_consent', false);
        
        if (!hasConsented) {
            // Create and show consent modal
            const modal = this.createConsentModal();
            document.body.appendChild(modal);
            
            return new Promise((resolve) => {
                modal.querySelector('[data-action="accept"]').addEventListener('click', () => {
                    Storage.set('emotion_privacy_consent', true);
                    document.body.removeChild(modal);
                    resolve(true);
                });
                
                modal.querySelector('[data-action="reject"]').addEventListener('click', () => {
                    Storage.set('emotion_privacy_consent', false);
                    Storage.set('user_preferences', { disableEmotionTracking: true });
                    document.body.removeChild(modal);
                    resolve(false);
                });
            });
        }
        
        return Promise.resolve(true);
    }
    
    static createConsentModal() {
        const modal = document.createElement('div');
        modal.className = 'privacy-consent-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Emotion Detection Privacy</h3>
                <p>To personalize your learning experience, we'd like to use:</p>
                <ul>
                    <li>📷 Camera for facial emotion detection (optional)</li>
                    <li>⌨️ Text analysis for understanding your responses</li>
                    <li>🖱️ Interaction patterns to detect confusion or boredom</li>
                </ul>
                <p><strong>Privacy Promise:</strong></p>
                <ul>
                    <li>No video or images are stored</li>
                    <li>All processing happens locally in your browser</li>
                    <li>You can disable this anytime in settings</li>
                </ul>
                <div class="modal-actions">
                    <button class="btn-secondary" data-action="reject">Skip Emotion Detection</button>
                    <button class="btn-primary" data-action="accept">I Understand & Continue</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .privacy-consent-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .privacy-consent-modal .modal-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .privacy-consent-modal h3 {
                margin-top: 0;
                color: #333;
            }
            .privacy-consent-modal ul {
                padding-left: 20px;
            }
            .privacy-consent-modal li {
                margin-bottom: 8px;
            }
            .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            .btn-primary, .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            .btn-primary {
                background: #4f46e5;
                color: white;
            }
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on student learning pages
    if (window.location.pathname.includes('learning.html') || 
        window.location.pathname.includes('monitoring.html')) {
        
        // Show privacy consent
        const consented = await EmotionSystemSetup.showPrivacyConsent();
        
        if (consented) {
            // Initialize emotion system
            await EmotionSystemSetup.initialize();
            
            // Start the system
            if (window.EmotionSystem) {
                window.EmotionSystem.startSystem();
            }
        }
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionSystemSetup;
}