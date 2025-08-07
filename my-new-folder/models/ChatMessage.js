const mongoose = require('mongoose');

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
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000
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

// Keep message count updated
chatMessageSchema.pre('save', function (next) {
  this.totalMessages = this.messages.length;
  next();
});

// Add a new message
chatMessageSchema.methods.addMessage = function (role, content, metadata = {}) {
  this.messages.push({ role, content, metadata, timestamp: new Date() });
  return this.save();
};

// Get last few messages (context for OpenAI)
chatMessageSchema.methods.getContext = function (maxMessages = 10) {
  return this.messages.slice(-maxMessages).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
