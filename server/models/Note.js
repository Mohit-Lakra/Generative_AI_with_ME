const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  sourceType: { type: String, enum: ['typed', 'image', 'pdf'], required: true },
  rawText: { type: String, required: true },
  ocrConfidence: { type: Number, default: null },
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  fileUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
