// Application State
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    currentChatId: null,
    chats: [],
    theme: 'auto',
    settings: {
        aiModel: 'gpt-3.5-turbo',
        theme: 'auto',
        language: 'English'
    }
};

// Sample Data
const sampleChats = [
    {
        id: "chat-1",
        title: "Getting Started",
        messages: [
            {role: "user", content: "Hello! How can you help me?", timestamp: "2025-01-15T10:00:00Z"},
            {role: "assistant", content: "Hello! I'm an AI assistant here to help you with various tasks. I can answer questions, help with writing, provide explanations, assist with problem-solving, and much more. What would you like to know or discuss today?", timestamp: "2025-01-15T10:00:05Z"}
        ],
        createdAt: "2025-01-15T10:00:00Z"
    },
    {
        id: "chat-2", 
        title: "Programming Help",
        messages: [
            {role: "user", content: "Can you explain React hooks?", timestamp: "2025-01-15T11:30:00Z"},
            {role: "assistant", content: "React Hooks are functions that let you use state and other React features in functional components. The most common hooks are:\n\n• useState - for managing component state\n• useEffect - for side effects and lifecycle events\n• useContext - for consuming context\n• useReducer - for complex state logic\n\nHooks follow two main rules:\n1. Only call hooks at the top level\n2. Only call hooks from React functions\n\nWould you like me to explain any specific hook in more detail?", timestamp: "2025-01-15T11:30:08Z"}
        ],
        createdAt: "2025-01-15T11:30:00Z"
    },
    {
        id: "chat-3",
        title: "Creative Writing", 
        messages: [
            {role: "user", content: "Write a short poem about technology", timestamp: "2025-01-15T14:15:00Z"},
            {role: "assistant", content: "**Digital Dreams**\n\nPixels dance on glowing screens,\nCode weaves through silicon dreams.\nBits and bytes in harmony,\nCrafting our digital symphony.\n\nConnections span across the globe,\nIn this technological robe.\nProgress marches ever on,\nFrom the dusk until the dawn.\n\nIn circuits small, great power lies—\nThe future's written in the skies.", timestamp: "2025-01-15T14:15:12Z"}
        ],
        createdAt: "2025-01-15T14:15:00Z"
    }
];

const userProfile = {
    username: "demo_user",
    email: "demo@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    joinDate: "2025-01-10T00:00:00Z",
    totalChats: 15,
    totalMessages: 87
};

// Utility Functions
const Utils = {
    formatTime: (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    },

    generateId: () => 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),

    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePassword: (password) => {
        return password.length >= 6;
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Authentication System
const AuthSystem = {
    init() {
        console.log('AuthSystem: Initializing...');
        
        // Check if user is already authenticated
        const savedUser = localStorage.getItem('chatbot-user');
        if (savedUser) {
            try {
                AppState.currentUser = JSON.parse(savedUser);
                AppState.isAuthenticated = true;
                console.log('AuthSystem: Found saved user, showing main app');
                this.showMainApp();
                return;
            } catch (e) {
                console.log('AuthSystem: Invalid saved user data, clearing');
                localStorage.removeItem('chatbot-user');
            }
        }
        
        console.log('AuthSystem: No saved user, showing auth modal');
        this.showAuthModal();
        this.setupAuthListeners();
    },

    setupAuthListeners() {
        console.log('AuthSystem: Setting up event listeners');
        
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authSwitchLink = document.getElementById('authSwitchLink');
        const logoutButton = document.getElementById('logoutButton');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('AuthSystem: Login form submitted');
                this.handleLogin(e);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('AuthSystem: Register form submitted');
                this.handleRegister(e);
            });
        }
        
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('AuthSystem: Auth switch clicked');
                this.toggleAuthMode(e);
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                console.log('AuthSystem: Logout clicked');
                this.handleLogout();
            });
        }
    },

    showAuthModal() {
        console.log('AuthSystem: Showing auth modal');
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        
        if (authModal) authModal.classList.remove('hidden');
        if (app) app.classList.add('hidden');
    },

    showMainApp() {
        console.log('AuthSystem: Showing main app');
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        
        if (authModal) authModal.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        
        this.updateUserInterface();
        
        // Initialize chat system after showing main app
        if (typeof ChatSystem !== 'undefined' && ChatSystem.init) {
            ChatSystem.init();
        }
    },

    toggleAuthMode(e) {
        e.preventDefault();
        console.log('AuthSystem: Toggling auth mode');
        
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const authSwitchText = document.getElementById('authSwitchText');
        
        const isLoginMode = !registerForm.classList.contains('hidden');
        
        if (isLoginMode) {
            // Switch to register
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join us to start intelligent conversations';
            authSwitchText.innerHTML = 'Already have an account? <a href="#" id="authSwitchLink">Sign in</a>';
        } else {
            // Switch to login
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to continue your conversations';
            authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" id="authSwitchLink">Sign up</a>';
        }
        
        // Re-attach event listener to new link
        const newAuthLink = document.getElementById('authSwitchLink');
        if (newAuthLink) {
            newAuthLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthMode(e);
            });
        }
        
        this.clearErrors();
    },

    async handleLogin(e) {
        e.preventDefault();
        console.log('AuthSystem: Processing login');
        
        this.clearErrors();
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            console.error('AuthSystem: Login form elements not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        console.log('AuthSystem: Login attempt with email:', email);
        
        // Validate inputs
        let hasErrors = false;
        
        if (!email) {
            this.showError('loginEmailError', 'Email is required');
            hasErrors = true;
        } else if (!Utils.validateEmail(email)) {
            this.showError('loginEmailError', 'Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!password) {
            this.showError('loginPasswordError', 'Password is required');
            hasErrors = true;
        } else if (password.length < 3) { // More lenient for demo
            this.showError('loginPasswordError', 'Password must be at least 3 characters');
            hasErrors = true;
        }
        
        if (hasErrors) {
            console.log('AuthSystem: Login validation failed');
            return;
        }
        
        // Show loading
        this.showLoading();
        
        try {
            console.log('AuthSystem: Simulating login API call');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock successful login - accept any valid email/password combination
            AppState.currentUser = {
                ...userProfile,
                email: email,
                username: email.split('@')[0]
            };
            AppState.isAuthenticated = true;
            
            console.log('AuthSystem: Login successful, saving user');
            
            // Save to localStorage
            localStorage.setItem('chatbot-user', JSON.stringify(AppState.currentUser));
            
            this.hideLoading();
            this.showMainApp();
            
        } catch (error) {
            console.error('AuthSystem: Login error:', error);
            this.hideLoading();
            this.showError('loginPasswordError', 'Login failed. Please try again.');
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        console.log('AuthSystem: Processing registration');
        
        this.clearErrors();
        
        const usernameInput = document.getElementById('registerUsername');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('registerConfirmPassword');
        
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('AuthSystem: Register form elements not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        console.log('AuthSystem: Registration attempt with email:', email);
        
        // Validate inputs
        let hasErrors = false;
        
        if (!username) {
            this.showError('registerUsernameError', 'Username is required');
            hasErrors = true;
        } else if (username.length < 2) { // More lenient for demo
            this.showError('registerUsernameError', 'Username must be at least 2 characters');
            hasErrors = true;
        }
        
        if (!email) {
            this.showError('registerEmailError', 'Email is required');
            hasErrors = true;
        } else if (!Utils.validateEmail(email)) {
            this.showError('registerEmailError', 'Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!password) {
            this.showError('registerPasswordError', 'Password is required');
            hasErrors = true;
        } else if (password.length < 3) { // More lenient for demo
            this.showError('registerPasswordError', 'Password must be at least 3 characters');
            hasErrors = true;
        }
        
        if (!confirmPassword) {
            this.showError('registerConfirmPasswordError', 'Please confirm your password');
            hasErrors = true;
        } else if (password !== confirmPassword) {
            this.showError('registerConfirmPasswordError', 'Passwords do not match');
            hasErrors = true;
        }
        
        if (hasErrors) {
            console.log('AuthSystem: Registration validation failed');
            return;
        }
        
        // Show loading
        this.showLoading();
        
        try {
            console.log('AuthSystem: Simulating registration API call');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock successful registration
            AppState.currentUser = {
                username: username,
                email: email,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                joinDate: new Date().toISOString(),
                totalChats: 0,
                totalMessages: 0
            };
            AppState.isAuthenticated = true;
            
            console.log('AuthSystem: Registration successful, saving user');
            
            // Save to localStorage
            localStorage.setItem('chatbot-user', JSON.stringify(AppState.currentUser));
            
            this.hideLoading();
            this.showMainApp();
            
        } catch (error) {
            console.error('AuthSystem: Registration error:', error);
            this.hideLoading();
            this.showError('registerEmailError', 'Registration failed. Please try again.');
        }
    },

    handleLogout() {
        console.log('AuthSystem: Processing logout');
        
        AppState.isAuthenticated = false;
        AppState.currentUser = null;
        AppState.chats = [];
        AppState.currentChatId = null;
        
        localStorage.removeItem('chatbot-user');
        localStorage.removeItem('chatbot-chats');
        
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
        
        this.showAuthModal();
        this.setupAuthListeners(); // Re-setup listeners after logout
    },

    updateUserInterface() {
        console.log('AuthSystem: Updating user interface');
        
        if (AppState.currentUser) {
            const headerUsername = document.getElementById('headerUsername');
            const headerUserEmail = document.getElementById('headerUserEmail');
            const userAvatarImg = document.getElementById('userAvatarImg');
            const settingsUsername = document.getElementById('settingsUsername');
            const settingsEmail = document.getElementById('settingsEmail');
            const totalChats = document.getElementById('totalChats');
            const totalMessages = document.getElementById('totalMessages');
            const memberSince = document.getElementById('memberSince');
            
            if (headerUsername) headerUsername.textContent = AppState.currentUser.username;
            if (headerUserEmail) headerUserEmail.textContent = AppState.currentUser.email;
            if (userAvatarImg) userAvatarImg.src = AppState.currentUser.avatar;
            
            // Update settings modal
            if (settingsUsername) settingsUsername.value = AppState.currentUser.username;
            if (settingsEmail) settingsEmail.value = AppState.currentUser.email;
            if (totalChats) totalChats.textContent = AppState.currentUser.totalChats;
            if (totalMessages) totalMessages.textContent = AppState.currentUser.totalMessages;
            
            if (memberSince) {
                const joinDate = new Date(AppState.currentUser.joinDate);
                memberSince.textContent = joinDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
        }
    },

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            console.log('AuthSystem: Showing error:', elementId, message);
        }
    },

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
    },

    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    },

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
};

// Chat System
const ChatSystem = {
    init() {
        console.log('ChatSystem: Initializing...');
        
        // Load chats from localStorage or use sample data
        const savedChats = localStorage.getItem('chatbot-chats');
        if (savedChats) {
            try {
                AppState.chats = JSON.parse(savedChats);
            } catch (e) {
                console.log('ChatSystem: Invalid saved chats, using sample data');
                AppState.chats = [...sampleChats];
            }
        } else {
            AppState.chats = [...sampleChats];
            this.saveChats();
        }

        this.renderChatHistory();
        this.setupEventListeners();
        
        // Load first chat if available
        if (AppState.chats.length > 0 && !AppState.currentChatId) {
            this.loadChat(AppState.chats[0].id);
        }
    },

    setupEventListeners() {
        console.log('ChatSystem: Setting up event listeners');
        
        const chatForm = document.getElementById('chatForm');
        const messageInput = document.getElementById('messageInput');
        const newChatButton = document.getElementById('newChatButton');
        
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSendMessage(e);
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', () => this.handleInputChange());
            messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }
        
        if (newChatButton) {
            newChatButton.addEventListener('click', () => this.createNewChat());
        }
    },

    renderChatHistory() {
        const chatHistoryList = document.getElementById('chatHistoryList');
        if (!chatHistoryList) return;
        
        chatHistoryList.innerHTML = '';
        
        AppState.chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = `chat-history-item ${chat.id === AppState.currentChatId ? 'active' : ''}`;
            chatElement.setAttribute('data-chat-id', chat.id);
            
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? lastMessage.content : 'New chat';
            
            chatElement.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${preview}</div>
                <div class="chat-time">${Utils.formatTime(chat.createdAt)}</div>
            `;
            
            chatElement.addEventListener('click', () => this.loadChat(chat.id));
            chatHistoryList.appendChild(chatElement);
        });
    },

    loadChat(chatId) {
        console.log('ChatSystem: Loading chat:', chatId);
        
        const chat = AppState.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        AppState.currentChatId = chatId;
        this.renderMessages(chat.messages);
        this.renderChatHistory(); // Re-render to update active state
        
        // Hide sidebar on mobile after selecting chat
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('collapsed');
            }
        }
    },

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </div>
                    <h2>Start a New Conversation</h2>
                    <p>Ask me anything! I'm here to help with questions, creative tasks, problem-solving, and more.</p>
                </div>
            `;
            return;
        }
        
        messages.forEach(message => {
            this.renderMessage(message);
        });
        
        this.scrollToBottom();
    },

    renderMessage(message, animate = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        
        const avatar = message.role === 'user' ? 
            (AppState.currentUser ? AppState.currentUser.username.charAt(0).toUpperCase() : 'U') : 'AI';
        
        const formattedContent = message.content.replace(/\n/g, '<br>');
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${formattedContent}</div>
                </div>
                <div class="message-meta">
                    <span class="message-time">${Utils.formatTime(message.timestamp)}</span>
                    ${message.role === 'user' ? '<div class="message-status">✓</div>' : ''}
                </div>
            </div>
        `;
        
        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }
        
        chatMessages.appendChild(messageElement);
        
        if (animate) {
            setTimeout(() => {
                messageElement.style.transition = 'all 0.3s ease';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            }, 50);
        }
        
        this.scrollToBottom();
    },

    async handleSendMessage(e) {
        e.preventDefault();
        console.log('ChatSystem: Handling send message');
        
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (!messageInput) return;
        
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        
        // Disable send button
        if (sendButton) {
            sendButton.disabled = true;
        }
        
        // Create user message
        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };
        
        // Add message to current chat or create new chat
        if (!AppState.currentChatId) {
            this.createNewChat();
        }
        
        const currentChat = AppState.chats.find(c => c.id === AppState.currentChatId);
        if (currentChat) {
            currentChat.messages.push(userMessage);
            
            // Update chat title if it's the first message
            if (currentChat.messages.length === 1) {
                currentChat.title = messageText.length > 30 ? 
                    messageText.substring(0, 30) + '...' : messageText;
            }
        }
        
        // Clear input and render message
        messageInput.value = '';
        this.updateCharCount();
        this.autoResizeTextarea();
        this.renderMessage(userMessage, true);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate AI response
       
        
        // Save chats and re-render history
        this.saveChats();
        this.renderChatHistory();
        
        // Re-enable send button
        if (sendButton) {
            sendButton.disabled = false;
        }
        
        // Focus back on input
        messageInput.focus();
    },
    
    
    async generateAIResponse(userMessage) {
        console.log('ChatSystem: Generating AI response for:', userMessage);
    
        this.showTypingIndicator();
    
        let response = "No reply from AI.";
    
        try {
            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AppState.token || ''}`
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: AppState.currentChatId
                })
            });
    
            const data = await res.json();
            response = data.message || "AI didn't respond.";
        } catch (err) {
            console.error('AI request failed:', err);
            response = "There was a problem talking to the AI.";
        }
    
        this.hideTypingIndicator();
    
        const aiMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        };
    
        const currentChat = AppState.chats.find(c => c.id === AppState.currentChatId);
        if (currentChat) {
            currentChat.messages.push(aiMessage);
            await this.typeMessage(aiMessage);
        }
    }
    

    async typeMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        
        messageElement.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text"></div>
                </div>
                <div class="message-meta">
                    <span class="message-time">${Utils.formatTime(message.timestamp)}</span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        const textElement = messageElement.querySelector('.message-text');
        
        // Type out the message
        const words = message.content.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            textElement.innerHTML = currentText.replace(/\n/g, '<br>');
            this.scrollToBottom();
            
            // Random delay between words
            const delay = Math.random() * 100 + 50;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    },

    getAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Simple response patterns
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm happy to help you today. What would you like to talk about or explore?";
        }
        
        if (lowerMessage.includes('how are you')) {
            return "I'm doing great, thank you for asking! I'm here and ready to assist you with any questions or tasks you have in mind.";
        }
        
        if (lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('programming')) {
            return "I'd be happy to help you with programming! Whether you need help with React, JavaScript, or any other programming concepts, I can provide explanations, examples, and guidance. What specific aspect would you like to explore?";
        }
        
        if (lowerMessage.includes('write') || lowerMessage.includes('poem') || lowerMessage.includes('story')) {
            return "Creative writing is one of my favorite areas to help with! I can assist with poems, stories, essays, or any other creative writing project. What kind of piece would you like to work on?";
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
            return "I'm here to help! I can assist with a wide range of topics including:\n\n• Answering questions and explaining concepts\n• Help with writing and creative projects\n• Programming and technical guidance\n• Problem-solving and brainstorming\n• General conversation and advice\n\nWhat would you like help with today?";
        }
        
        // Default responses
        const responses = [
            "That's an interesting point! Could you tell me more about what you're thinking?",
            "I appreciate you sharing that with me. What aspects would you like to explore further?",
            "Great question! Let me think about this and provide you with a helpful response.",
            "I find that topic fascinating. What specific information are you looking for?",
            "Thanks for bringing that up! I'd be happy to discuss this with you in more detail.",
            "That's a thoughtful observation. Would you like me to elaborate on any particular aspect?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    },

    createNewChat() {
        console.log('ChatSystem: Creating new chat');
        
        const newChat = {
            id: Utils.generateId(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        AppState.chats.unshift(newChat);
        AppState.currentChatId = newChat.id;
        
        this.renderChatHistory();
        this.renderMessages([]);
        
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    },

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            this.scrollToBottom();
        }
    },

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
    },

    handleInputChange() {
        this.updateCharCount();
        this.autoResizeTextarea();
    },

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const chatForm = document.getElementById('chatForm');
            if (chatForm) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    },

    updateCharCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        
        if (!messageInput || !charCount) return;
        
        const count = messageInput.value.length;
        charCount.textContent = count;
        
        if (count > 1800) {
            charCount.style.color = 'var(--color-warning)';
        } else if (count > 1950) {
            charCount.style.color = 'var(--color-error)';
        } else {
            charCount.style.color = 'var(--color-text-secondary)';
        }
    },

    autoResizeTextarea() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        }
    },

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    },

    saveChats() {
        localStorage.setItem('chatbot-chats', JSON.stringify(AppState.chats));
    }
};

// Theme System
const ThemeSystem = {
    init() {
        console.log('ThemeSystem: Initializing...');
        
        // Load saved theme
        const savedTheme = localStorage.getItem('chatbot-theme') || 'auto';
        AppState.theme = savedTheme;
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
        
        this.applyTheme(savedTheme);
        this.setupEventListeners();
    },

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        const themeSelect = document.getElementById('themeSelect');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = newTheme;
        }
    },

    applyTheme(theme) {
        console.log('ThemeSystem: Applying theme:', theme);
        AppState.theme = theme;
        
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.updateThemeIcon(prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
            this.updateThemeIcon(theme);
        }
        
        localStorage.setItem('chatbot-theme', theme);
    },

    updateThemeIcon(theme) {
        const lightIcon = document.querySelector('.theme-icon--light');
        const darkIcon = document.querySelector('.theme-icon--dark');
        
        if (lightIcon && darkIcon) {
            if (theme === 'dark') {
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            } else {
                lightIcon.classList.remove('hidden');
                darkIcon.classList.add('hidden');
            }
        }
    }
};

// UI System
const UISystem = {
    init() {
        console.log('UISystem: Initializing...');
        this.setupEventListeners();
        this.setupResponsive();
    },

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // User menu
        const userMenuButton = document.getElementById('userMenuButton');
        if (userMenuButton) {
            userMenuButton.addEventListener('click', () => this.toggleUserMenu());
        }
        
        // Settings modal
        const settingsButton = document.getElementById('settingsButton');
        const settingsModalClose = document.getElementById('settingsModalClose');
        
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.openSettings());
        }
        
        if (settingsModalClose) {
            settingsModalClose.addEventListener('click', () => this.closeSettings());
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const userMenuButton = document.getElementById('userMenuButton');
            const userDropdown = document.getElementById('userDropdown');
            
            if (userMenuButton && userDropdown && 
                !userMenuButton.contains(e.target) && 
                !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
        
        // Close modals when clicking outside
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }
        
        // AI Model selection
        const aiModelSelect = document.getElementById('aiModelSelect');
        if (aiModelSelect) {
            aiModelSelect.addEventListener('change', (e) => {
                AppState.settings.aiModel = e.target.value;
                localStorage.setItem('chatbot-settings', JSON.stringify(AppState.settings));
            });
        }
    },

    setupResponsive() {
        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('collapsed');
                }
            }
        }, 250));
        
        // Close sidebar when clicking on main content on mobile
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) {
                        sidebar.classList.add('collapsed');
                    }
                }
            });
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    },

    toggleUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    },

    openSettings() {
        const settingsModal = document.getElementById('settingsModal');
        const userDropdown = document.getElementById('userDropdown');
        
        if (settingsModal) {
            settingsModal.classList.remove('hidden');
        }
        
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
        
        // Load current settings
        if (AppState.currentUser) {
            const settingsUsername = document.getElementById('settingsUsername');
            const settingsEmail = document.getElementById('settingsEmail');
            const themeSelect = document.getElementById('themeSelect');
            const aiModelSelect = document.getElementById('aiModelSelect');
            
            if (settingsUsername) settingsUsername.value = AppState.currentUser.username || '';
            if (settingsEmail) settingsEmail.value = AppState.currentUser.email || '';
            if (themeSelect) themeSelect.value = AppState.theme;
            if (aiModelSelect) aiModelSelect.value = AppState.settings.aiModel;
        }
    },

    closeSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.add('hidden');
        }
    }
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('App: DOM Content Loaded, initializing...');
    
    // Load settings
    const savedSettings = localStorage.getItem('chatbot-settings');
    if (savedSettings) {
        try {
            AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
        } catch (e) {
            console.log('App: Invalid saved settings, using defaults');
        }
    }
    
    // Initialize all systems
    AuthSystem.init();
    ThemeSystem.init();
    UISystem.init();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (AppState.theme === 'auto') {
            ThemeSystem.updateThemeIcon(e.matches ? 'dark' : 'light');
        }
    });
    
    console.log('App: Initialization complete');
});

// Export for debugging
window.AppState = AppState;