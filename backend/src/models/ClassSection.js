/**
 * ClassSection Model
 * Represents a grade/section grouping within one school
 */
const mongoose = require('mongoose');

const ClassSectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    grade: {
      type: Number,
      required: true,
      min: 8,
      max: 12
    },
    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

ClassSectionSchema.index({ schoolId: 1, grade: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('ClassSection', ClassSectionSchema);
