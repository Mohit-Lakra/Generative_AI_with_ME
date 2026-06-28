require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const doubtsRoutes = require('./routes/doubts');
const flashcardsRoutes = require('./routes/flashcards');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/doubts', doubtsRoutes);
app.use('/api/flashcards', flashcardsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NoteSense API is running!' });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
  });
