/**
 * User Model
 * Represents a student or school admin in the Neoकर्म system
 */
const mongoose = require('mongoose');

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
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'school_admin'],
      default: 'student',
      required: true
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    grade: {
      type: Number,
      min: [8, 'Grade must be between 8 and 12'],
      max: [12, 'Grade must be between 8 and 12']
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    locationType: {
      type: String,
      enum: ['urban', 'rural']
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters']
    },
    extraProfile: {
      questionKey: {
        type: String,
        default: null
      },
      value: {
        type: mongoose.Schema.Types.Mixed
      }
    },
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
        type: String,
        default: null
      },
      participationScore: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    practicalMarks: {
      currentStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      longestStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      totalLogDays: {
        type: Number,
        default: 0,
        min: 0
      },
      marksAwarded: {
        type: Number,
        default: 0,
        min: 0
      },
      lastSyncedAt: {
        type: Date,
        default: null
      },
      manualOverride: {
        value: {
          type: Number,
          default: null
        },
        updatedBy: {
          type: String,
          default: null
        },
        updatedAt: {
          type: Date,
          default: null
        }
      }
    },
    personalizedUnlockedAt: {
      type: Date,
      default: null
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
