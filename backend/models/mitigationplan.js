const mongoose = require('mongoose');

const MitigationPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  generatedDate: { 
    type: Date, 
    default: Date.now 
  },
  durationDays: { 
    type: Number, 
    default: 30 // Validated 1-Month Plan commitment scope [cite: 56, 58]
  },
  recommendations: [{
    category: { 
      type: String, 
      enum: ['transport', 'food', 'waste', 'energy'],
      required: true
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    estimatedCO2ReductionKG: { 
      type: Number, 
      required: true 
    },
    effortLevel: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'],
      required: true
    }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('MitigationPlan', MitigationPlanSchema);