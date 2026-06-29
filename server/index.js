require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const doubtsRoutes = require('./routes/doubts');
const flashcardsRoutes = require('./routes/flashcards');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiter: max 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/doubts', doubtsRoutes);
app.use('/api/flashcards', flashcardsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NoteSense API is running!' });
});

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    startServer();
  } catch (err) {
    console.log('⚠️ Failed to connect to local MongoDB. Starting Demo In-Memory Database instead...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to Demo In-Memory MongoDB');
      startServer();
    } catch (memErr) {
      console.error('❌ Failed to start Demo Database', memErr);
    }
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

connectDB();
