// js/config.js
const Config = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3000/api',
    API_ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        
        // Student
        STUDENT_PROGRESS: '/student/progress',
        STUDENT_LESSONS: '/student/lessons',
        STUDENT_ACHIEVEMENTS: '/student/achievements',
        
        // Teacher
        TEACHER_STUDENTS: '/teacher/students',
        TEACHER_CLASSES: '/teacher/classes',
        TEACHER_ALERTS: '/teacher/alerts',
        TEACHER_ANALYTICS: '/teacher/analytics',
        
        // AI Agent
        AGENT_CHAT: '/agent/chat',
        AGENT_ANALYSIS: '/agent/analysis',
        AGENT_INTERVENTION: '/agent/intervention'
    },
    
    // Mock Data Settings
    MOCK_DATA: {
        ENABLED: true,
        DELAY: 500, // Mock API delay in ms
        ERROR_RATE: 0.1 // 10% chance of mock error
    },
    
    // AI Agent Configuration
    AI_AGENT: {
        NAME: 'Empathetic Learning Companion',
        AVATAR: '🤖',
        RESPONSE_DELAY: 1000, // ms delay for responses
        EMOTION_DETECTION_ENABLED: true,
        FOCUS_MONITORING_ENABLED: true,
        INTERVENTION_THRESHOLDS: {
            FRUSTRATION: 0.7,
            CONFUSION: 0.6,
            BOREDOM: 0.8,
            INACTIVITY: 300 // seconds
        }
    },
    
    // Student Settings
    STUDENT: {
        DEFAULT_DISABILITY_PROFILES: {
            DYSLEXIA: {
                fontFamily: 'OpenDyslexic, Arial',
                fontSizeMultiplier: 1.2,
                lineHeight: 1.8,
                letterSpacing: '0.1em'
            },
            ADHD: {
                reduceAnimations: true,
                focusTimers: true,
                chunkContent: true,
                breakFrequency: 15 // minutes
            },
            AUTISM: {
                predictableNavigation: true,
                clearInstructions: true,
                sensoryFriendly: true,
                socialCues: false
            },
            VISUAL_IMPAIRMENT: {
                highContrast: true,
                largeText: true,
                screenReaderCompatible: true
            }
        },
        LEARNING_PREFERENCES: {
            DEFAULT_DIFFICULTY: 'medium',
            PREFERRED_MODALITY: 'visual', // visual, auditory, kinesthetic
            PACE: 'self-paced' // self-paced, guided, timed
        }
    },
    
    // Teacher Settings
    TEACHER: {
        ALERT_LEVELS: {
            HIGH: {
                color: '#ef4444',
                icon: '🔴',
                responseTime: 5 // minutes
            },
            MEDIUM: {
                color: '#f59e0b',
                icon: '🟡',
                responseTime: 30 // minutes
            },
            LOW: {
                color: '#3b82f6',
                icon: '🔵',
                responseTime: 120 // minutes
            }
        },
        MONITORING: {
            UPDATE_INTERVAL: 30000, // ms
            SESSION_TIMEOUT: 300000, // ms (5 minutes)
            FOCUS_THRESHOLD: 0.3
        }
    },
    
    // UI Configuration
    UI: {
        THEMES: {
            LIGHT: {
                primary: '#4361ee',
                secondary: '#7209b7',
                background: '#f8f9fa',
                surface: '#ffffff',
                text: '#1f2937'
            },
            DARK: {
                primary: '#4cc9f0',
                secondary: '#f72585',
                background: '#1a1a1a',
                surface: '#2d2d2d',
                text: '#f3f4f6'
            },
            HIGH_CONTRAST: {
                primary: '#0000ff',
                secondary: '#ff00ff',
                background: '#ffffff',
                surface: '#ffffff',
                text: '#000000'
            }
        },
        ANIMATIONS: {
            ENABLED: true,
            DURATION: 300,
            PREFERS_REDUCED_MOTION: false
        },
        BREAKPOINTS: {
            MOBILE: 640,
            TABLET: 768,
            DESKTOP: 1024,
            WIDE: 1280
        }
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'empathic_learning_token',
        USER_DATA: 'empathic_learning_user',
        ACCESSIBILITY_PREFS: 'empathic_learning_accessibility',
        THEME: 'empathic_learning_theme',
        FONT_SIZE: 'empathic_learning_font_size',
        LEARNING_PROGRESS: 'empathic_learning_progress'
    },
    
    // Feature Flags
    FEATURES: {
        AI_AGENT: true,
        REAL_TIME_MONITORING: true,
        OFFLINE_MODE: true,
        PROGRESS_TRACKING: true,
        ACCESSIBILITY_TOOLS: true,
        TEACHER_ALERTS: true
    },
    
    // Localization
    LOCALIZATION: {
        DEFAULT_LANGUAGE: 'en',
        SUPPORTED_LANGUAGES: ['en', 'es', 'fr'],
        RTL_LANGUAGES: ['ar', 'he']
    },
    
    // Version
    VERSION: '1.0.0',
    
    // Debug
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'error' // debug, info, warn, error
    }
};

// Make config globally available
window.Config = Config;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}

// Add to your config.js
const EmotionConfig = {
    enabled: true,
    webcam: {
        enabled: true,
        requirePermission: true,
        autoStart: false
    },
    textAnalysis: {
        enabled: true,
        monitorInputs: true
    },
    behaviorAnalysis: {
        enabled: true,
        monitorInteractions: true
    },
    fusion: {
        method: 'weighted_average',
        minConfidence: 0.3
    },
    privacy: {
        storeVideo: false,
        storeImages: false,
        dataRetention: 24 // hours
    }
};

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports.EmotionConfig = EmotionConfig;
}

// Make globally available
window.EmotionConfig = EmotionConfig;