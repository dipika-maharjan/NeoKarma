/**
 * EmissionFactor Model
 * Stores configurable, seedable emission factors (not hardcoded)
 * Sourced from IPCC, UNFCCC, AsianTransportObservatory, etc.
 * This allows carbon mentors to update values without code changes
 */
const mongoose = require('mongoose');

const EmissionFactorSchema = new mongoose.Schema(
  {
    /**
     * Category: 'transportation', 'food', 'waste', 'energy'
     */
    category: {
      type: String,
      enum: ['transportation', 'food', 'waste', 'energy'],
      required: [true, 'Category is required']
    },

    /**
     * Sub-type within category
     * Examples:
     * - transportation: 'walk', 'bicycle', 'bus', 'motorbike', 'car'
     * - food: 'vegetarian', 'non-vegetarian', 'vegan'
     * - waste: 'plastic', 'paper', 'organic'
     * - energy: 'electricity', 'lpg', 'biomass'
     */
    subType: {
      type: String,
      required: [true, 'Sub-type is required']
    },

    /**
     * The actual emission factor value
     */
    factorValue: {
      type: Number,
      required: [true, 'Factor value is required'],
      min: [0, 'Factor value cannot be negative']
    },

    /**
     * Unit of measurement (e.g., 'kg CO2/km', 'kg CO2/meal', 'kg CO2/kg waste')
     */
    unit: {
      type: String,
      required: [true, 'Unit is required']
    },

    /**
     * Source of the emission factor for transparency
     */
    source: {
      type: String,
      enum: ['IPCC', 'UNFCCC', 'AsianTransportObservatory', 'LocalResearch', 'Other'],
      required: [true, 'Source is required']
    },

    /**
     * Version number for tracking historical changes
     */
    version: {
      type: Number,
      default: 1
    },

    /**
     * When this factor becomes effective
     */
    effectiveDate: {
      type: Date,
      default: Date.now
    },

    /**
     * Whether this factor is currently active
     */
    isActive: {
      type: Boolean,
      default: true
    },

    /**
     * Notes or context about the factor
     */
    notes: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

/**
 * Ensure only one active factor per category-subType pair
 */
EmissionFactorSchema.index({ category: 1, subType: 1, isActive: 1 }, { sparse: true });

module.exports = mongoose.model('EmissionFactor', EmissionFactorSchema);
