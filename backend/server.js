require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const { uploadToAzure } = require('./services/azureStorage');
const WoundEntry = require('./models/WoundEntry');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
}

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 2. Upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { userId, symptoms } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'No userId provided' });
    }

    // Parse symptoms (expecting a stringified JSON array, e.g. '["Redness", "Swelling"]')
    let parsedSymptoms = [];
    if (symptoms) {
      try {
        parsedSymptoms = JSON.parse(symptoms);
        if (!Array.isArray(parsedSymptoms)) {
          parsedSymptoms = [symptoms]; // Fallback if it's just a single raw string
        }
      } catch (e) {
        // Fallback for comma separated string or single string
        if (typeof symptoms === 'string') {
          parsedSymptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          parsedSymptoms = [];
        }
      }
    }

    // Upload to Azure
    const imageUrl = await uploadToAzure(file.buffer, file.originalname);

    // Save to Database
    const newEntry = new WoundEntry({
      userId,
      imageUrl,
      symptoms: parsedSymptoms,
    });

    const savedEntry = await newEntry.save();

    res.status(200).json({ success: true, entry: savedEntry });

  } catch (error) {
    console.error('Error in /api/upload:', error);
    res.status(500).json({ success: false, error: 'An error occurred during upload' });
  }
});

// 3. User entries endpoint
app.get('/api/wounds/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Query entries
    const entries = await WoundEntry.find({ userId })
      .sort({ createdAt: -1 }) // Sort newest first
      .exec();

    res.status(200).json(entries);

  } catch (error) {
    console.error(`Error fetching wounds for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch wound entries' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
