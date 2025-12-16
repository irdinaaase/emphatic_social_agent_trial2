// js/student/profile.js
class StudentProfile {
    constructor() {
        this.studentData = null;
        this.init();
    }
    
    init() {
        if (!Auth.isLoggedIn() || !Auth.isStudent()) {
            window.location.href = '../../index.html';
            return;
        }
        
        this.loadProfileData();
        this.setupEventListeners();
    }
    
    async loadProfileData() {
        try {
            // Get current student data
            const student = Auth.getCurrentUser();
            if (!student) return;
            
            // Load profile data from storage
            const profileData = Storage.get('student_profile') || await this.getMockProfileData();
            
            this.studentData = {
                ...student,
                ...profileData
            };
            
            this.renderProfile();
            
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile data');
        }
    }
    
    async getMockProfileData() {
        return {
            grade: '5th Grade',
            school: 'Sunshine Elementary',
            teacher: 'Ms. Johnson',
            joinDate: '2024-01-01',
            totalHours: 42,
            completedModules: 15,
            achievements: 8,
            learningStyle: 'Visual',
            preferences: {
                readingSpeed: 'medium',
                difficulty: 'adaptive',
                feedbackLevel: 'detailed',
                notifications: true,
                soundEffects: true,
                darkMode: false
            },
            achievements: [
                {
                    id: 'ach1',
                    title: 'Math Master',
                    description: 'Completed 10 math modules',
                    date: '2024-01-15',
                    icon: '🧮'
                },
                {
                    id: 'ach2',
                    title: 'Reading Star',
                    description: 'Read 20,000 words',
                    date: '2024-01-10',
                    icon: '📚'
                }
            ],
            goals: [
                {
                    id: 'goal1',
                    title: 'Complete Science Course',
                    description: 'Finish all science modules',
                    progress: 65,
                    deadline: '2024-02-15'
                },
                {
                    id: 'goal2',
                    title: 'Improve Reading Speed',
                    description: 'Increase reading speed by 20%',
                    progress: 40,
                    deadline: '2024-02-28'
                }
            ],
            agentNotes: [
                {
                    id: 'note1',
                    date: '2024-01-14',
                    content: 'Student shows excellent progress in mathematics. Consider challenging with advanced fractions.'
                },
                {
                    id: 'note2',
                    date: '2024-01-12',
                    content: 'Noticed improved focus during morning sessions. Recommend continuing with current schedule.'
                }
            ]
        };
    }
    
    renderProfile() {
        const container = document.querySelector('.profile-container');
        if (!container || !this.studentData) return;
        
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-image">${this.studentData.avatar || '👨‍🎓'}</div>
                    <button class="avatar-upload" title="Change avatar">📷</button>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${this.studentData.name}</h1>
                    <div class="profile-grade">${this.studentData.grade}</div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${this.studentData.totalHours || 0}h</span>
                            <span class="stat-label">Learning Time</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.studentData.completedModules || 0}</span>
                            <span class="stat-label">Modules Completed</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.studentData.achievements || 0}</span>
                            <span class="stat-label">Achievements</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" id="editProfile">Edit Profile</button>
            </div>
            
            <div class="profile-grid">
                <!-- Personal Info -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Personal Information</h2>
                        <button class="btn btn-sm btn-secondary" id="editInfo">Edit</button>
                    </div>
                    <div class="info-grid" id="personalInfo">
                        <!-- Info will be populated by JS -->
                    </div>
                </div>
                
                <!-- Learning Preferences -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Learning Preferences</h2>
                        <button class="btn btn-sm btn-secondary" id="editPreferences">Edit</button>
                    </div>
                    <div class="preferences-grid" id="preferencesList">
                        <!-- Preferences will be populated by JS -->
                    </div>
                </div>
                
                <!-- Recent Achievements -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Achievements</h2>
                        <a href="achievements.html" class="btn btn-sm btn-secondary">View All</a>
                    </div>
                    <div class="achievements-list" id="achievementsList">
                        <!-- Achievements will be populated by JS -->
                    </div>
                </div>
                
                <!-- Learning Goals -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Learning Goals</h2>
                        <button class="btn btn-sm btn-secondary" id="addGoal">Add Goal</button>
                    </div>
                    <div class="goals-list" id="goalsList">
                        <!-- Goals will be populated by JS -->
                    </div>
                </div>
                
                <!-- Agent Notes -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Agent Notes</h2>
                    </div>
                    <div class="notes-list" id="agentNotes">
                        <!-- Notes will be populated by JS -->
                    </div>
                </div>
                
                <!-- Learning Statistics -->
                <div class="profile-section">
                    <div class="section-header">
                        <h2 class="section-title">Learning Statistics</h2>
                    </div>
                    <div class="stats-chart" id="statsChart">
                        <canvas id="learningChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Populate all sections
        this.renderPersonalInfo();
        this.renderPreferences();
        this.renderAchievements();
        this.renderGoals();
        this.renderAgentNotes();
        this.setupChart();
        this.setupEventHandlers();
    }
    
    renderPersonalInfo() {
        const container = document.getElementById('personalInfo');
        if (!container || !this.studentData) return;
        
        const infoFields = [
            { label: 'Email', value: this.studentData.email },
            { label: 'Grade', value: this.studentData.grade },
            { label: 'School', value: this.studentData.school || 'Not specified' },
            { label: 'Teacher', value: this.studentData.teacher || 'Not assigned' },
            { label: 'Member Since', value: Utils.formatDate(this.studentData.joinDate, 'short') },
            { label: 'Learning Style', value: this.studentData.learningStyle || 'Adaptive' }
        ];
        
        container.innerHTML = infoFields.map(field => `
            <div class="info-item">
                <span class="info-label">${field.label}</span>
                <span class="info-value">${field.value}</span>
            </div>
        `).join('');
    }
    
    renderPreferences() {
        const container = document.getElementById('preferencesList');
        if (!container || !this.studentData.preferences) return;
        
        const preferences = [
            { icon: '📖', name: 'Reading Speed', value: this.studentData.preferences.readingSpeed },
            { icon: '📊', name: 'Difficulty', value: this.studentData.preferences.difficulty },
            { icon: '💬', name: 'Feedback', value: this.studentData.preferences.feedbackLevel },
            { icon: '🔔', name: 'Notifications', value: this.studentData.preferences.notifications ? 'On' : 'Off' },
            { icon: '🎵', name: 'Sounds', value: this.studentData.preferences.soundEffects ? 'On' : 'Off' },
            { icon: '🌙', name: 'Theme', value: this.studentData.preferences.darkMode ? 'Dark' : 'Light' }
        ];
        
        container.innerHTML = preferences.map(pref => `
            <div class="preference-item">
                <span class="preference-icon">${pref.icon}</span>
                <span class="preference-name">${pref.name}</span>
                <small>${pref.value}</small>
            </div>
        `).join('');
    }
    
    renderAchievements() {
        const container = document.getElementById('achievementsList');
        if (!container || !this.studentData.achievements) return;
        
        const achievements = this.studentData.achievements.slice(0, 3);
        
        if (achievements.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No achievements yet</p>';
            return;
        }
        
        container.innerHTML = achievements.map(ach => `
            <div class="achievement-item">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-content">
                    <div class="achievement-title">${ach.title}</div>
                    <div class="achievement-description">${ach.description}</div>
                    <div class="achievement-date">${Utils.formatDate(ach.date, 'short')}</div>
                </div>
            </div>
        `).join('');
    }
    
    renderGoals() {
        const container = document.getElementById('goalsList');
        if (!container || !this.studentData.goals) return;
        
        const goals = this.studentData.goals.slice(0, 3);
        
        if (goals.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No goals set</p>';
            return;
        }
        
        container.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-progress">${goal.progress}%</div>
                </div>
                <div class="goal-description">${goal.description}</div>
                <div class="goal-bar">
                    <div class="goal-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-meta">
                    <small>Target: ${Utils.formatDate(goal.deadline, 'short')}</small>
                </div>
            </div>
        `).join('');
    }
    
    renderAgentNotes() {
        const container = document.getElementById('agentNotes');
        if (!container || !this.studentData.agentNotes) return;
        
        const notes = this.studentData.agentNotes.slice(0, 3);
        
        if (notes.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No notes from your agent yet</p>';
            return;
        }
        
        container.innerHTML = notes.map(note => `
            <div class="note-item">
                <div class="note-date">${Utils.formatDate(note.date, 'datetime')}</div>
                <div class="note-content">${note.content}</div>
            </div>
        `).join('');
    }
    
    setupChart() {
        const canvas = document.getElementById('learningChart');
        if (!canvas || typeof Chart === 'undefined') return;
        
        const ctx = canvas.getContext('2d');
        
        // Mock data for learning statistics
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Focus Level',
                    data: [85, 78, 92, 88, 76, 65, 90],
                    borderColor: 'rgb(76, 201, 240)',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Engagement',
                    data: [78, 82, 85, 79, 88, 72, 86],
                    borderColor: 'rgb(67, 97, 238)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4
                }
            ]
        };
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100
                    }
                }
            }
        });
    }
    
    setupEventListeners() {
        // Setup will be called after render
    }
    
    setupEventHandlers() {
        // Edit Profile button
        const editProfileBtn = document.getElementById('editProfile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        // Edit Info button
        const editInfoBtn = document.getElementById('editInfo');
        if (editInfoBtn) {
            editInfoBtn.addEventListener('click', () => this.showEditInfoModal());
        }
        
        // Edit Preferences button
        const editPrefsBtn = document.getElementById('editPreferences');
        if (editPrefsBtn) {
            editPrefsBtn.addEventListener('click', () => this.showEditPreferencesModal());
        }
        
        // Add Goal button
        const addGoalBtn = document.getElementById('addGoal');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }
        
        // Avatar upload
        const avatarUpload = document.querySelector('.avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('click', () => this.showAvatarUpload());
        }
    }
    
    showEditProfileModal() {
        const modalContent = `
            <form class="edit-form" id="editProfileForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editName">Full Name</label>
                        <input type="text" id="editName" class="form-control" 
                               value="${this.studentData.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editGrade">Grade Level</label>
                        <select id="editGrade" class="select-control">
                            <option ${this.studentData.grade === '3rd Grade' ? 'selected' : ''}>3rd Grade</option>
                            <option ${this.studentData.grade === '4th Grade' ? 'selected' : ''}>4th Grade</option>
                            <option ${this.studentData.grade === '5th Grade' ? 'selected' : ''}>5th Grade</option>
                            <option ${this.studentData.grade === '6th Grade' ? 'selected' : ''}>6th Grade</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editSchool">School</label>
                    <input type="text" id="editSchool" class="form-control" 
                           value="${this.studentData.school || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editLearningStyle">Learning Style</label>
                    <select id="editLearningStyle" class="select-control">
                        <option ${this.studentData.learningStyle === 'Visual' ? 'selected' : ''}>Visual</option>
                        <option ${this.studentData.learningStyle === 'Auditory' ? 'selected' : ''}>Auditory</option>
                        <option ${this.studentData.learningStyle === 'Kinesthetic' ? 'selected' : ''}>Kinesthetic</option>
                        <option ${this.studentData.learningStyle === 'Adaptive' ? 'selected' : ''}>Adaptive</option>
                    </select>
                </div>
            </form>
        `;
        
        this.showModal({
            title: 'Edit Profile',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="saveProfile">Save Changes</button>
                <button class="btn btn-secondary" id="cancelEdit">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('saveProfile').addEventListener('click', () => {
                    this.saveProfileChanges();
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelEdit').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    saveProfileChanges() {
        // Update student data
        this.studentData.name = document.getElementById('editName').value;
        this.studentData.grade = document.getElementById('editGrade').value;
        this.studentData.school = document.getElementById('editSchool').value;
        this.studentData.learningStyle = document.getElementById('editLearningStyle').value;
        
        // Save to storage
        Storage.set('student_profile', this.studentData);
        
        // Update Auth user data
        Auth.updateUser({ name: this.studentData.name });
        
        // Re-render profile
        this.renderProfile();
        
        Utils.createNotification('Profile updated successfully', 'success');
    }
    
    showEditInfoModal() {
        // Similar to edit profile but for personal info only
        const modalContent = `
            <p>Edit personal information</p>
        `;
        
        this.showModal({
            title: 'Edit Personal Information',
            content: modalContent
        });
    }
    
    showEditPreferencesModal() {
        const prefs = this.studentData.preferences;
        const modalContent = `
            <form class="edit-form" id="editPrefsForm">
                <div class="form-group">
                    <label for="prefReadingSpeed">Reading Speed</label>
                    <select id="prefReadingSpeed" class="select-control">
                        <option value="slow" ${prefs.readingSpeed === 'slow' ? 'selected' : ''}>Slow</option>
                        <option value="medium" ${prefs.readingSpeed === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="fast" ${prefs.readingSpeed === 'fast' ? 'selected' : ''}>Fast</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="prefDifficulty">Difficulty Level</label>
                    <select id="prefDifficulty" class="select-control">
                        <option value="easy" ${prefs.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${prefs.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${prefs.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                        <option value="adaptive" ${prefs.difficulty === 'adaptive' ? 'selected' : ''}>Adaptive</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="prefFeedback">Feedback Level</label>
                    <select id="prefFeedback" class="select-control">
                        <option value="minimal" ${prefs.feedbackLevel === 'minimal' ? 'selected' : ''}>Minimal</option>
                        <option value="normal" ${prefs.feedbackLevel === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="detailed" ${prefs.feedbackLevel === 'detailed' ? 'selected' : ''}>Detailed</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="prefNotifications" ${prefs.notifications ? 'checked' : ''}>
                        Enable Notifications
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="prefSounds" ${prefs.soundEffects ? 'checked' : ''}>
                        Enable Sound Effects
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="prefDarkMode" ${prefs.darkMode ? 'checked' : ''}>
                        Dark Mode
                    </label>
                </div>
            </form>
        `;
        
        this.showModal({
            title: 'Edit Learning Preferences',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="savePrefs">Save Preferences</button>
                <button class="btn btn-secondary" id="cancelPrefs">Cancel</button>
            `,
            onShow: () => {
                document.getElementById('savePrefs').addEventListener('click', () => {
                    this.savePreferences();
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelPrefs').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    savePreferences() {
        this.studentData.preferences = {
            readingSpeed: document.getElementById('prefReadingSpeed').value,
            difficulty: document.getElementById('prefDifficulty').value,
            feedbackLevel: document.getElementById('prefFeedback').value,
            notifications: document.getElementById('prefNotifications').checked,
            soundEffects: document.getElementById('prefSounds').checked,
            darkMode: document.getElementById('prefDarkMode').checked
        };
        
        Storage.set('student_profile', this.studentData);
        this.renderPreferences();
        
        Utils.createNotification('Preferences updated successfully', 'success');
    }
    
    showAddGoalModal() {
        const modalContent = `
            <form class="edit-form" id="addGoalForm">
                <div class="form-group">
                    <label for="goalTitle">Goal Title</label>
                    <input type="text" id="goalTitle" class="form-control" 
                           placeholder="e.g., Complete Science Course" required>
                </div>
                
                <div class="form-group">
                    <label for="goalDescription">Description</label>
                    <textarea id="goalDescription" class="form-control" rows="3"
                              placeholder="Describe your goal..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="goalProgress">Current Progress (%)</label>
                        <input type="range" id="goalProgress" class="form-control" min="0" max="100" value="0">
                        <span id="progressValue">0%</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="goalDeadline">Target Date</label>
                        <input type="date" id="goalDeadline" class="form-control" 
                               min="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
            </form>
        `;
        
        this.showModal({
            title: 'Add Learning Goal',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="saveGoal">Add Goal</button>
                <button class="btn btn-secondary" id="cancelGoal">Cancel</button>
            `,
            onShow: () => {
                const progressSlider = document.getElementById('goalProgress');
                const progressValue = document.getElementById('progressValue');
                
                progressSlider.addEventListener('input', () => {
                    progressValue.textContent = `${progressSlider.value}%`;
                });
                
                document.getElementById('saveGoal').addEventListener('click', () => {
                    this.addNewGoal();
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelGoal').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    addNewGoal() {
        const newGoal = {
            id: Utils.generateId('goal'),
            title: document.getElementById('goalTitle').value,
            description: document.getElementById('goalDescription').value,
            progress: parseInt(document.getElementById('goalProgress').value),
            deadline: document.getElementById('goalDeadline').value || null,
            created: new Date().toISOString()
        };
        
        if (!this.studentData.goals) {
            this.studentData.goals = [];
        }
        
        this.studentData.goals.unshift(newGoal);
        Storage.set('student_profile', this.studentData);
        this.renderGoals();
        
        Utils.createNotification('New goal added successfully', 'success');
    }
    
    showAvatarUpload() {
        const modalContent = `
            <div class="avatar-upload-modal">
                <p>Choose an avatar:</p>
                <div class="avatar-grid">
                    ${['👨‍🎓', '👩‍🎓', '🧑‍🎓', '👦', '👧', '🧑', '🤖', '🐱', '🐶', '🐼'].map(avatar => `
                        <div class="avatar-option" data-avatar="${avatar}">
                            <div class="avatar-preview">${avatar}</div>
                        </div>
                    `).join('')}
                </div>
                <p class="text-sm text-secondary">Or upload your own image</p>
                <input type="file" id="avatarFile" accept="image/*" class="form-control">
            </div>
        `;
        
        this.showModal({
            title: 'Change Avatar',
            content: modalContent,
            actions: `
                <button class="btn btn-primary" id="saveAvatar">Save Avatar</button>
                <button class="btn btn-secondary" id="cancelAvatar">Cancel</button>
            `,
            onShow: () => {
                const avatarOptions = document.querySelectorAll('.avatar-option');
                let selectedAvatar = this.studentData.avatar || '👨‍🎓';
                
                avatarOptions.forEach(option => {
                    if (option.dataset.avatar === selectedAvatar) {
                        option.classList.add('selected');
                    }
                    
                    option.addEventListener('click', () => {
                        avatarOptions.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                        selectedAvatar = option.dataset.avatar;
                    });
                });
                
                document.getElementById('saveAvatar').addEventListener('click', () => {
                    this.updateAvatar(selectedAvatar);
                    document.querySelector('.modal').remove();
                });
                
                document.getElementById('cancelAvatar').addEventListener('click', () => {
                    document.querySelector('.modal').remove();
                });
            }
        });
    }
    
    updateAvatar(avatar) {
        this.studentData.avatar = avatar;
        Storage.set('student_profile', this.studentData);
        
        // Update in Auth
        Auth.updateUser({ avatar });
        
        // Re-render profile
        this.renderProfile();
        
        Utils.createNotification('Avatar updated successfully', 'success');
    }
    
    showModal(options) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${options.title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${options.content}
                    </div>
                    ${options.actions ? `
                    <div class="modal-footer">
                        ${options.actions}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.querySelector('.modal-overlay:last-child');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        if (options.onShow) {
            options.onShow();
        }
        
        return modal;
    }
    
    showError(message) {
        Utils.createNotification(message, 'error');
    }
}

// Initialize profile when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn() && Auth.isStudent()) {
        window.StudentProfile = new StudentProfile();
    }
});