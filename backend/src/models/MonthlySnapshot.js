/**
 * MonthlySnapshot Model
 * Cached monthly aggregates for fast Carbon Mirror and history queries
 * Powers the Impact History screen without recomputing every time
 */
const mongoose = require('mongoose');

const MonthlySnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    /**
     * Month in YYYY-MM format (e.g., "2024-06")
     */
    month: {
      type: String,
      required: [true, 'Month is required']
    },

    /**
     * Total CO2 emissions for this month in kg
     */
    totalEmissionKg: {
      type: Number,
      required: true,
      default: 0
    },

    /**
     * Number of logs submitted in this month
     */
    logsCount: {
      type: Number,
      default: 0,
      min: 0
    },

    /**
     * Breakdown by category
     */
    breakdown: {
      transportKg: {
        type: Number,
        default: 0
      },
      foodKg: {
        type: Number,
        default: 0
      },
      wasteKg: {
        type: Number,
        default: 0
      },
      energyKg: {
        type: Number,
        default: 0
      }
    },

    /**
     * Tree equivalent for this month's emissions
     * Calculated as: totalEmissionKg / (KG_CO2_PER_TREE_PER_YEAR / 12)
     */
    treeEquivalentKg: {
      type: Number,
      default: 0
    },

    /**
     * Comparison with previous month
     */
    comparedToPreviousMonth: {
      deltaKg: {
        type: Number,
        default: 0
      },
      /**
       * improved: emissions reduced vs last month
       * worsened: emissions increased vs last month
       * noData: no previous month to compare
       */
      direction: {
        type: String,
        enum: ['improved', 'worsened', 'noData'],
        default: 'noData'
      }
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/**
 * Unique index: one snapshot per user per month
 */
MonthlySnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySnapshot', MonthlySnapshotSchema);
