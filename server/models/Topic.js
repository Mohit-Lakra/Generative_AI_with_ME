const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, required: true },
  noteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  chunkCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', TopicSchema);
