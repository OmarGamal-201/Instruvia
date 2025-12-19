const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
passwordResetTokenSchema.index({ token: 1 }); // For token lookup
passwordResetTokenSchema.index({ user: 1 }); // For user's tokens lookup
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
passwordResetTokenSchema.index({ isUsed: 1 }); // For unused token lookup
passwordResetTokenSchema.index({ user: 1, isUsed: 1 }); // Compound index for user's unused tokens

// Method to check if token is expired
passwordResetTokenSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
