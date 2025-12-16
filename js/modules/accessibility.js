// js/modules/accessibility.js
/**
 * Accessibility Module
 * Features to enhance accessibility for all users
 */

const Accessibility = {
    // Configuration
    config: {
        fontSize: 1,
        highContrast: false,
        reducedMotion: false,
        dyslexiaFriendly: false,
        textToSpeech: false,
        keyboardNavigation: true
    },
    
    // Initialize accessibility features
    init() {
        this.loadPreferences();
        this.setupEventListeners();
        this.enableKeyboardNavigation();
        this.setupScreenReader();
        console.log('Accessibility module initialized');
    },
    
    // Load user preferences from localStorage
    loadPreferences() {
        try {
            const saved = localStorage.getItem(Config.STORAGE_KEYS.ACCESSIBILITY_PREFS);
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
                this.applyPreferences();
            }
        } catch (error) {
            console.error('Error loading accessibility preferences:', error);
        }
    },
    
    // Save preferences to localStorage
    savePreferences() {
        try {
            localStorage.setItem(
                Config.STORAGE_KEYS.ACCESSIBILITY_PREFS,
                JSON.stringify(this.config)
            );
        } catch (error) {
            console.error('Error saving accessibility preferences:', error);
        }
    },
    
    // Apply all preferences
    applyPreferences() {
        this.applyFontSize();
        this.applyHighContrast();
        this.applyReducedMotion();
        this.applyDyslexiaFriendly();
        this.applyTextToSpeech();
    },
    
    // Font size adjustment
    applyFontSize() {
        const root = document.documentElement;
        root.style.setProperty('--font-size-multiplier', this.config.fontSize);
        
        // Update font size for all text elements
        document.querySelectorAll('.text-adjustable').forEach(element => {
            const baseSize = parseFloat(getComputedStyle(element).fontSize);
            element.style.fontSize = `${baseSize * this.config.fontSize}px`;
        });
    },
    
    // Increase font size
    increaseFontSize() {
        if (this.config.fontSize < 2) {
            this.config.fontSize += 0.1;
            this.applyFontSize();
            this.savePreferences();
            this.showNotification(`Font size increased to ${Math.round(this.config.fontSize * 100)}%`);
        }
    },
    
    // Decrease font size
    decreaseFontSize() {
        if (this.config.fontSize > 0.8) {
            this.config.fontSize -= 0.1;
            this.applyFontSize();
            this.savePreferences();
            this.showNotification(`Font size decreased to ${Math.round(this.config.fontSize * 100)}%`);
        }
    },
    
    // Reset font size
    resetFontSize() {
        this.config.fontSize = 1;
        this.applyFontSize();
        this.savePreferences();
        this.showNotification('Font size reset to default');
    },
    
    // High contrast mode
    applyHighContrast() {
        const body = document.body;
        if (this.config.highContrast) {
            body.classList.add('high-contrast');
            
            // Update CSS variables for high contrast
            document.documentElement.style.setProperty('--primary-color', '#000000');
            document.documentElement.style.setProperty('--text-primary', '#000000');
            document.documentElement.style.setProperty('--background', '#ffffff');
            document.documentElement.style.setProperty('--light-1', '#f0f0f0');
            
            // Add outlines to interactive elements
            document.querySelectorAll('a, button, input, [tabindex]').forEach(el => {
                el.style.outline = '2px solid #000000';
            });
        } else {
            body.classList.remove('high-contrast');
            
            // Reset CSS variables
            document.documentElement.style.removeProperty('--primary-color');
            document.documentElement.style.removeProperty('--text-primary');
            document.documentElement.style.removeProperty('--background');
            document.documentElement.style.removeProperty('--light-1');
            
            // Remove outlines
            document.querySelectorAll('a, button, input, [tabindex]').forEach(el => {
                el.style.outline = '';
            });
        }
    },
    
    // Toggle high contrast
    toggleHighContrast() {
        this.config.highContrast = !this.config.highContrast;
        this.applyHighContrast();
        this.savePreferences();
        this.showNotification(
            this.config.highContrast ? 
            'High contrast mode enabled' : 
            'High contrast mode disabled'
        );
    },
    
    // Reduced motion
    applyReducedMotion() {
        const root = document.documentElement;
        if (this.config.reducedMotion) {
            root.classList.add('reduced-motion');
            
            // Disable CSS animations
            const style = document.createElement('style');
            style.id = 'reduced-motion-styles';
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            root.classList.remove('reduced-motion');
            
            // Remove reduced motion styles
            const style = document.getElementById('reduced-motion-styles');
            if (style) style.remove();
        }
    },
    
    // Toggle reduced motion
    toggleReducedMotion() {
        this.config.reducedMotion = !this.config.reducedMotion;
        this.applyReducedMotion();
        this.savePreferences();
        this.showNotification(
            this.config.reducedMotion ?
            'Reduced motion enabled' :
            'Reduced motion disabled'
        );
    },
    
    // Dyslexia-friendly font
    applyDyslexiaFriendly() {
        const body = document.body;
        if (this.config.dyslexiaFriendly) {
            body.classList.add('dyslexia-friendly');
            
            // Apply dyslexia-friendly font
            document.documentElement.style.setProperty(
                '--font-family',
                '"OpenDyslexic", "Comic Sans MS", sans-serif'
            );
            
            // Increase line height and letter spacing
            document.documentElement.style.setProperty('--line-height', '1.8');
            document.documentElement.style.setProperty('--letter-spacing', '0.1em');
        } else {
            body.classList.remove('dyslexia-friendly');
            
            // Reset font styles
            document.documentElement.style.removeProperty('--font-family');
            document.documentElement.style.removeProperty('--line-height');
            document.documentElement.style.removeProperty('--letter-spacing');
        }
    },
    
    // Toggle dyslexia-friendly mode
    toggleDyslexiaFriendly() {
        this.config.dyslexiaFriendly = !this.config.dyslexiaFriendly;
        this.applyDyslexiaFriendly();
        this.savePreferences();
        this.showNotification(
            this.config.dyslexiaFriendly ?
            'Dyslexia-friendly mode enabled' :
            'Dyslexia-friendly mode disabled'
        );
    },
    
    // Text-to-speech
    applyTextToSpeech() {
        if (this.config.textToSpeech && 'speechSynthesis' in window) {
            this.setupTextToSpeech();
        } else if (!this.config.textToSpeech) {
            this.stopTextToSpeech();
        }
    },
    
    // Toggle text-to-speech
    toggleTextToSpeech() {
        this.config.textToSpeech = !this.config.textToSpeech;
        this.applyTextToSpeech();
        this.savePreferences();
        this.showNotification(
            this.config.textToSpeech ?
            'Text-to-speech enabled' :
            'Text-to-speech disabled'
        );
    },
    
    // Setup text-to-speech
    setupTextToSpeech() {
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported in this browser');
            this.config.textToSpeech = false;
            return;
        }
        
        // Stop any current speech
        this.stopTextToSpeech();
        
        // Add speak buttons to content
        this.addSpeakButtons();
        
        // Setup keyboard shortcut (Ctrl+Alt+S)
        document.addEventListener('keydown', this.handleTextToSpeechShortcut.bind(this));
    },
    
    // Add speak buttons to content
    addSpeakButtons() {
        // Add to headings
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            if (!heading.querySelector('.speak-button')) {
                const button = this.createSpeakButton(heading.textContent);
                heading.appendChild(button);
            }
        });
        
        // Add to paragraphs
        document.querySelectorAll('p').forEach(paragraph => {
            if (!paragraph.querySelector('.speak-button')) {
                const button = this.createSpeakButton(paragraph.textContent);
                paragraph.appendChild(button);
            }
        });
        
        // Add to important content
        document.querySelectorAll('[data-speakable]').forEach(element => {
            if (!element.querySelector('.speak-button')) {
                const button = this.createSpeakButton(element.textContent);
                element.appendChild(button);
            }
        });
    },
    
    // Create speak button
    createSpeakButton(text) {
        const button = document.createElement('button');
        button.className = 'speak-button';
        button.innerHTML = '🔊';
        button.title = 'Read aloud';
        button.setAttribute('aria-label', 'Read this text aloud');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.speakText(text);
        });
        
        return button;
    },
    
    // Speak text
    speakText(text) {
        if (!this.config.textToSpeech || !('speechSynthesis' in window)) return;
        
        // Stop any current speech
        this.stopTextToSpeech();
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        // Get available voices
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Prefer natural-sounding voices
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Natural') || 
                voice.name.includes('Google') ||
                voice.name.includes('Samantha')
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }
        
        // Speak
        speechSynthesis.speak(utterance);
        
        // Highlight speaking text
        this.highlightSpeakingText(text);
        
        // Show speaking indicator
        this.showSpeakingIndicator();
    },
    
    // Stop text-to-speech
    stopTextToSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.removeSpeakingIndicator();
            this.removeTextHighlight();
        }
    },
    
    // Highlight speaking text
    highlightSpeakingText(text) {
        // Find elements containing this text
        document.querySelectorAll('*').forEach(element => {
            if (element.textContent.includes(text)) {
                element.classList.add('speaking');
                
                // Remove highlight when done
                element.addEventListener('animationend', () => {
                    element.classList.remove('speaking');
                }, { once: true });
            }
        });
    },
    
    // Remove text highlight
    removeTextHighlight() {
        document.querySelectorAll('.speaking').forEach(element => {
            element.classList.remove('speaking');
        });
    },
    
    // Show speaking indicator
    showSpeakingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'speaking-indicator';
        indicator.innerHTML = `
            <div class="speaking-indicator-content">
                <span class="speaking-icon">🔊</span>
                <span class="speaking-text">Reading aloud...</span>
                <button class="speaking-stop">Stop</button>
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Stop button
        indicator.querySelector('.speaking-stop').addEventListener('click', () => {
            this.stopTextToSpeech();
        });
    },
    
    // Remove speaking indicator
    removeSpeakingIndicator() {
        const indicator = document.getElementById('speaking-indicator');
        if (indicator) {
            indicator.remove();
        }
    },
    
    // Handle text-to-speech keyboard shortcut
    handleTextToSpeechShortcut(event) {
        if (event.ctrlKey && event.altKey && event.key === 's') {
            event.preventDefault();
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                this.speakText(selectedText);
            }
        }
    },
    
    // Enable keyboard navigation
    enableKeyboardNavigation() {
        if (!this.config.keyboardNavigation) return;
        
        // Add focus indicators
        document.addEventListener('focusin', (event) => {
            if (event.target.matches('a, button, input, textarea, select, [tabindex]')) {
                event.target.classList.add('keyboard-focus');
            }
        });
        
        document.addEventListener('focusout', (event) => {
            event.target.classList.remove('keyboard-focus');
        });
        
        // Skip to main content link
        this.addSkipToContentLink();
        
        // Trap focus in modals
        this.setupFocusTrap();
    },
    
    // Add skip to content link
    addSkipToContentLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to main content';
        
        skipLink.addEventListener('click', (e) => {
            const target = document.getElementById('main-content');
            if (target) {
                e.preventDefault();
                target.setAttribute('tabindex', '-1');
                target.focus();
                setTimeout(() => {
                    target.removeAttribute('tabindex');
                }, 1000);
            }
        });
        
        // Insert at beginning of body
        document.body.insertBefore(skipLink, document.body.firstChild);
    },
    
    // Setup focus trap for modals
    setupFocusTrap() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && document.querySelector('.modal-open')) {
                this.trapFocus(event);
            }
        });
    },
    
    // Trap focus within modal
    trapFocus(event) {
        const modal = document.querySelector('.modal-open');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    },
    
    // Setup screen reader announcements
    setupScreenReader() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'screen-reader-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    },
    
    // Announce to screen readers
    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.getElementById('screen-reader-announcements');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = '';
            
            // Force a reflow for screen readers
            setTimeout(() => {
                liveRegion.textContent = message;
            }, 100);
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Focus management
        document.addEventListener('focus', this.handleFocus.bind(this), true);
        
        // Error handling for screen readers
        window.addEventListener('error', this.handleError.bind(this));
    },
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Accessibility menu (Alt+A)
        if (event.altKey && event.key === 'a') {
            event.preventDefault();
            this.showAccessibilityMenu();
        }
        
        // Increase font size (Ctrl+=)
        if (event.ctrlKey && event.key === '=') {
            event.preventDefault();
            this.increaseFontSize();
        }
        
        // Decrease font size (Ctrl+-)
        if (event.ctrlKey && event.key === '-') {
            event.preventDefault();
            this.decreaseFontSize();
        }
        
        // Reset font size (Ctrl+0)
        if (event.ctrlKey && event.key === '0') {
            event.preventDefault();
            this.resetFontSize();
        }
        
        // High contrast toggle (Alt+H)
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            this.toggleHighContrast();
        }
    },
    
    // Handle focus events
    handleFocus(event) {
        // Announce focus changes to screen readers
        const target = event.target;
        if (target.matches('a, button, input, [role="button"]')) {
            const label = target.getAttribute('aria-label') || 
                         target.textContent || 
                         target.getAttribute('placeholder') ||
                         target.getAttribute('title');
            
            if (label) {
                this.announceToScreenReader(label);
            }
        }
    },
    
    // Handle errors for screen readers
    handleError(event) {
        // Announce errors to screen readers
        this.announceToScreenReader('An error occurred. Please check the console for details.', 'assertive');
    },
    
    // Show accessibility menu
    showAccessibilityMenu() {
        const menuContent = `
            <div class="accessibility-menu">
                <h3>Accessibility Settings</h3>
                
                <div class="menu-section">
                    <h4>Text Size</h4>
                    <div class="text-size-controls">
                        <button class="btn btn-sm" onclick="Accessibility.decreaseFontSize()">A-</button>
                        <span>${Math.round(this.config.fontSize * 100)}%</span>
                        <button class="btn btn-sm" onclick="Accessibility.increaseFontSize()">A+</button>
                        <button class="btn btn-sm" onclick="Accessibility.resetFontSize()">Reset</button>
                    </div>
                </div>
                
                <div class="menu-section">
                    <h4>Display Options</h4>
                    <div class="toggle-group">
                        <label>
                            <input type="checkbox" ${this.config.highContrast ? 'checked' : ''} 
                                   onchange="Accessibility.toggleHighContrast()">
                            High Contrast Mode
                        </label>
                        <label>
                            <input type="checkbox" ${this.config.reducedMotion ? 'checked' : ''} 
                                   onchange="Accessibility.toggleReducedMotion()">
                            Reduced Motion
                        </label>
                        <label>
                            <input type="checkbox" ${this.config.dyslexiaFriendly ? 'checked' : ''} 
                                   onchange="Accessibility.toggleDyslexiaFriendly()">
                            Dyslexia-Friendly Font
                        </label>
                    </div>
                </div>
                
                <div class="menu-section">
                    <h4>Text-to-Speech</h4>
                    <div class="toggle-group">
                        <label>
                            <input type="checkbox" ${this.config.textToSpeech ? 'checked' : ''} 
                                   onchange="Accessibility.toggleTextToSpeech()">
                            Enable Text-to-Speech
                        </label>
                    </div>
                    <p class="menu-help">Press Ctrl+Alt+S to read selected text</p>
                </div>
                
                <div class="menu-section">
                    <h4>Keyboard Shortcuts</h4>
                    <ul class="shortcuts-list">
                        <li><kbd>Alt + A</kbd> - Open accessibility menu</li>
                        <li><kbd>Alt + H</kbd> - Toggle high contrast</li>
                        <li><kbd>Ctrl + +</kbd> - Increase text size</li>
                        <li><kbd>Ctrl + -</kbd> - Decrease text size</li>
                        <li><kbd>Ctrl + 0</kbd> - Reset text size</li>
                        <li><kbd>Tab</kbd> - Navigate between elements</li>
                        <li><kbd>Enter</kbd> - Activate buttons/links</li>
                    </ul>
                </div>
                
                <div class="menu-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-secondary" onclick="Accessibility.resetAll()">Reset All</button>
                </div>
            </div>
        `;
        
        Utils.showModal({
            title: 'Accessibility Settings',
            content: menuContent,
            size: 'medium'
        });
    },
    
    // Reset all accessibility settings
    resetAll() {
        this.config = {
            fontSize: 1,
            highContrast: false,
            reducedMotion: false,
            dyslexiaFriendly: false,
            textToSpeech: false,
            keyboardNavigation: true
        };
        
        this.applyPreferences();
        this.savePreferences();
        this.showNotification('All accessibility settings have been reset');
        
        // Close menu
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    },
    
    // Check if element is visible to screen readers
    isScreenReaderVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return !(
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            element.hasAttribute('aria-hidden') ||
            element.getAttribute('aria-hidden') === 'true' ||
            element.hidden
        );
    },
    
    // Add ARIA labels to interactive elements
    enhanceAriaLabels() {
        // Buttons without text
        document.querySelectorAll('button:not([aria-label]):empty').forEach(button => {
            const icon = button.querySelector('[class*="icon"]');
            if (icon) {
                const iconClass = Array.from(icon.classList)
                    .find(cls => cls.includes('icon') || cls.includes('fa-'));
                if (iconClass) {
                    const label = iconClass.replace('icon-', '').replace('fa-', '').replace(/-/g, ' ');
                    button.setAttribute('aria-label', Utils.capitalize(label));
                }
            }
        });
        
        // Images without alt text
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
                img.setAttribute('alt', 'Decorative image');
            }
        });
        
        // Form inputs without labels
        document.querySelectorAll('input:not([id]), select:not([id]), textarea:not([id])').forEach(input => {
            const id = Utils.generateId('input');
            input.id = id;
            
            // Try to find associated label
            const label = input.closest('label') || 
                         input.previousElementSibling?.tagName === 'LABEL' ? 
                         input.previousElementSibling : null;
            
            if (label && !label.getAttribute('for')) {
                label.setAttribute('for', id);
            } else if (!label) {
                // Create hidden label
                const hiddenLabel = document.createElement('label');
                hiddenLabel.className = 'sr-only';
                hiddenLabel.setAttribute('for', id);
                hiddenLabel.textContent = input.getAttribute('placeholder') || 'Input field';
                input.parentNode.insertBefore(hiddenLabel, input);
            }
        });
    },
    
    // Make element focusable
    makeFocusable(element) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    },
    
    // Remove focusability
    removeFocusable(element) {
        element.removeAttribute('tabindex');
    },
    
    // Show notification
    showNotification(message) {
        Utils.createNotification(message, 'info', 3000);
    }
};

// Initialize on DOM ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Accessibility.init();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Accessibility;
}