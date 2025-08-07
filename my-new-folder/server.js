const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(helmet());
app.use(cors()); // Temporarily allow all origins


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server running', time: new Date().toISOString() });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
