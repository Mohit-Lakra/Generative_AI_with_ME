const express = require('express');
const Doubt = require('../models/Doubt');
const auth = require('../middleware/auth');
const aiClient = require('../services/aiClient');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    // Call FastAPI service
    const askRes = await aiClient.ask(req.user.userId.toString(), question);
    
    const doubt = new Doubt({
      userId: req.user.userId,
      question,
      answer: askRes.answer,
      citations: askRes.citations // Assuming FastAPI returns { note_id, chunk_id, snippet }
    });
    await doubt.save();

    res.json({ answer: askRes.answer, citations: askRes.citations, grounded: askRes.grounded });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
