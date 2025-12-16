// components/progress-bar/progress-bar.js

class ProgressBar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.options = {
            title: 'Progress',
            value: 0,
            maxValue: 100,
            showDetails: true,
            showBreakdown: false,
            showActions: false,
            variant: 'linear', // linear, circular
            size: 'medium', // small, medium, large
            theme: 'primary', // primary, success, warning, danger
            milestones: [],
            breakdown: [],
            onComplete: null,
            onChange: null,
            ...options
        };
        
        this.currentValue = this.options.value;
        this.isAnimating = false;
        this.isPaused = false;
        this.animationDuration = 1000; // 1 second
        this.animationStartTime = null;
        this.animationStartValue = 0;
        this.animationTargetValue = 0;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.updateProgress(this.currentValue, false);
        
        if (this.options.milestones.length > 0) {
            this.renderMilestones();
        }
        
        if (this.options.showBreakdown && this.options.breakdown.length > 0) {
            this.renderBreakdown();
        }
    }
    
    render() {
        const isCircular = this.options.variant === 'circular';
        
        if (isCircular) {
            this.container.innerHTML = `
                <div class="circular-progress">
                    <div class="circular-track"></div>
                    <div class="circular-fill" id="circularFill"></div>
                    <div class="circular-value" id="circularValue">0%</div>
                </div>
                <div class="progress-title" id="progressTitle">${this.options.title}</div>
                ${this.options.showDetails ? `
                    <div class="progress-details">
                        <div class="progress-label" id="progressLabel">Starting...</div>
                    </div>
                ` : ''}
            `;
            this.container.classList.add('circular');
        } else {
            this.container.innerHTML = `
                <div class="progress-header">
                    <div class="progress-title" id="progressTitle">${this.options.title}</div>
                    <div class="progress-value" id="progressValue">0%</div>
                </div>
                
                <div class="progress-track" id="progressTrack">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    <div class="progress-milestones" id="progressMilestones"></div>
                </div>
                
                ${this.options.showDetails ? `
                    <div class="progress-details">
                        <div class="progress-label" id="progressLabel">Starting...</div>
                        <div class="progress-time" id="progressTime">Estimated: --:--</div>
                    </div>
                ` : ''}
                
                ${this.options.showBreakdown ? `
                    <div class="progress-breakdown" id="progressBreakdown" style="display: none;">
                        <div class="breakdown-title">Progress Breakdown</div>
                        <div class="breakdown-items" id="breakdownItems"></div>
                    </div>
                ` : ''}
                
                ${this.options.showActions ? `
                    <div class="progress-actions" id="progressActions" style="display: none;">
                        <button class="btn btn-secondary btn-sm" id="pauseProgress">Pause</button>
                        <button class="btn btn-primary btn-sm" id="resumeProgress">Resume</button>
                        <button class="btn btn-outline btn-sm" id="resetProgress">Reset</button>
                    </div>
                ` : ''}
            `;
        }
        
        // Apply size and theme classes
        this.container.classList.add(this.options.size);
        this.container.classList.add(this.options.theme);
        
        // Store references to elements
        this.progressTitle = document.getElementById('progressTitle');
        this.progressValue = document.getElementById('progressValue');
        this.progressFill = document.getElementById('progressFill');
        this.progressLabel = document.getElementById('progressLabel');
        this.progressTime = document.getElementById('progressTime');
        this.progressBreakdown = document.getElementById('progressBreakdown');
        this.progressActions = document.getElementById('progressActions');
        this.breakdownItems = document.getElementById('breakdownItems');
        
        // Circular variant elements
        this.circularFill = document.getElementById('circularFill');
        this.circularValue = document.getElementById('circularValue');
    }
    
    setupEventListeners() {
        if (!this.options.showActions) return;
        
        const pauseBtn = document.getElementById('pauseProgress');
        const resumeBtn = document.getElementById('resumeProgress');
        const resetBtn = document.getElementById('resetProgress');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resume());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    updateProgress(value, animate = true) {
        // Clamp value between 0 and maxValue
        const clampedValue = Math.max(0, Math.min(value, this.options.maxValue));
        const percentage = (clampedValue / this.options.maxValue) * 100;
        
        if (animate) {
            this.animateToValue(clampedValue, percentage);
        } else {
            this.currentValue = clampedValue;
            this.updateDisplay(percentage);
        }
        
        // Check for milestone completion
        this.checkMilestones();
        
        // Check if complete
        if (clampedValue >= this.options.maxValue) {
            this.handleComplete();
        }
        
        // Call onChange callback
        if (this.options.onChange) {
            this.options.onChange(clampedValue, percentage);
        }
    }
    
    animateToValue(targetValue, targetPercentage) {
        this.animationStartValue = this.currentValue;
        this.animationTargetValue = targetValue;
        this.animationStartTime = Date.now();
        this.isAnimating = true;
        
        const animate = () => {
            if (!this.isAnimating || this.isPaused) return;
            
            const elapsed = Date.now() - this.animationStartTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = this.easeOutCubic(progress);
            const currentValue = this.animationStartValue + 
                (this.animationTargetValue - this.animationStartValue) * easedProgress;
            const currentPercentage = (currentValue / this.options.maxValue) * 100;
            
            this.currentValue = currentValue;
            this.updateDisplay(currentPercentage);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.currentValue = this.animationTargetValue;
                this.updateDisplay(targetPercentage);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    updateDisplay(percentage) {
        const roundedPercentage = Math.round(percentage);
        
        // Update linear progress bar
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        
        if (this.progressValue) {
            this.progressValue.textContent = `${roundedPercentage}%`;
        }
        
        // Update circular progress bar
        if (this.circularFill) {
            const circumference = 2 * Math.PI * 56; // Radius = 56px
            const offset = circumference - (percentage / 100) * circumference;
            this.circularFill.style.strokeDasharray = `${circumference} ${circumference}`;
            this.circularFill.style.strokeDashoffset = offset;
        }
        
        if (this.circularValue) {
            this.circularValue.textContent = `${roundedPercentage}%`;
        }
        
        // Update label with contextual messages
        if (this.progressLabel) {
            this.progressLabel.textContent = this.getProgressLabel(percentage);
        }
        
        // Update estimated time
        if (this.progressTime) {
            this.progressTime.textContent = this.getEstimatedTime(percentage);
        }
        
        // Update theme based on progress
        this.updateTheme(percentage);
    }
    
    getProgressLabel(percentage) {
        if (percentage >= 100) return 'Complete! 🎉';
        if (percentage >= 90) return 'Almost there!';
        if (percentage >= 75) return 'Great progress!';
        if (percentage >= 50) return 'Halfway there!';
        if (percentage >= 25) return 'Making progress';
        if (percentage > 0) return 'Getting started';
        return 'Not started';
    }
    
    getEstimatedTime(percentage) {
        if (percentage >= 100) return 'Completed';
        if (percentage === 0) return 'Estimated: --:--';
        
        const remainingPercentage = 100 - percentage;
        // Assuming average rate of 10% per minute for demo
        const estimatedMinutes = Math.round(remainingPercentage / 10);
        
        if (estimatedMinutes < 60) {
            return `Estimated: ${estimatedMinutes}m`;
        } else {
            const hours = Math.floor(estimatedMinutes / 60);
            const minutes = estimatedMinutes % 60;
            return `Estimated: ${hours}h ${minutes}m`;
        }
    }
    
    updateTheme(percentage) {
        // Remove all theme classes
        const themes = ['primary', 'success', 'warning', 'danger'];
        themes.forEach(theme => {
            this.container.classList.remove(theme);
        });
        
        // Add appropriate theme
        if (percentage >= 100) {
            this.container.classList.add('success');
            this.container.classList.add('completed');
        } else if (percentage >= 75) {
            this.container.classList.add('success');
        } else if (percentage >= 50) {
            this.container.classList.add('primary');
        } else if (percentage >= 25) {
            this.container.classList.add('warning');
        } else {
            this.container.classList.add('danger');
        }
    }
    
    renderMilestones() {
        const milestonesContainer = document.getElementById('progressMilestones');
        if (!milestonesContainer) return;
        
        milestonesContainer.innerHTML = '';
        
        this.options.milestones.forEach((milestone, index) => {
            const milestonePercentage = (milestone.value / this.options.maxValue) * 100;
            const isReached = this.currentValue >= milestone.value;
            
            const milestoneEl = document.createElement('div');
            milestoneEl.className = `milestone ${isReached ? 'reached' : ''}`;
            milestoneEl.style.left = `${milestonePercentage}%`;
            milestoneEl.innerHTML = `
                <div class="milestone-label">${milestone.label}</div>
            `;
            
            milestonesContainer.appendChild(milestoneEl);
        });
    }
    
    checkMilestones() {
        if (!this.options.milestones.length) return;
        
        this.options.milestones.forEach((milestone, index) => {
            if (this.currentValue >= milestone.value && !milestone.reached) {
                milestone.reached = true;
                this.triggerMilestoneReached(milestone);
            }
        });
        
        this.renderMilestones();
    }
    
    triggerMilestoneReached(milestone) {
        // Dispatch custom event
        const event = new CustomEvent('milestoneReached', {
            detail: {
                milestone,
                currentValue: this.currentValue,
                percentage: (this.currentValue / this.options.maxValue) * 100
            }
        });
        this.container.dispatchEvent(event);
        
        // Show notification
        if (window.headerManager) {
            window.headerManager.addNotification({
                type: 'achievement',
                title: 'Milestone Reached!',
                message: milestone.label,
                time: 'Just now',
                read: false
            });
        }
    }
    
    renderBreakdown() {
        if (!this.breakdownItems || !this.progressBreakdown) return;
        
        this.breakdownItems.innerHTML = '';
        this.progressBreakdown.style.display = 'block';
        
        this.options.breakdown.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `breakdown-item ${item.status}`;
            itemEl.innerHTML = `
                <div class="breakdown-item-label">${item.label}</div>
                <div class="breakdown-item-value">${item.value}%</div>
            `;
            this.breakdownItems.appendChild(itemEl);
        });
    }
    
    handleComplete() {
        // Add completed class
        this.container.classList.add('completed');
        
        // Call onComplete callback
        if (this.options.onComplete) {
            this.options.onComplete();
        }
        
        // Dispatch completion event
        const event = new CustomEvent('progressComplete', {
            detail: {
                value: this.currentValue,
                percentage: 100
            }
        });
        this.container.dispatchEvent(event);
    }
    
    // Public methods
    pause() {
        this.isPaused = true;
        if (this.progressActions) {
            this.progressActions.style.display = 'flex';
        }
    }
    
    resume() {
        this.isPaused = false;
        if (this.progressActions) {
            this.progressActions.style.display = 'none';
        }
        this.animateToValue(this.animationTargetValue, 
            (this.animationTargetValue / this.options.maxValue) * 100);
    }
    
    reset() {
        this.isAnimating = false;
        this.isPaused = false;
        this.updateProgress(0, true);
    }
    
    setTitle(title) {
        if (this.progressTitle) {
            this.progressTitle.textContent = title;
        }
    }
    
    setMaxValue(maxValue) {
        this.options.maxValue = maxValue;
        this.updateProgress(this.currentValue, false);
    }
    
    showBreakdown(show = true) {
        if (this.progressBreakdown) {
            this.progressBreakdown.style.display = show ? 'block' : 'none';
        }
    }
    
    showActions(show = true) {
        if (this.progressActions) {
            this.progressActions.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Cleanup
    destroy() {
        this.isAnimating = false;
        
        if (this.options.showActions) {
            const pauseBtn = document.getElementById('pauseProgress');
            const resumeBtn = document.getElementById('resumeProgress');
            const resetBtn = document.getElementById('resetProgress');
            
            if (pauseBtn) pauseBtn.removeEventListener('click', this.pause);
            if (resumeBtn) resumeBtn.removeEventListener('click', this.resume);
            if (resetBtn) resetBtn.removeEventListener('click', this.reset);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const progressBars = document.querySelectorAll('[data-progress-bar]');
    
    progressBars.forEach(container => {
        const options = {
            title: container.dataset.title || 'Progress',
            value: parseInt(container.dataset.value) || 0,
            maxValue: parseInt(container.dataset.maxValue) || 100,
            variant: container.dataset.variant || 'linear',
            size: container.dataset.size || 'medium',
            showDetails: container.dataset.showDetails !== 'false',
            showBreakdown: container.dataset.showBreakdown === 'true',
            showActions: container.dataset.showActions === 'true'
        };
        
        // Parse milestones if provided
        if (container.dataset.milestones) {
            try {
                options.milestones = JSON.parse(container.dataset.milestones);
            } catch (e) {
                console.error('Invalid milestones data:', e);
            }
        }
        
        // Parse breakdown if provided
        if (container.dataset.breakdown) {
            try {
                options.breakdown = JSON.parse(container.dataset.breakdown);
            } catch (e) {
                console.error('Invalid breakdown data:', e);
            }
        }
        
        window.progressBar = new ProgressBar(container.id, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressBar;
}