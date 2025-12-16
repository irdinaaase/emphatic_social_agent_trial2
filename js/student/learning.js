// js/student/learning.js - CLEAN VERSION
class LearningHub {
    constructor() {
        this.modules = [];
        this.filteredModules = [];
        this.currentFilters = {
            subject: 'all',
            difficulty: 'all',
            status: 'all',
            category: 'all',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        if (!window.StudentApp || !window.StudentApp.isInitialized) {
            console.error('LearningHub requires StudentApp');
            return;
        }
        
        this.loadModules();
        this.setupEventListeners();
        this.setupTools();
        
        console.log('Learning hub initialized');
    }
    
    async loadModules() {
        try {
            // Load from student app first
            this.modules = window.StudentApp.getLessons() || [];
            
            // If no modules, load mock data
            if (this.modules.length === 0) {
                this.modules = await this.loadMockModules();
            }
            
            this.filteredModules = [...this.modules];
            this.renderModules();
            
        } catch (error) {
            console.error('Error loading modules:', error);
            this.modules = await this.loadMockModules();
            this.filteredModules = [...this.modules];
            this.renderModules();
        }
    }
    
    async loadMockModules() {
        return [
            {
                id: 'math-001',
                title: 'Introduction to Fractions',
                subject: 'math',
                difficulty: 'beginner',
                status: 'in-progress',
                progress: 80,
                description: 'Learn the basics of fractions and how to use them in everyday situations.',
                estimatedTime: 30,
                tags: ['fractions', 'basics', 'visual'],
                category: 'recommended',
                icon: '🧮'
            },
            {
                id: 'reading-001',
                title: 'Reading Comprehension Skills',
                subject: 'reading',
                difficulty: 'intermediate',
                status: 'completed',
                progress: 100,
                description: 'Improve your reading comprehension with interactive exercises and stories.',
                estimatedTime: 45,
                tags: ['comprehension', 'vocabulary', 'critical thinking'],
                category: 'popular',
                icon: '📚'
            },
            {
                id: 'science-001',
                title: 'The Solar System Explorer',
                subject: 'science',
                difficulty: 'beginner',
                status: 'in-progress',
                progress: 40,
                description: 'Take a journey through our solar system and learn about planets, stars, and space.',
                estimatedTime: 40,
                tags: ['space', 'planets', 'interactive'],
                category: 'new',
                icon: '🔭'
            }
        ];
    }
    
    setupEventListeners() {
        // Filter changes
        const filters = ['subject', 'difficulty', 'status'];
        filters.forEach(filter => {
            const element = document.getElementById(`${filter}-filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[filter] = e.target.value;
                    this.applyFilters();
                });
            }
        });
        
        // Search
        const searchInput = document.getElementById('search-modules');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilters.category = e.target.dataset.category;
                this.applyFilters();
            });
        });
    }
    
    setupTools() {
        // Setup tool click handlers
        document.querySelectorAll('.tool-item').forEach(tool => {
            tool.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                this.openTool(toolName);
            });
        });
        
        // Setup focus assistant tool click handlers
        document.querySelectorAll('.assistant-tip').forEach(tip => {
            tip.addEventListener('click', (e) => {
                const toolText = e.currentTarget.querySelector('strong').textContent;
                this.openToolFromAssistant(toolText);
            });
        });
    }
    
    applyFilters() {
        this.filteredModules = this.modules.filter(module => {
            // Subject filter
            if (this.currentFilters.subject !== 'all' && 
                module.subject !== this.currentFilters.subject) {
                return false;
            }
            
            // Difficulty filter
            if (this.currentFilters.difficulty !== 'all' && 
                module.difficulty !== this.currentFilters.difficulty) {
                return false;
            }
            
            // Status filter
            if (this.currentFilters.status !== 'all') {
                if (this.currentFilters.status === 'not-started' && module.progress > 0) {
                    return false;
                }
                if (this.currentFilters.status === 'in-progress' && 
                    (module.progress === 0 || module.progress === 100)) {
                    return false;
                }
                if (this.currentFilters.status === 'completed' && module.progress < 100) {
                    return false;
                }
            }
            
            // Category filter
            if (this.currentFilters.category !== 'all' && 
                module.category !== this.currentFilters.category) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    module.title,
                    module.description,
                    ...module.tags,
                    module.subject,
                    module.difficulty
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderModules();
    }
    
    renderModules() {
        const container = document.getElementById('modules-container');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;
        
        if (this.filteredModules.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = this.filteredModules.map(module => `
            <div class="learning-module" data-module-id="${module.id}">
                <div class="module-header">
                    <div class="module-icon">${module.icon}</div>
                    <h3 class="module-title">${module.title}</h3>
                    <div class="module-meta">
                        <span class="meta-subject">${this.formatSubject(module.subject)}</span>
                        <span class="meta-difficulty ${module.difficulty}">${module.difficulty}</span>
                        <span class="meta-time">${module.estimatedTime} min</span>
                    </div>
                </div>
                
                <div class="module-body">
                    <p class="module-description">${module.description}</p>
                    
                    <div class="module-progress">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${module.progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${module.progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="module-tags">
                        ${module.tags.map(tag => `<span class="module-tag">#${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="module-footer">
                    <div class="module-status">
                        <div class="status-indicator status-${module.status === 'completed' ? 'completed' : 
                            module.progress > 0 ? 'in-progress' : 'not-started'}"></div>
                        <span>${this.getStatusText(module)}</span>
                    </div>
                    <button class="btn ${module.progress === 0 ? 'btn-primary' : 'btn-secondary'}" 
                            data-action="start-module" 
                            data-module-id="${module.id}">
                        ${this.getActionButtonText(module)}
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to modules
        this.addModuleEventListeners();
    }
    
    addModuleEventListeners() {
        // Module click
        document.querySelectorAll('.learning-module').forEach(module => {
            module.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const moduleId = module.dataset.moduleId;
                    this.showModuleDetails(moduleId);
                }
            });
        });
        
        // Start module buttons
        document.querySelectorAll('[data-action="start-module"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const moduleId = btn.dataset.moduleId;
                this.startModule(moduleId);
            });
        });
    }
    
    formatSubject(subject) {
        const subjects = {
            'math': 'Mathematics',
            'reading': 'Reading',
            'writing': 'Writing',
            'science': 'Science',
            'social': 'Social Studies'
        };
        return subjects[subject] || subject;
    }
    
    getStatusText(module) {
        if (module.progress === 100) return 'Completed';
        if (module.progress > 0) return `${module.progress}% Complete`;
        return 'Not Started';
    }
    
    getActionButtonText(module) {
        if (module.progress === 100) return 'Review';
        if (module.progress > 0) return 'Continue';
        return 'Start Learning';
    }
    
    showModuleDetails(moduleId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module || !window.StudentApp) return;
        
        const modalContent = `
            <div class="module-details">
                <div class="details-header">
                    <div class="details-icon">${module.icon}</div>
                    <div class="details-title">
                        <h2>${module.title}</h2>
                        <div class="details-meta">
                            <span class="badge badge-primary">${this.formatSubject(module.subject)}</span>
                            <span class="badge badge-secondary">${module.difficulty}</span>
                            <span class="badge badge-info">${module.estimatedTime} min</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-body">
                    <div class="details-section">
                        <h3>Description</h3>
                        <p>${module.description}</p>
                    </div>
                    
                    <div class="details-section">
                        <h3>Learning Objectives</h3>
                        <ul class="objectives-list">
                            <li>Understand basic concepts and principles</li>
                            <li>Apply learning to solve problems</li>
                            <li>Develop skills and confidence</li>
                            <li>Achieve learning goals</li>
                        </ul>
                    </div>
                    
                    <div class="details-section">
                        <h3>Progress</h3>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Your Progress</span>
                                <span>${module.progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${module.progress}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="details-footer">
                    <button class="btn btn-primary btn-lg" id="start-from-details" data-module-id="${module.id}">
                        ${module.progress === 0 ? 'Start Learning' : 
                          module.progress === 100 ? 'Review Again' : 'Continue Learning'}
                    </button>
                </div>
            </div>
        `;
        
        window.StudentApp.showModal({
            title: 'Module Details',
            content: modalContent,
            showClose: true
        });
        
        // Add event listener
        setTimeout(() => {
            const startBtn = document.getElementById('start-from-details');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    this.startModule(module.id);
                    const modal = document.querySelector('.student-modal');
                    if (modal) modal.remove();
                });
            }
        }, 100);
    }
    
    startModule(moduleId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module || !window.StudentApp) return;
        
        // Record activity
        window.StudentApp.recordLearningActivity({
            type: 'module_start',
            moduleId: moduleId,
            title: `Started: ${module.title}`,
            description: 'Began working on a learning module'
        });
        
        // Update progress if not started
        if (module.progress === 0) {
            module.progress = 10;
            module.status = 'in-progress';
            
            // Show welcome message
            this.showNotification({
                title: 'Module Started!',
                message: `You've begun "${module.title}". Your learning companion is here to help!`,
                type: 'success'
            });
        }
        
        // Simulate module learning
        this.simulateModuleLearning(module);
    }
    
    simulateModuleLearning(module) {
        if (!window.StudentApp) return;
        
        const simulationContent = `
            <div class="learning-simulation">
                <div class="simulation-header">
                    <div class="simulation-icon">${module.icon}</div>
                    <div class="simulation-title">
                        <h3>${module.title}</h3>
                        <div class="simulation-progress">Progress: ${module.progress}%</div>
                    </div>
                </div>
                
                <div class="simulation-body">
                    <div class="lesson-content">
                        <h4>Introduction</h4>
                        <p>Welcome to the learning module! Let's begin with the basics.</p>
                        
                        <div class="interactive-element">
                            <p>Try this interactive question:</p>
                            <div class="question">
                                <p>What have you learned so far?</p>
                                <div class="answer-options">
                                    <button class="btn answer-option">Option A</button>
                                    <button class="btn answer-option">Option B</button>
                                    <button class="btn answer-option">Option C</button>
                                    <button class="btn answer-option">Option D</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="simulation-controls">
                        <div class="controls-left">
                            <button class="btn btn-secondary" id="request-help">
                                <span>🤖</span> Ask for Help
                            </button>
                        </div>
                        <div class="controls-right">
                            <button class="btn btn-primary" id="next-step">
                                Continue <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.StudentApp.showModal({
            title: 'Learning in Progress',
            content: simulationContent,
            showClose: true
        });
        
        // Setup interactions
        this.setupSimulation(module);
    }
    
    setupSimulation(module) {
        // Timer
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
        }, 1000);
        
        // Answer options
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const isCorrect = Math.random() > 0.3;
                
                if (isCorrect) {
                    e.target.classList.add('correct');
                    this.showNotification({
                        title: 'Correct!',
                        message: 'Great job! You understood the concept.',
                        type: 'success'
                    });
                    
                    // Update progress
                    module.progress = Math.min(100, module.progress + 20);
                    
                } else {
                    e.target.classList.add('incorrect');
                    this.showNotification({
                        title: 'Try Again',
                        message: 'That\'s not quite right. Would you like some help?',
                        type: 'warning'
                    });
                }
                
                // Disable all options
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.disabled = true;
                });
            });
        });
        
        // Request help button
        const helpBtn = document.getElementById('request-help');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showNotification({
                    title: 'Help Requested',
                    message: 'Your learning assistant will help you shortly.',
                    type: 'info'
                });
            });
        }
        
        // Next step button
        const nextBtn = document.getElementById('next-step');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(timerInterval);
                
                // Update progress
                if (module.progress < 100) {
                    module.progress = Math.min(100, module.progress + 30);
                    if (module.progress === 100) {
                        module.status = 'completed';
                    }
                }
                
                // Close modal
                const modal = document.querySelector('.student-modal');
                if (modal) modal.remove();
                
                // Show completion message
                if (module.progress === 100) {
                    this.showNotification({
                        title: 'Module Complete! 🎉',
                        message: `Congratulations! You've completed "${module.title}".`,
                        type: 'success'
                    });
                } else {
                    this.showNotification({
                        title: 'Progress Saved',
                        message: `You're now ${module.progress}% through "${module.title}". Keep going!`,
                        type: 'info'
                    });
                }
                
                // Refresh display
                this.renderModules();
            });
        }
        
        // Cleanup
        const modal = document.querySelector('.student-modal');
        if (modal) {
            const observer = new MutationObserver(() => {
                if (!document.body.contains(modal)) {
                    clearInterval(timerInterval);
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    openTool(toolName) {
        console.log(`Opening tool: ${toolName}`);
        
        // Simple tool implementation
        this.showNotification({
            title: 'Tool Opened',
            message: `${toolName} tool is now active.`,
            type: 'info'
        });
    }
    
    openToolFromAssistant(toolText) {
        console.log(`Opening tool from assistant: ${toolText}`);
        this.openTool(toolText);
    }
    
    showNotification(options) {
        if (window.StudentApp && window.StudentApp.showNotification) {
            window.StudentApp.showNotification(options);
        } else {
            console.log(`[Notification] ${options.title}: ${options.message}`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.Auth && window.Auth.isLoggedIn && window.Auth.isStudent()) {
        // Wait for StudentApp
        const checkDependencies = setInterval(() => {
            if (window.StudentApp && window.StudentApp.isInitialized) {
                clearInterval(checkDependencies);
                window.LearningHub = new LearningHub();
            }
        }, 100);
        
        // Timeout
        setTimeout(() => {
            clearInterval(checkDependencies);
            if (!window.LearningHub) {
                console.error('Failed to initialize LearningHub');
            }
        }, 5000);
    }
});