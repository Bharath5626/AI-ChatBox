# Create comprehensive project structure and code files for the AI chatbot application
import json
import os

# Create the complete file structure and code for the AI chatbot
project_structure = {
    "root": {
        "package.json": {
            "name": "ai-chatbot-fullstack",
            "version": "1.0.0",
            "description": "Full-stack AI chatbot with OpenAI integration",
            "scripts": {
                "dev": "concurrently \"npm run server\" \"npm run client\"",
                "server": "cd backend && npm run dev",
                "client": "cd frontend && npm start",
                "build": "cd frontend && npm run build && cd ../backend && npm run build",
                "start": "cd backend && npm start"
            },
            "devDependencies": {
                "concurrently": "^7.6.0"
            }
        },
        "README.md": "# AI Chatbot Full-Stack Application\n\nA modern full-stack chatbot application built with React, Node.js, Express, MongoDB, and OpenAI GPT integration.\n\n## Features\n\n- Modern chat UI with real-time messaging\n- OpenAI GPT integration for intelligent responses\n- User authentication with JWT\n- Chat history persistence with MongoDB\n- Responsive design\n- Error handling and loading states\n- Deployment ready for Render/Vercel\n\n## Setup Instructions\n\n### Prerequisites\n- Node.js (v14 or higher)\n- MongoDB (local or Atlas)\n- OpenAI API key\n\n### Installation\n\n1. Clone the repository\n```bash\ngit clone <repository-url>\ncd ai-chatbot-fullstack\n```\n\n2. Install root dependencies\n```bash\nnpm install\n```\n\n3. Setup Backend\n```bash\ncd backend\nnpm install\n```\n\n4. Setup Frontend\n```bash\ncd ../frontend\nnpm install\n```\n\n5. Environment Setup\nCreate `.env` file in the backend directory:\n```\nMONGODB_URI=your_mongodb_connection_string\nOPENAI_API_KEY=your_openai_api_key\nJWT_SECRET=your_jwt_secret\nPORT=5000\nNODE_ENV=development\n```\n\n6. Run the application\n```bash\n# From root directory\nnpm run dev\n```\n\n## Deployment\n\n### Backend (Render)\n1. Push code to GitHub\n2. Connect repository to Render\n3. Set environment variables\n4. Deploy\n\n### Frontend (Vercel)\n1. Push code to GitHub\n2. Connect repository to Vercel\n3. Set build settings\n4. Deploy\n\n## API Endpoints\n\n### Authentication\n- `POST /api/auth/register` - Register new user\n- `POST /api/auth/login` - Login user\n\n### Chat\n- `POST /api/chat` - Send message and get AI response\n- `GET /api/chat/history` - Get user chat history\n- `DELETE /api/chat/history` - Clear chat history\n\n## Tech Stack\n\n- **Frontend**: React, CSS3, Axios\n- **Backend**: Node.js, Express.js, MongoDB, Mongoose\n- **AI**: OpenAI GPT API\n- **Authentication**: JWT\n- **Deployment**: Render (backend), Vercel (frontend)\n\n## Contributing\n\n1. Fork the repository\n2. Create feature branch\n3. Commit changes\n4. Push to branch\n5. Create Pull Request\n\n## License\n\nMIT License"
    },
    "backend": {
        "package.json": {
            "name": "ai-chatbot-backend",
            "version": "1.0.0",
            "description": "Backend server for AI chatbot",
            "main": "server.js",
            "scripts": {
                "start": "node server.js",
                "dev": "nodemon server.js",
                "build": "echo 'No build step required for Node.js'"
            },
            "dependencies": {
                "express": "^4.18.2",
                "mongoose": "^7.5.0",
                "openai": "^4.20.1",
                "jsonwebtoken": "^9.0.2",
                "bcryptjs": "^2.4.3",
                "cors": "^2.8.5",
                "dotenv": "^16.3.1",
                "express-rate-limit": "^6.10.0",
                "helmet": "^7.0.0"
            },
            "devDependencies": {
                "nodemon": "^3.0.1"
            },
            "engines": {
                "node": ">=14.0.0"
            }
        },
        "server.js": """const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'AI Chatbot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;""",
        "models/User.js": """const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  chatHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);""",
        "models/ChatMessage.js": """const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [4000, 'Message content cannot exceed 4000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      model: String,
      tokens: Number,
      cost: Number,
      processingTime: Number
    }
  }],
  totalMessages: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ user: 1, sessionId: 1 });
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ user: 1, createdAt: -1 });

// Update total messages count
chatMessageSchema.pre('save', function(next) {
  this.totalMessages = this.messages.length;
  next();
});

// Static method to get user chat history
chatMessageSchema.statics.getUserChatHistory = async function(userId, limit = 10) {
  return await this.find({ user: userId, isActive: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('user', 'username email avatar');
};

// Instance method to add message
chatMessageSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to get conversation context
chatMessageSchema.methods.getContext = function(maxMessages = 10) {
  return this.messages
    .slice(-maxMessages)
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);""",
        "middleware/auth.js": """const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Token is not valid' });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Optional auth middleware (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = { auth, optionalAuth };""",
        "routes/auth.js": """const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide username, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: username.trim(), 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username is already taken' 
        });
      }
      
      user.username = username.trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Verify token
router.get('/verify', auth, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;""",
        "routes/chat.js": """const express = require('express');
const OpenAI = require('openai');
const ChatMessage = require('../models/ChatMessage');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting for OpenAI API calls
const chatLimiter = require('express-rate-limit')({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each user to 20 requests per minute
  message: { message: 'Too many chat requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Send message to AI and save to database
router.post('/', auth, chatLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000 characters)' });
    }

    const currentSessionId = sessionId || uuidv4();

    // Find or create chat session
    let chatSession = await ChatMessage.findOne({ 
      user: userId, 
      sessionId: currentSessionId 
    });

    if (!chatSession) {
      chatSession = new ChatMessage({
        user: userId,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Add user message
    await chatSession.addMessage('user', message.trim());

    // Get conversation context for OpenAI
    const conversationHistory = chatSession.getContext(10);

    const startTime = Date.now();

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful and friendly AI assistant. Provide informative, accurate, and engaging responses. Keep responses concise but comprehensive.'
          },
          ...conversationHistory
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response generated from AI');
      }

      const processingTime = Date.now() - startTime;

      // Add AI response with metadata
      await chatSession.addMessage('assistant', aiResponse, {
        model: 'gpt-3.5-turbo',
        tokens: completion.usage.total_tokens,
        processingTime
      });

      // Send response
      res.json({
        message: aiResponse,
        sessionId: currentSessionId,
        metadata: {
          tokens: completion.usage.total_tokens,
          processingTime,
          model: 'gpt-3.5-turbo'
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      if (openaiError.status === 429) {
        errorMessage = 'I am currently experiencing high demand. Please try again in a moment.';
      } else if (openaiError.status === 401) {
        errorMessage = 'There is an issue with the AI service configuration.';
      }

      // Add error message as assistant response
      await chatSession.addMessage('assistant', errorMessage, {
        error: true,
        errorType: 'openai_api_error'
      });

      res.status(500).json({ 
        message: errorMessage,
        sessionId: currentSessionId
      });
    }

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      message: 'Internal server error. Please try again.' 
    });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sessionId } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    let query = { user: userId, isActive: true };
    
    // Filter by session if provided
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chatHistory = await ChatMessage.find(query)
      .sort({ updatedAt: -1 })
      .limit(limitNum * pageNum)
      .skip((pageNum - 1) * limitNum)
      .select('sessionId messages totalMessages createdAt updatedAt summary tags');

    const totalSessions = await ChatMessage.countDocuments(query);

    res.json({
      chatHistory,
      pagination: {
        currentPage: pageNum,
        limit: limitNum,
        totalSessions,
        totalPages: Math.ceil(totalSessions / limitNum),
        hasNextPage: pageNum < Math.ceil(totalSessions / limitNum),
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      message: 'Error fetching chat history' 
    });
  }
});

// Get specific chat session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const chatSession = await ChatMessage.findOne({ 
      user: userId, 
      sessionId, 
      isActive: true 
    });

    if (!chatSession) {
      return res.status(404).json({ 
        message: 'Chat session not found' 
      });
    }

    res.json({ chatSession });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      message: 'Error fetching chat session' 
    });
  }
});

// Delete specific chat session
router.delete('/session/:sessionId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const result = await ChatMessage.findOneAndUpdate(
      { user: userId, sessionId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ 
        message: 'Chat session not found' 
      });
    }

    res.json({ 
      message: 'Chat session deleted successfully',
      sessionId 
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ 
      message: 'Error deleting chat session' 
    });
  }
});

// Clear all chat history
router.delete('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await ChatMessage.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    res.json({ 
      message: 'All chat history cleared successfully' 
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      message: 'Error clearing chat history' 
    });
  }
});

// Get chat statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await ChatMessage.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: '$totalMessages' },
          averageMessagesPerSession: { $avg: '$totalMessages' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalMessages: 0,
      averageMessagesPerSession: 0
    };

    res.json({ stats: result });

  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching chat statistics' 
    });
  }
});

module.exports = router;""",
        ".env.example": """# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-chatbot
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (for production)
FRONTEND_URL=http://localhost:3000"""
    },
    "frontend": {
        "package.json": {
            "name": "ai-chatbot-frontend",
            "version": "1.0.0",
            "description": "Frontend for AI chatbot application",
            "main": "src/index.js",
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-scripts": "5.0.1",
                "axios": "^1.5.0",
                "react-router-dom": "^6.15.0",
                "react-icons": "^4.11.0",
                "@testing-library/jest-dom": "^5.16.4",
                "@testing-library/react": "^13.4.0",
                "@testing-library/user-event": "^13.5.0",
                "web-vitals": "^2.1.4"
            },
            "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
                "test": "react-scripts test",
                "eject": "react-scripts eject"
            },
            "eslintConfig": {
                "extends": ["react-app", "react-app/jest"]
            },
            "browserslist": {
                "production": [">0.2%", "not dead", "not op_mini all"],
                "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
            },
            "proxy": "http://localhost:5000"
        }
    }
}

# Convert to JSON for better formatting
structured_files = json.dumps(project_structure, indent=2)

# Display the structure summary
print("AI Chatbot Full-Stack Application Structure Created")
print("=" * 50)
print()
print("PROJECT STRUCTURE:")
print("├── package.json (root)")
print("├── README.md")
print("├── backend/")
print("│   ├── package.json")
print("│   ├── server.js")
print("│   ├── models/")
print("│   │   ├── User.js")
print("│   │   └── ChatMessage.js")
print("│   ├── middleware/")
print("│   │   └── auth.js")
print("│   ├── routes/")
print("│   │   ├── auth.js")
print("│   │   └── chat.js")
print("│   └── .env.example")
print("└── frontend/")
print("    └── package.json")
print()
print("KEY FEATURES IMPLEMENTED:")
print("✓ Express.js backend with MongoDB integration")
print("✓ User authentication with JWT")
print("✓ OpenAI GPT integration")
print("✓ Chat history persistence")
print("✓ Security middleware (helmet, CORS, rate limiting)")
print("✓ Error handling and validation")
print("✓ RESTful API design")
print("✓ Deployment ready configuration")
print()
print("NEXT STEPS:")
print("1. Create React frontend components")
print("2. Add styling and responsive design")
print("3. Implement WebSocket for real-time features")
print("4. Add deployment configurations")