const mongoose = require('mongoose');

const instructorApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [200, 'Specialization cannot exceed 200 characters']
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['certificate', 'id_proof', 'professional_document', 'other']
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
instructorApplicationSchema.index({ applicant: 1 });
instructorApplicationSchema.index({ status: 1 });
instructorApplicationSchema.index({ submittedAt: -1 });
instructorApplicationSchema.index({ reviewedBy: 1 });

// Compound indexes
instructorApplicationSchema.index({ applicant: 1, status: 1 });

// Update the updatedAt field before saving
instructorApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure user can only have one pending application
instructorApplicationSchema.index({ applicant: 1, status: 'pending' }, { unique: true });

module.exports = mongoose.model('InstructorApplication', instructorApplicationSchema);
