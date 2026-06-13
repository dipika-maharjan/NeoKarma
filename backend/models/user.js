const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  grade: { 
    type: Number, 
    required: true,
    default: 8, 
    min: 8, 
    max: 12 // Targeted demographic: Grades 8-12 
  },
  schoolName: { 
    type: String, 
    required: true,
    default: "abc",
    trim: true // Target: Urban private schools in Kathmandu & beyond [cite: 18, 198]
  },
  streakCount: { 
    type: Number, 
    default: 0 // Tied directly to daily streak maintenance and school grading [cite: 28, 42]
  },
  lastLoggedDate: { 
    type: String, 
    default: null // Format stored explicitly as 'YYYY-MM-DD' to prevent ISO timezone issues
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);