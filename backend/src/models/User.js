/**
 * User Model
 * Represents a student in the Neoकर्म system
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      min: [8, 'Grade must be between 8 and 12'],
      max: [12, 'Grade must be between 8 and 12']
    },
    locationType: {
      type: String,
      enum: ['urban', 'rural'],
      required: [true, 'Location type (urban/rural) is required']
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters']
    },
    /**
     * Data-driven extra profile slot for urban/rural-specific questions
     * Example: { questionKey: "internetUsageHours", value: 5 }
     * Or: { questionKey: "cookingFuelType", value: "lpg" }
     * The questionKey can be updated via API without schema migration
     */
    extraProfile: {
      questionKey: {
        type: String,
        default: null
      },
      value: {
        type: mongoose.Schema.Types.Mixed // Can be string, number, boolean, etc.
      }
    },

    /**
     * Streak tracking and participation metrics
     */
    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      longest: {
        type: Number,
        default: 0,
        min: 0
      },
      lastLogDate: {
        type: String, // Format: YYYY-MM-DD
        default: null
      },
      participationScore: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
