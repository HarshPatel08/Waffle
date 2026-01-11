const mongoose = require('mongoose');

const vlogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    // GCS storage info
    gcsPath: {
      type: String,
      required: true, // e.g., 'groups/groupId/userId/timestamp.mp4'
    },
    publicUrl: {
      type: String,
      required: true,
    },
    // Metadata
    duration: {
      type: Number, // seconds
      required: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    // Processing status
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
    },
    // View tracking
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
vlogSchema.index({ groupId: 1, createdAt: -1 });
vlogSchema.index({ userId: 1, createdAt: -1 });
vlogSchema.index({ status: 1 });

module.exports = mongoose.model('Vlog', vlogSchema);
