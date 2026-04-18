const mongoose = require('mongoose');

const woundEntrySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  symptoms: { 
    type: [String], 
    default: [] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('WoundEntry', woundEntrySchema);
