const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }, // optional, depending on generation
  question: { type: String, required: true },
  answer: { type: String, required: true },
  easinessFactor: { type: Number, default: 2.5 },
  repetitionNumber: { type: Number, default: 0 },
  intervalDays: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now, index: true },
  lastReviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
