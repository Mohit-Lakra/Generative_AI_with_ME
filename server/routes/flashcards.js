const express = require('express');
const Flashcard = require('../models/Flashcard');
const auth = require('../middleware/auth');
const sm2 = require('../services/sm2');

const router = express.Router();

router.get('/due', auth, async (req, res) => {
  try {
    const cards = await Flashcard.find({ 
      userId: req.user.userId,
      nextReviewDate: { $lte: new Date() }
    });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/review', auth, async (req, res) => {
  try {
    const { quality } = req.body; // 0-5
    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });

    const sm2Result = sm2.updateSM2(quality, card.easinessFactor, card.repetitionNumber, card.intervalDays);
    
    card.easinessFactor = sm2Result.easinessFactor;
    card.repetitionNumber = sm2Result.repetitionNumber;
    card.intervalDays = sm2Result.intervalDays;
    card.nextReviewDate = sm2Result.nextReviewDate;
    card.lastReviewedAt = new Date();

    await card.save();
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
