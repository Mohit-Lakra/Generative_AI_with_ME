const express = require('express');
const multer = require('multer');
const Note = require('../models/Note');
const Chunk = require('../models/Chunk');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');
const aiClient = require('../services/aiClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // In-memory for MVP, ideal is object storage

router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).populate('topicId', 'label').sort({ createdAt: -1 });
    res.json(notes.map(n => ({
      _id: n._id,
      title: n.title,
      topicLabel: n.topicId ? n.topicId.label : null,
      status: n.status,
      createdAt: n.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId }).populate('topicId');
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, sourceType, text } = req.body;
    
    const note = new Note({
      userId: req.user.userId,
      title: title || 'Untitled Note',
      sourceType: sourceType || (req.file ? 'image' : 'typed'),
      rawText: text || '',
      status: 'processing'
    });
    
    await note.save();
    res.json({ noteId: note._id, status: 'processing' }); // Return immediately as per spec

    // Process in background
    let rawText = note.rawText;
    let confidence = null;

    if (req.file) {
      try {
        const base64File = req.file.buffer.toString('base64');
        const parseRes = await aiClient.parse(base64File, req.file.mimetype);
        rawText = parseRes.raw_text;
        confidence = parseRes.confidence;

        if (confidence < 60) {
          note.status = 'failed';
          note.ocrConfidence = confidence;
          await note.save();
          return; // Stop processing
        }
      } catch (e) {
        note.status = 'failed';
        await note.save();
        return;
      }
    }

    try {
      // Embedding & Clustering
      const embedRes = await aiClient.embed(note._id.toString(), req.user.userId.toString(), rawText);
      
      // Upsert Topic
      let topic = await Topic.findOne({ _id: embedRes.topic_id });
      if (!topic) {
        topic = new Topic({
          _id: embedRes.topic_id,
          userId: req.user.userId,
          label: embedRes.topic_label,
          noteIds: [],
          chunkCount: 0
        });
      }
      if (!topic.noteIds.includes(note._id)) {
        topic.noteIds.push(note._id);
      }
      topic.label = embedRes.topic_label; // update label from LLM
      topic.chunkCount += embedRes.chunks.length;
      await topic.save();

      // Save chunks
      const chunkDocs = embedRes.chunks.map(c => ({
        _id: c.chunk_id, // assuming fastapi returns objectids or valid strings
        noteId: note._id,
        userId: req.user.userId,
        topicId: topic._id,
        text: c.text,
        vectorId: c.vector_id
      }));
      await Chunk.insertMany(chunkDocs);

      // Update Note
      note.rawText = rawText;
      note.ocrConfidence = confidence;
      note.topicId = topic._id;
      note.status = 'ready';
      await note.save();

    } catch (e) {
      console.error(e);
      note.status = 'failed';
      await note.save();
    }

  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
