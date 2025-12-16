// js/ai/privacy-manager.js
class PrivacyManager {
    static showWebcamConsent() {
        const hasConsented = Storage.get('webcam_consent_given', false);
        if (hasConsented) return Promise.resolve(true);
        
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'privacy-consent-modal';
            modal.innerHTML = `
                <div class="privacy-content">
                    <h3><i class="fas fa-shield-alt"></i> Webcam Privacy Notice</h3>
                    <div class="privacy-features">
                        <div class="feature">
                            <i class="fas fa-camera"></i>
                            <div>
                                <strong>Real-time Emotion Detection</strong>
                                <p>Your webcam analyzes facial expressions to detect emotions</p>
                            </div>
                        </div>
                        <div class="feature">
                            <i class="fas fa-brain"></i>
                            <div>
                                <strong>Focus Monitoring</strong>
                                <p>Tracks attention level to personalize learning experience</p>
                            </div>
                        </div>
                        <div class="feature">
                            <i class="fas fa-lock"></i>
                            <div>
                                <strong>Privacy First</strong>
                                <p>All processing happens locally - no video leaves your device</p>
                            </div>
                        </div>
                    </div>
                    <div class="privacy-controls">
                        <div class="control-option">
                            <label>
                                <input type="radio" name="privacy" value="full" checked>
                                <strong>Full Features</strong>
                                <p>Show webcam preview with emotion detection</p>
                            </label>
                        </div>
                        <div class="control-option">
                            <label>
                                <input type="radio" name="privacy" value="minimal">
                                <strong>Minimal View</strong>
                                <p>Hide preview but continue monitoring focus</p>
                            </label>
                        </div>
                        <div class="control-option">
                            <label>
                                <input type="radio" name="privacy" value="off">
                                <strong>Turn Off</strong>
                                <p>Disable webcam completely (basic monitoring only)</p>
                            </label>
                        </div>
                    </div>
                    <div class="privacy-actions">
                        <button class="btn btn-secondary" id="decline-webcam">Skip for Now</button>
                        <button class="btn btn-primary" id="accept-webcam">Accept & Continue</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('accept-webcam').addEventListener('click', () => {
                const selectedOption = document.querySelector('input[name="privacy"]:checked').value;
                const settings = {
                    webcam_consent_given: true,
                    webcam_mode: selectedOption,
                    webcam_preview_enabled: selectedOption === 'full',
                    always_monitor_focus: selectedOption !== 'off'
                };
                
                Object.entries(settings).forEach(([key, value]) => {
                    Storage.set(key, value);
                });
                
                modal.remove();
                resolve(selectedOption !== 'off');
            });
            
            document.getElementById('decline-webcam').addEventListener('click', () => {
                Storage.set('webcam_consent_given', true);
                Storage.set('webcam_mode', 'off');
                modal.remove();
                resolve(false);
            });
        });
    }
}

// Add CSS for privacy modal
const privacyStyles = `
    .privacy-consent-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    }
    
    .privacy-content {
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .privacy-content h3 {
        color: #4f46e5;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .privacy-features {
        margin-bottom: 20px;
    }
    
    .feature {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .feature i {
        font-size: 24px;
        color: #4f46e5;
        margin-top: 5px;
    }
    
    .privacy-controls {
        margin-bottom: 25px;
    }
    
    .control-option {
        margin-bottom: 10px;
        padding: 15px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .control-option:hover {
        border-color: #4f46e5;
        background: #f8f9fa;
    }
    
    .control-option input[type="radio"]:checked + strong {
        color: #4f46e5;
    }
    
    .privacy-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
`;

const styleEl = document.createElement('style');
styleEl.textContent = privacyStyles;
document.head.appendChild(styleEl);

window.PrivacyManager = PrivacyManager;