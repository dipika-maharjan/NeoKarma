/**
 * DailyLog Model
 * Represents one day's carbon footprint submission for a student
 * Unique constraint: one log per user per day
 */
const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    /**
     * Date of the log in YYYY-MM-DD format (local timezone)
     */
    date: {
      type: String,
      required: [true, 'Date is required']
    },

    /**
     * User-submitted inputs for the four core categories
     */
    transportation: {
      mode: {
        type: String,
        enum: ['walk', 'bicycle', 'bus', 'motorbike', 'car'],
        required: [true, 'Transportation mode is required']
      },
      distanceKm: {
        type: Number,
        required: [true, 'Distance in km is required'],
        min: [0, 'Distance cannot be negative']
      }
    },

    food: {
      mealType: {
        type: String,
        enum: ['vegetarian', 'mixed', 'non-vegetarian', 'vegan'],
        required: [true, 'Meal type is required']
      },
      foodWasteGrams: {
        type: Number,
        default: 0,
        min: [0, 'Food waste cannot be negative']
      }
    },

    wasteAndPlastic: {
      plasticItemCount: {
        type: Number,
        required: [true, 'Plastic item count is required'],
        min: [0, 'Plastic item count cannot be negative']
      },
      segregated: {
        type: Boolean,
        default: false
      }
    },

    energy: {
      /**
       * For urban students: appliance hours (e.g., screen time, TV, lights)
       * For rural students: classroom energy score or community energy usage
       */
      usageHours: {
        type: Number,
        required: [true, 'Energy usage is required'],
        min: [0, 'Energy usage cannot be negative']
      }
    },

    /**
     * Extra answer for urban/rural-specific question
     * Mirrors the User.extraProfile slot
     */
    extraAnswer: {
      questionKey: {
        type: String,
        default: null
      },
      value: {
        type: mongoose.Schema.Types.Mixed
      }
    },

    /**
     * Computed emission breakdown by category (in kg CO2)
     * NOT user-supplied, calculated by emissionCalculation service
     */
    breakdown: {
      transportKg: {
        type: Number,
        required: true,
        default: 0
      },
      foodKg: {
        type: Number,
        required: true,
        default: 0
      },
      wasteKg: {
        type: Number,
        required: true,
        default: 0
      },
      energyKg: {
        type: Number,
        required: true,
        default: 0
      }
    },

    /**
     * Total daily emissions in kg CO2 (computed)
     */
    totalEmissionKg: {
      type: Number,
      required: true,
      default: 0
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/**
 * Unique index: one log per user per day
 * Enforced at database level
 */
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
