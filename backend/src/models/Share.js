/**
 * Share Model
 * Stores shareable achievement links for public viewing
 * Each user can have multiple share IDs (for different snapshots in time)
 */
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ShareSchema = new mongoose.Schema(
  {
    /**
     * Unique share ID (used in URL: /share/[shareId])
     * Generated using nanoid for URL-safe, collision-resistant IDs
     */
    shareId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true
    },

    /**
     * Reference to the User being shared
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },

    /**
     * Custom message user can add when sharing (optional)
     */
    customMessage: {
      type: String,
      maxlength: [200, 'Message cannot exceed 200 characters'],
      default: null
    },

    /**
     * When this share link was generated
     */
    createdAt: {
      type: Date,
      default: Date.now
    },

    /**
     * Optional expiration date (if we want share links to expire)
     * Null = never expires
     */
    expiresAt: {
      type: Date,
      default: null
    },

    /**
     * Whether this share link is active
     * Allows users to disable sharing without deleting the record
     */
    isActive: {
      type: Boolean,
      default: true
    },

    /**
     * View count for analytics (optional)
     */
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

/**
 * Ensure one active share per user (simplifies UI: "Share My Progress" button)
 * If user generates a new share, the old one becomes inactive
 */
ShareSchema.index({ userId: 1, isActive: 1 }, { sparse: true });

module.exports = mongoose.model('Share', ShareSchema);
