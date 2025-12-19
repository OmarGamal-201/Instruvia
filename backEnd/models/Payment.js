const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  platformCommission: {
    type: Number,
    required: [true, 'Platform commission is required'],
    min: [0, 'Platform commission cannot be negative']
  },
  instructorAmount: {
    type: Number,
    required: [true, 'Instructor amount is required'],
    min: [0, 'Instructor amount cannot be negative']
  },
  platformCommissionRate: {
    type: Number,
    default: 0.20, // 20% default commission
    min: 0,
    max: 1
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  paymentIntentId: {
    type: String,
    required: [true, 'Payment intent ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal'],
    default: 'card'
  },
  metadata: {
    type: Map,
    of: String
  },
  failureReason: {
    type: String,
    trim: true
  },
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
paymentSchema.index({ user: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ course: 1, status: 1 });

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate commission if not already set
  if (this.isModified('amount') && (!this.platformCommission || !this.instructorAmount)) {
    this.platformCommissionRate = this.platformCommissionRate || 0.20;
    this.platformCommission = Math.round(this.amount * this.platformCommissionRate * 100) / 100;
    this.instructorAmount = Math.round((this.amount - this.platformCommission) * 100) / 100;
  }
  
  next();
});

// Ensure user can't pay for the same course multiple times
paymentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
