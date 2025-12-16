// js/shared/messaging.js
/**
 * Messaging System
 * Handles real-time messaging between students, teachers, and agents
 */

class MessagingSystem {
    constructor() {
        this.messages = [];
        this.conversations = [];
        this.unreadCount = 0;
        this.socket = null;
        this.init();
    }
    
    init() {
        this.loadMessages();
        this.setupEventListeners();
        this.connectWebSocket();
        console.log('Messaging system initialized');
    }
    
    async loadMessages() {
        try {
            this.messages = Storage.get('user_messages') || await this.getMockMessages();
            this.conversations = this.groupMessagesByConversation();
            this.calculateUnreadCount();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }
    
    async getMockMessages() {
        return [
            {
                id: 'msg1',
                senderId: 'agent_001',
                senderName: 'Learning Agent',
                senderAvatar: '🤖',
                receiverId: 'student_001',
                receiverName: 'Demo Student',
                content: 'Great work on the fractions module! Ready to move to decimals?',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                type: 'text'
            },
            {
                id: 'msg2',
                senderId: 'teacher_001',
                senderName: '// js/shared/messaging.js (continued)

'Ms. Anderson',
                senderAvatar: '👩‍🏫',
                receiverId: 'student_001',
                receiverName: 'Demo Student',
                content: 'Your essay showed great improvement. Let\'s discuss it tomorrow.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: true,
                type: 'text'
            },
            {
                id: 'msg3',
                senderId: 'student_001',
                senderName: 'Demo Student',
                senderAvatar: '👨‍🎓',
                receiverId: 'teacher_001',
                receiverName: 'Ms. Anderson',
                content: 'Thank you! I worked hard on it.',
                timestamp: new Date(Date.now() - 5400000).toISOString(),
                read: true,
                type: 'text'
            },
            {
                id: 'msg4',
                senderId: 'parent_001',
                senderName: 'Parent',
                senderAvatar: '👨‍👩‍👧',
                receiverId: 'teacher_001',
                receiverName: 'Ms. Anderson',
                content: 'How is my child progressing with the new material?',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: false,
                type: 'text'
            }
        ];
    }

    groupMessagesByConversation() {
        const conversations = {};
        
        this.messages.forEach(message => {
            const conversationId = this.getConversationId(message);
            
            if (!conversations[conversationId]) {
                conversations[conversationId] = {
                    id: conversationId,
                    participants: this.getParticipants(message),
                    lastMessage: message,
                    unreadCount: message.read ? 0 : 1,
                    messages: [message]
                };
            } else {
                conversations[conversationId].messages.push(message);
                if (message.timestamp > conversations[conversationId].lastMessage.timestamp) {
                    conversations[conversationId].lastMessage = message;
                }
                if (!message.read) {
                    conversations[conversationId].unreadCount++;
                }
            }
        });
        
        return Object.values(conversations).sort((a, b) => 
            new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
    }

    getConversationId(message) {
        // Create a unique ID for the conversation between sender and receiver
        const participants = [message.senderId, message.receiverId].sort();
        return `conv_${participants.join('_')}`;
    }

    getParticipants(message) {
        return [
            {
                id: message.senderId,
                name: message.senderName,
                avatar: message.senderAvatar,
                role: this.getUserRole(message.senderId)
            },
            {
                id: message.receiverId,
                name: message.receiverName,
                avatar: this.getUserAvatar(message.receiverId),
                role: this.getUserRole(message.receiverId)
            }
        ];
    }

    getUserRole(userId) {
        if (userId.includes('student')) return 'student';
        if (userId.includes('teacher')) return 'teacher';
        if (userId.includes('parent')) return 'parent';
        if (userId.includes('agent')) return 'agent';
        return 'unknown';
    }

    getUserAvatar(userId) {
        // In a real app, this would fetch from user profile
        const avatars = {
            'student': '👨‍🎓',
            'teacher': '👩‍🏫',
            'parent': '👨‍👩‍👧',
            'agent': '🤖'
        };
        
        const role = this.getUserRole(userId);
        return avatars[role] || '👤';
    }

    calculateUnreadCount() {
        this.unreadCount = this.messages.filter(msg => !msg.read).length;
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badgeElements = document.querySelectorAll('.notification-badge, .msg-badge');
        badgeElements.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // Message input events
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // Conversation selection
        document.addEventListener('click', (e) => {
            const conversationEl = e.target.closest('.conversation-item');
            if (conversationEl) {
                const conversationId = conversationEl.dataset.conversationId;
                this.openConversation(conversationId);
            }
        });
        
        // Emoji picker
        const emojiBtn = document.getElementById('emojiPicker');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
        }
        
        // Attachment handling
        const attachBtn = document.getElementById('attachFile');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.handleAttachment());
        }
    }

    connectWebSocket() {
        // In a real app, this would connect to a WebSocket server
        console.log('Simulating WebSocket connection...');
        
        // Simulate receiving messages
        setInterval(() => {
            this.simulateIncomingMessage();
        }, 30000); // Every 30 seconds
    }

    async simulateIncomingMessage() {
        const shouldSendMessage = Math.random() > 0.8; // 20% chance
        
        if (shouldSendMessage) {
            const mockMessages = await this.getMockMessages();
            const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
            
            // Clone the message with new ID and timestamp
            const newMessage = {
                ...randomMessage,
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                read: false
            };
            
            this.receiveMessage(newMessage);
        }
    }

    receiveMessage(message) {
        this.messages.push(message);
        this.saveMessages();
        this.updateConversations();
        
        // Show notification
        this.showMessageNotification(message);
        
        // If conversation is open, add to UI
        const currentConversationId = document.querySelector('.conversation-view')?.dataset.conversationId;
        if (currentConversationId === this.getConversationId(message)) {
            this.addMessageToView(message);
            this.markConversationAsRead(currentConversationId);
        }
    }

    showMessageNotification(message) {
        // Desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${message.senderName}`, {
                body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
                icon: '/favicon.ico',
                tag: 'message-notification'
            });
        }
        
        // In-app notification
        this.showToast(`New message from ${message.senderName}`, 'info');
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput?.value.trim();
        
        if (!content) return;
        
        const currentConversationId = document.querySelector('.conversation-view')?.dataset.conversationId;
        const receiverId = this.getReceiverId(currentConversationId);
        
        if (!receiverId) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }
        
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: this.getCurrentUserId(),
            senderName: this.getCurrentUserName(),
            senderAvatar: this.getCurrentUserAvatar(),
            receiverId: receiverId,
            receiverName: this.getReceiverName(receiverId),
            content: content,
            timestamp: new Date().toISOString(),
            read: true,
            type: 'text'
        };
        
        // Add to messages
        this.messages.push(message);
        this.saveMessages();
        
        // Add to UI
        this.addMessageToView(message);
        
        // Clear input
        messageInput.value = '';
        messageInput.focus();
        
        // Send via WebSocket (in real app)
        this.sendViaWebSocket(message);
        
        // Simulate response (for demo)
        if (receiverId.includes('agent')) {
            setTimeout(() => this.simulateAgentResponse(message), 1000);
        }
    }

    sendViaWebSocket(message) {
        // In a real app, this would send via WebSocket
        console.log('WebSocket send:', message);
        
        // Simulate sending
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'message',
                data: message
            }));
        }
    }

    async simulateAgentResponse(userMessage) {
        // Simple response logic for demo
        const responses = [
            "Thanks for your message! I'm analyzing your learning patterns now.",
            "Great question! Let me help you with that.",
            "I've updated your learning plan based on your progress.",
            "Your dedication is impressive! Keep up the good work.",
            "Based on your recent activity, I suggest trying the next module."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const agentMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: 'agent_001',
            senderName: 'Learning Agent',
            senderAvatar: '🤖',
            receiverId: this.getCurrentUserId(),
            receiverName: this.getCurrentUserName(),
            content: randomResponse,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text'
        };
        
        // Delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.receiveMessage(agentMessage);
    }

    getCurrentUserId() {
        const user = Auth.getCurrentUser();
        return user?.id || 'anonymous';
    }

    getCurrentUserName() {
        const user = Auth.getCurrentUser();
        return user?.name || 'User';
    }

    getCurrentUserAvatar() {
        const user = Auth.getCurrentUser();
        if (!user) return '👤';
        
        switch(user.role) {
            case 'student': return '👨‍🎓';
            case 'teacher': return '👩‍🏫';
            case 'parent': return '👨‍👩‍👧';
            default: return '👤';
        }
    }

    getReceiverId(conversationId) {
        if (!conversationId) return null;
        
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (!conversation) return null;
        
        const currentUserId = this.getCurrentUserId();
        const participant = conversation.participants.find(p => p.id !== currentUserId);
        return participant?.id || null;
    }

    getReceiverName(receiverId) {
        // In a real app, this would fetch from user data
        if (receiverId.includes('agent')) return 'Learning Agent';
        if (receiverId.includes('teacher')) return 'Ms. Anderson';
        if (receiverId.includes('parent')) return 'Parent';
        return 'User';
    }

    openConversation(conversationId) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (!conversation) return;
        
        // Mark as read
        this.markConversationAsRead(conversationId);
        
        // Update UI
        this.renderConversationView(conversation);
    }

    renderConversationView(conversation) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const otherParticipant = conversation.participants.find(p => p.id !== this.getCurrentUserId());
        
        container.innerHTML = `
            <div class="conversation-view" data-conversation-id="${conversation.id}">
                <div class="conversation-header">
                    <div class="participant-info">
                        <div class="participant-avatar">${otherParticipant?.avatar}</div>
                        <div class="participant-details">
                            <h3>${otherParticipant?.name}</h3>
                            <span class="participant-role">${otherParticipant?.role}</span>
                        </div>
                    </div>
                    <div class="conversation-actions">
                        <button class="btn-icon" title="Video call">
                            <span>📹</span>
                        </button>
                        <button class="btn-icon" title="Audio call">
                            <span>📞</span>
                        </button>
                        <button class="btn-icon" title="More options">
                            <span>⋯</span>
                        </button>
                    </div>
                </div>
                
                <div class="messages-area" id="messagesArea">
                    ${conversation.messages.map(msg => this.getMessageBubble(msg)).join('')}
                </div>
                
                <div class="message-input-area">
                    <div class="input-tools">
                        <button class="btn-icon" id="attachFile" title="Attach file">
                            <span>📎</span>
                        </button>
                        <button class="btn-icon" id="emojiPicker" title="Add emoji">
                            <span>😊</span>
                        </button>
                    </div>
                    <textarea 
                        id="messageInput" 
                        class="message-input" 
                        placeholder="Type your message here..."
                        rows="1"></textarea>
                    <button class="btn btn-primary" id="sendMessage">Send</button>
                </div>
            </div>
        `;
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Setup input auto-resize
        this.setupTextareaAutoResize();
    }

    getMessageBubble(message) {
        const isCurrentUser = message.senderId === this.getCurrentUserId();
        const time = Utils.formatDate(message.timestamp, 'time');
        
        return `
            <div class="message-bubble ${isCurrentUser ? 'outgoing' : 'incoming'}">
                ${!isCurrentUser ? `
                <div class="message-sender">
                    <span class="sender-avatar">${message.senderAvatar}</span>
                    <span class="sender-name">${message.senderName}</span>
                </div>
                ` : ''}
                
                <div class="message-content">
                    ${this.formatMessageContent(message)}
                </div>
                
                <div class="message-meta">
                    <span class="message-time">${time}</span>
                    ${isCurrentUser ? `
                    <span class="message-status ${message.read ? 'read' : 'sent'}">
                        ${message.read ? '✓✓' : '✓'}
                    </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatMessageContent(message) {
        if (message.type === 'text') {
            return this.formatTextMessage(message.content);
        } else if (message.type === 'file') {
            return this.getFileMessageHTML(message);
        }
        return message.content;
    }

    formatTextMessage(content) {
        // Basic formatting - in a real app, you'd use a proper markdown/sanitizer
        return content
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    getFileMessageHTML(message) {
        const fileExt = message.fileName?.split('.').pop()?.toLowerCase();
        const fileTypes = {
            pdf: '📕', image: '🖼️', video: '🎬', audio: '🎵',
            doc: '📄', xls: '📊', ppt: '📽️', zip: '📦'
        };
        
        let fileIcon = '📎';
        if (fileExt) {
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) fileIcon = fileTypes.image;
            else if (['pdf'].includes(fileExt)) fileIcon = fileTypes.pdf;
            else if (['mp4', 'avi', 'mov'].includes(fileExt)) fileIcon = fileTypes.video;
            else if (['mp3', 'wav'].includes(fileExt)) fileIcon = fileTypes.audio;
            else if (['doc', 'docx'].includes(fileExt)) fileIcon = fileTypes.doc;
            else if (['xls', 'xlsx'].includes(fileExt)) fileIcon = fileTypes.xls;
            else if (['ppt', 'pptx'].includes(fileExt)) fileIcon = fileTypes.ppt;
            else if (['zip', 'rar'].includes(fileExt)) fileIcon = fileTypes.zip;
        }
        
        return `
            <div class="file-message">
                <div class="file-icon">${fileIcon}</div>
                <div class="file-info">
                    <div class="file-name">${message.fileName || 'File'}</div>
                    <div class="file-size">${this.formatFileSize(message.fileSize)}</div>
                </div>
                <a href="${message.fileUrl || '#'}" download class="download-btn">⬇️</a>
            </div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    addMessageToView(message) {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;
        
        const bubble = this.getMessageBubble(message);
        messagesArea.insertAdjacentHTML('beforeend', bubble);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }

    setupTextareaAutoResize() {
        const textarea = document.getElementById('messageInput');
        if (!textarea) return;
        
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    toggleEmojiPicker() {
        // Simple emoji picker implementation
        const emojis = ['😊', '👍', '🎉', '🤔', '😢', '❤️', '🔥', '⭐'];
        const picker = document.getElementById('emojiPickerContainer');
        
        if (!picker) {
            const pickerHTML = `
                <div class="emoji-picker" id="emojiPickerContainer">
                    <div class="emoji-grid">
                        ${emojis.map(emoji => `
                            <button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            document.querySelector('.message-input-area').insertAdjacentHTML('beforeend', pickerHTML);
            
            // Add emoji click handlers
            document.querySelectorAll('.emoji-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const emoji = btn.dataset.emoji;
                    this.insertEmoji(emoji);
                });
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.emoji-picker') && !e.target.closest('#emojiPicker')) {
                    picker.remove();
                }
            });
        } else {
            picker.remove();
        }
    }

    insertEmoji(emoji) {
        const textarea = document.getElementById('messageInput');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + emoji + text.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            
            // Trigger input event for auto-resize
            textarea.dispatchEvent(new Event('input'));
        }
    }

    handleAttachment() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
        
        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => this.uploadFile(file));
        };
        
        fileInput.click();
    }

    async uploadFile(file) {
        // In a real app, this would upload to a server
        console.log('Uploading file:', file.name);
        
        // Simulate upload
        this.showToast(`Uploading ${file.name}...`, 'info');
        
        // Create a mock message
        const message = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: this.getCurrentUserId(),
            senderName: this.getCurrentUserName(),
            senderAvatar: this.getCurrentUserAvatar(),
            receiverId: this.getReceiverId(document.querySelector('.conversation-view')?.dataset.conversationId),
            receiverName: this.getReceiverName(this.getReceiverId(document.querySelector('.conversation-view')?.dataset.conversationId)),
            content: '',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: URL.createObjectURL(file),
            timestamp: new Date().toISOString(),
            read: true,
            type: 'file'
        };
        
        this.messages.push(message);
        this.saveMessages();
        this.addMessageToView(message);
        
        this.showToast(`${file.name} uploaded successfully`, 'success');
    }

    markConversationAsRead(conversationId) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (!conversation) return;
        
        // Mark all messages as read
        conversation.messages.forEach(msg => {
            if (!msg.read && msg.senderId !== this.getCurrentUserId()) {
                msg.read = true;
            }
        });
        
        // Update unread count
        conversation.unreadCount = 0;
        this.calculateUnreadCount();
        this.saveMessages();
        
        // Update conversation list UI
        this.updateConversationList();
    }

    updateConversationList() {
        const container = document.getElementById('conversationsList');
        if (!container) return;
        
        container.innerHTML = this.conversations.map(conv => this.getConversationItem(conv)).join('');
    }

    getConversationItem(conversation) {
        const otherParticipant = conversation.participants.find(p => p.id !== this.getCurrentUserId());
        const lastMessage = conversation.lastMessage;
        const timeAgo = Utils.formatDate(lastMessage.timestamp, 'relative');
        
        return `
            <div class="conversation-item" data-conversation-id="${conversation.id}">
                <div class="conversation-avatar">
                    ${otherParticipant?.avatar}
                    ${conversation.unreadCount > 0 ? `
                    <span class="unread-indicator">${conversation.unreadCount}</span>
                    ` : ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4 class="conversation-name">${otherParticipant?.name}</h4>
                        <span class="conversation-time">${timeAgo}</span>
                    </div>
                    <div class="conversation-preview">
                        <span class="preview-text">${this.getPreviewText(lastMessage)}</span>
                        ${conversation.unreadCount > 0 ? '<span class="new-badge">NEW</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getPreviewText(message) {
        if (message.type === 'file') {
            return `📎 ${message.fileName || 'File'}`;
        }
        return message.content.length > 50 
            ? message.content.substring(0, 50) + '...' 
            : message.content;
    }

    saveMessages() {
        Storage.set('user_messages', this.messages);
    }

    updateConversations() {
        this.conversations = this.groupMessagesByConversation();
        this.updateConversationList();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    getToastIcon(type) {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '💬';
        }
    }
}

// Initialize messaging system
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn()) {
        window.Messaging = new MessagingSystem();
    }
});