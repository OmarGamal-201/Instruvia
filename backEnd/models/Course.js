const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Programming', 'Design', 'Business', 'Marketing',
      'Photography', 'Music', 'Data Science', 'Personal Development',
      'Health & Fitness', 'Language', 'Academic', 'Other'
    ]
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  previewVideo: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'English'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  lessons: [{
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Lesson title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Lesson description cannot exceed 500 characters']
    },
    videoUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    resources: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['pdf', 'doc', 'link', 'other'],
        default: 'other'
      }
    }]
  }],
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true,
    maxlength: [200, 'Learning outcome cannot exceed 200 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
  }],
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text', description: 'text' }); // For search

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for total lessons
courseSchema.virtual('totalLessons').get(function() {
  return this.lessons.length;
});

// Method to calculate course rating
courseSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Method to check if user is enrolled
courseSchema.methods.isEnrolled = function(studentId) {
  return this.enrolledStudents.some(enrollment =>
    enrollment.student.toString() === studentId.toString()
  );
};

// Method to enroll a student
courseSchema.methods.enrollStudent = function(studentId) {
  if (this.isEnrolled(studentId)) {
    throw new Error('Student is already enrolled');
  }

  this.enrolledStudents.push({
    student: studentId,
    enrolledAt: new Date(),
    progress: 0,
    completedLessons: [],
    lastAccessedAt: new Date()
  });

  return this.save();
};

// Method to update student progress
courseSchema.methods.updateProgress = function(studentId, lessonId) {
  const enrollment = this.enrolledStudents.find(enrollment =>
    enrollment.student.toString() === studentId.toString()
  );

  if (!enrollment) {
    throw new Error('Student not enrolled in this course');
  }

  // Check if lesson is already completed
  const lessonCompleted = enrollment.completedLessons.find(
    lesson => lesson.lessonId.toString() === lessonId.toString()
  );

  if (!lessonCompleted) {
    enrollment.completedLessons.push({
      lessonId: lessonId,
      completedAt: new Date()
    });
  }

  // Update progress
  enrollment.progress = Math.round((enrollment.completedLessons.length / this.lessons.length) * 100);
  enrollment.lastAccessedAt = new Date();

  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
