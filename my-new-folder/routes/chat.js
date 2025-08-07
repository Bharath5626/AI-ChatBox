const express = require('express');
const { auth } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST /api/chat
router.post('/', async (req, res) => {

  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const currentSessionId = sessionId || uuidv4();

    let chat = await ChatMessage.findOne({ user: req.user._id, sessionId: currentSessionId });

    if (!chat) {
      chat = new ChatMessage({
        user: req.user._id,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Save user message
    await chat.addMessage('user', message.trim());

    const conversation = chat.getContext(10);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly assistant helping with everyday conversations.'
        },
        ...conversation
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const aiReply = completion.choices[0].message.content;

    await chat.addMessage('assistant', aiReply, {
      model: 'gpt-3.5-turbo',
      tokens: completion.usage.total_tokens
    });

    res.json({
      message: aiReply,
      sessionId: currentSessionId
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Something went wrong talking to the AI.' });
  }
});

module.exports = router;
