const mongoose = require('mongoose');

const DoubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  citations: [{
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    chunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chunk' },
    snippet: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doubt', DoubtSchema);
