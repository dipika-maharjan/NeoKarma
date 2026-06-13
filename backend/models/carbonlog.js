const mongoose = require('mongoose');

const CarbonLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: String, 
    required: true // Format: 'YYYY-MM-DD' to group metrics perfectly on daily records
  },
  inputs: {
    transportType: { 
      type: String, 
      enum: ['walk', 'bicycle', 'bus', 'motorbike', 'car'], 
      required: true 
    },
    transportDistanceKM: { 
      type: Number, 
      default: 0 
    },
    mealsServed: { 
      type: String, 
      enum: ['vegetarian', 'non-vegetarian', 'vegan'], 
      required: true 
    },
    wasteGeneratedKG: { 
      type: Number, 
      default: 0 
    },
    energyUsageKWH: { 
      type: Number, 
      default: 0 
    }
  },
  emissions: {
    transportCO2: { type: Number, required: true }, // Computed in kg CO2
    foodCO2: { type: Number, required: true },
    wasteCO2: { type: Number, required: true },
    energyCO2: { type: Number, required: true },
    totalCO2: { type: Number, required: true }
  }
}, { 
  timestamps: true 
});

// Compound index to guarantee a student can create only ONE unique submission per day
CarbonLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CarbonLog', CarbonLogSchema);