// components/agent-avatar/avatar.js

class AgentAvatar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.options = {
            size: 'medium', // small, medium, large
            showStatus: true,
            showMood: false,
            moodUpdateInterval: 30000, // 30 seconds
            ...options
        };
        
        this.currentMood = 'neutral';
        this.isSpeaking = false;
        this.isListening = false;
        this.isThinking = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        
        if (this.options.showMood) {
            this.startMoodUpdates();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="agent-avatar ${this.options.size}" id="agentAvatar">
                <div class="avatar-default" id="avatarDefault">
                    <span class="avatar-emoji">🤖</span>
                </div>
            </div>
            
            ${this.options.showStatus ? `
                <div class="agent-status" id="agentStatus">
                    <span class="status-indicator status-online"></span>
                    <span class="status-text">Online</span>
                </div>
            ` : ''}
            
            ${this.options.showMood ? `
                <div class="agent-mood" id="agentMood">
                    <span class="mood-label">Feeling:</span>
                    <span class="mood-value" id="moodValue">😐 Neutral</span>
                </div>
            ` : ''}
            
            <div class="avatar-loading" id="avatarLoading" style="display: none;">
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        this.avatarElement = document.getElementById('agentAvatar');
        this.avatarDefault = document.getElementById('avatarDefault');
        this.agentStatus = document.getElementById('agentStatus');
        this.agentMood = document.getElementById('agentMood');
        this.moodValue = document.getElementById('moodValue');
        this.avatarLoading = document.getElementById('avatarLoading');
    }
    
    setupEventListeners() {
        if (this.avatarElement) {
            this.avatarElement.addEventListener('click', () => this.handleAvatarClick());
        }
    }
    
    handleAvatarClick() {
        // Dispatch custom event
        const event = new CustomEvent('agentAvatarClick', {
            detail: {
                mood: this.currentMood,
                isSpeaking: this.isSpeaking,
                isListening: this.isListening
            }
        });
        this.container.dispatchEvent(event);
        
        // Add click animation
        this.avatarElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.avatarElement.style.transform = 'scale(1)';
        }, 150);
    }
    
    setMood(mood) {
        const moods = {
            'happy': { emoji: '😊', text: 'Happy' },
            'sad': { emoji: '😔', text: 'Sad' },
            'excited': { emoji: '🎉', text: 'Excited' },
            'thinking': { emoji: '🤔', text: 'Thinking' },
            'neutral': { emoji: '😐', text: 'Neutral' },
            'confused': { emoji: '😕', text: 'Confused' },
            'proud': { emoji: '😌', text: 'Proud' },
            'encouraging': { emoji: '👍', text: 'Encouraging' }
        };
        
        if (!moods[mood]) {
            console.warn(`Unknown mood: ${mood}`);
            return;
        }
        
        this.currentMood = mood;
        const moodData = moods[mood];
        
        // Update mood display
        if (this.moodValue) {
            this.moodValue.textContent = `${moodData.emoji} ${moodData.text}`;
        }
        
        // Update avatar expression
        this.updateExpression(mood);
    }
    
    updateExpression(expression) {
        // Remove all expression classes
        const expressions = ['happy', 'thinking', 'listening', 'speaking'];
        expressions.forEach(exp => {
            this.avatarElement.classList.remove(exp);
        });
        
        // Add current expression class
        this.avatarElement.classList.add(expression);
    }
    
    setSpeaking(speaking) {
        this.isSpeaking = speaking;
        
        if (speaking) {
            this.avatarElement.classList.add('speaking');
            this.avatarElement.classList.remove('listening');
            this.isListening = false;
        } else {
            this.avatarElement.classList.remove('speaking');
        }
    }
    
    setListening(listening) {
        this.isListening = listening;
        
        if (listening) {
            this.avatarElement.classList.add('listening');
            this.avatarElement.classList.remove('speaking');
            this.isSpeaking = false;
        } else {
            this.avatarElement.classList.remove('listening');
        }
    }
    
    setThinking(thinking) {
        this.isThinking = thinking;
        
        if (thinking) {
            this.avatarElement.classList.add('thinking');
            this.setMood('thinking');
        } else {
            this.avatarElement.classList.remove('thinking');
        }
    }
    
    showLoading() {
        if (this.avatarLoading) {
            this.avatarLoading.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.avatarLoading) {
            this.avatarLoading.style.display = 'none';
        }
    }
    
    setStatus(status) {
        if (!this.agentStatus) return;
        
        const statuses = {
            'online': { color: 'status-online', text: 'Online' },
            'away': { color: 'status-away', text: 'Away' },
            'busy': { color: 'status-busy', text: 'Busy' },
            'offline': { color: 'status-offline', text: 'Offline' }
        };
        
        const statusData = statuses[status] || statuses.online;
        const indicator = this.agentStatus.querySelector('.status-indicator');
        const text = this.agentStatus.querySelector('.status-text');
        
        if (indicator) {
            indicator.className = 'status-indicator ' + statusData.color;
        }
        if (text) {
            text.textContent = statusData.text;
        }
    }
    
    setSize(size) {
        const validSizes = ['small', 'medium', 'large'];
        if (!validSizes.includes(size)) {
            console.warn(`Invalid size: ${size}`);
            return;
        }
        
        this.options.size = size;
        this.avatarElement.className = `agent-avatar ${size}`;
        
        // Adjust emoji size
        const emojiSize = {
            'small': '1.75rem',
            'medium': '2.5rem',
            'large': '4.5rem'
        }[size];
        
        if (this.avatarDefault) {
            this.avatarDefault.style.fontSize = emojiSize;
        }
    }
    
    startMoodUpdates() {
        if (this.moodUpdateInterval) {
            clearInterval(this.moodUpdateInterval);
        }
        
        this.moodUpdateInterval = setInterval(() => {
            this.updateRandomMood();
        }, this.options.moodUpdateInterval);
    }
    
    stopMoodUpdates() {
        if (this.moodUpdateInterval) {
            clearInterval(this.moodUpdateInterval);
        }
    }
    
    updateRandomMood() {
        const moods = ['happy', 'neutral', 'thinking', 'excited', 'proud'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        this.setMood(randomMood);
    }
    
    // Public methods
    celebrate() {
        this.setMood('excited');
        this.avatarElement.style.animation = 'bounce 1s ease 3';
        
        setTimeout(() => {
            this.avatarElement.style.animation = '';
        }, 3000);
    }
    
    showConfusion() {
        this.setMood('confused');
        this.avatarElement.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            this.avatarElement.style.animation = '';
        }, 500);
    }
    
    encourage() {
        this.setMood('encouraging');
        this.avatarElement.style.animation = 'pulse 1s ease 2';
        
        setTimeout(() => {
            this.avatarElement.style.animation = '';
        }, 2000);
    }
    
    // Cleanup
    destroy() {
        this.stopMoodUpdates();
        
        if (this.avatarElement) {
            this.avatarElement.removeEventListener('click', this.handleAvatarClick);
        }
        
        if (this.moodUpdateInterval) {
            clearInterval(this.moodUpdateInterval);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const avatarContainers = document.querySelectorAll('[data-agent-avatar]');
    
    avatarContainers.forEach(container => {
        const options = {
            size: container.dataset.size || 'medium',
            showStatus: container.dataset.showStatus !== 'false',
            showMood: container.dataset.showMood === 'true'
        };
        
        window.agentAvatar = new AgentAvatar(container.id, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentAvatar;
}