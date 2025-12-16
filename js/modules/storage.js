// js/modules/storage.js
class StorageModule {
    constructor() {
        this.prefix = 'empathic_learning_';
        this.init();
    }
    
    init() {
        // Check if localStorage is available
        this.checkLocalStorage();
        
        // Setup storage event listeners
        this.setupListeners();
    }
    
    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.isAvailable = true;
        } catch (error) {
            console.error('localStorage is not available:', error);
            this.isAvailable = false;
            this.fallbackStorage = {};
        }
    }
    
    // Generic storage methods
    set(key, value) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isAvailable) {
                localStorage.setItem(fullKey, JSON.stringify(value));
            } else {
                this.fallbackStorage[fullKey] = value;
            }
            
            this.emitStorageEvent(key, value);
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isAvailable) {
                const item = localStorage.getItem(fullKey);
                return item ? JSON.parse(item) : defaultValue;
            } else {
                return this.fallbackStorage[fullKey] || defaultValue;
            }
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isAvailable) {
                localStorage.removeItem(fullKey);
            } else {
                delete this.fallbackStorage[fullKey];
            }
            
            this.emitStorageEvent(key, null);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }
    
    clear() {
        try {
            if (this.isAvailable) {
                // Only clear items with our prefix
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
            } else {
                this.fallbackStorage = {};
            }
            
            this.emitStorageEvent('clear', null);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    // User data methods
    saveUserData(userData) {
        return this.set('user_data', userData);
    }
    
    getUserData() {
        return this.get('user_data');
    }
    
    clearUserData() {
        return this.remove('user_data');
    }
    
    // Progress tracking
    saveProgress(progressData) {
        const userId = this.getUserData()?.id;
        if (!userId) return false;
        
        const key = `progress_${userId}`;
        return this.set(key, progressData);
    }
    
    getProgress() {
        const userId = this.getUserData()?.id;
        if (!userId) return null;
        
        const key = `progress_${userId}`;
        return this.get(key, {});
    }
    
    updateProgress(lessonId, score) {
        const progress = this.getProgress();
        if (!progress) return false;
        
        progress[lessonId] = {
            score: score,
            completed: true,
            completedAt: new Date().toISOString(),
            attempts: (progress[lessonId]?.attempts || 0) + 1
        };
        
        return this.saveProgress(progress);
    }
    
    // Session management
    saveSession(sessionData) {
        const sessionId = `session_${Date.now()}`;
        const sessions = this.get('sessions', []);
        sessions.push({
            id: sessionId,
            ...sessionData,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 sessions
        if (sessions.length > 50) {
            sessions.splice(0, sessions.length - 50);
        }
        
        return this.set('sessions', sessions);
    }
    
    getSessions() {
        return this.get('sessions', []);
    }
    
    // Settings management
    saveSettings(settings) {
        return this.set('user_settings', settings);
    }
    
    getSettings() {
        const defaults = {
            theme: 'light',
            fontSize: 'medium',
            notifications: true,
            sound: true,
            autoSave: true
        };
        
        return { ...defaults, ...this.get('user_settings', {}) };
    }
    
    // AI Agent memory
    saveAgentMemory(memory) {
        const userId = this.getUserData()?.id;
        if (!userId) return false;
        
        const key = `agent_memory_${userId}`;
        return this.set(key, memory);
    }
    
    getAgentMemory() {
        const userId = this.getUserData()?.id;
        if (!userId) return null;
        
        const key = `agent_memory_${userId}`;
        return this.get(key, {
            conversationHistory: [],
            studentPreferences: {},
            interventionHistory: []
        });
    }
    
    addAgentConversation(message, response) {
        const memory = this.getAgentMemory();
        if (!memory) return false;
        
        memory.conversationHistory.push({
            timestamp: new Date().toISOString(),
            message: message,
            response: response
        });
        
        // Keep only last 100 conversations
        if (memory.conversationHistory.length > 100) {
            memory.conversationHistory.splice(0, memory.conversationHistory.length - 100);
        }
        
        return this.saveAgentMemory(memory);
    }
    
    // Cache management
    setCache(key, value, ttl = 3600000) { // 1 hour default
        const cacheData = {
            value: value,
            expires: Date.now() + ttl
        };
        
        return this.set(`cache_${key}`, cacheData);
    }
    
    getCache(key) {
        const cacheData = this.get(`cache_${key}`);
        
        if (!cacheData) return null;
        
        if (Date.now() > cacheData.expires) {
            this.remove(`cache_${key}`);
            return null;
        }
        
        return cacheData.value;
    }
    
    clearCache() {
        try {
            if (this.isAvailable) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix + 'cache_')) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
            } else {
                Object.keys(this.fallbackStorage).forEach(key => {
                    if (key.startsWith(this.prefix + 'cache_')) {
                        delete this.fallbackStorage[key];
                    }
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }
    
    // Export/Import
    exportData() {
        const exportData = {};
        
        try {
            if (this.isAvailable) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        exportData[key] = localStorage.getItem(key);
                    }
                }
            } else {
                Object.keys(this.fallbackStorage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        exportData[key] = JSON.stringify(this.fallbackStorage[key]);
                    }
                });
            }
            
            return {
                success: true,
                data: exportData,
                timestamp: new Date().toISOString(),
                version: Config.VERSION
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    importData(data) {
        try {
            Object.keys(data).forEach(key => {
                if (this.isAvailable) {
                    localStorage.setItem(key, data[key]);
                } else {
                    this.fallbackStorage[key] = JSON.parse(data[key]);
                }
            });
            
            this.emitStorageEvent('import', data);
            return { success: true };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Event handling
    setupListeners() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith(this.prefix)) {
                const key = event.key.substring(this.prefix.length);
                let value = null;
                
                try {
                    value = event.newValue ? JSON.parse(event.newValue) : null;
                } catch (error) {
                    console.error('Error parsing storage event:', error);
                }
                
                this.emitStorageEvent(key, value);
            }
        });
    }
    
    emitStorageEvent(key, value) {
        const event = new CustomEvent('storageChange', {
            detail: { key, value }
        });
        window.dispatchEvent(event);
    }
    
    // Utility methods
    getStorageSize() {
        if (!this.isAvailable) return 0;
        
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                total += key.length + (value ? value.length : 0);
            }
        }
        
        return total;
    }
    
    getStorageInfo() {
        const size = this.getStorageSize();
        
        return {
            isAvailable: this.isAvailable,
            totalSize: size,
            totalSizeMB: (size / 1024 / 1024).toFixed(2),
            itemCount: this.isAvailable ? 
                Array.from({ length: localStorage.length })
                    .filter((_, i) => localStorage.key(i).startsWith(this.prefix))
                    .length : 
                Object.keys(this.fallbackStorage).length
        };
    }
}

// Create global instance
window.Storage = new StorageModule();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageModule;
}