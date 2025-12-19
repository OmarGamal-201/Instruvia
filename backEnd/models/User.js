const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const disposable = require("disposable-email-domains");
const { number } = require("joi");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username is already used"],
    trim: true,
    minLength: [3, "Username must be at least 3 characters long"],
    maxLength: [30, "Username cannot exceed 30 characters"],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, spaces, underscores and hyphens",
    ],

    validate: {
      validator: function (v) {
        const prohibited = ["admin", "root", "system", "moderator"];
        return !prohibited.includes(v.toLowerCase());
      },
      message: "This username is not allowed",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    validate: {
      validator: function (email) {
        const domain = email.split("@")[1];
        return !disposable.includes(domain); // returns true if NOT disposable
      },
      message: "Disposable email addresses are not allowed",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters long"],
    validate: {
      validator: function (v) {
        // Must contain at least one uppercase, one lowercase, one number, one special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          v
        );
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    },
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  bio: { type: String },
  specialization: { type: String, default: "student" },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Accept:
        // +2010XXXXXXXX
        // 010XXXXXXXX
        return /^(\+20|0)?1[0-2,5]\d{8}$/.test(v);
      },
      message: "Invalid phone number",
    },
  },
  isInstructorRequest:{ type: Boolean, default: false },
  isInstructorApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  enrolledCourses: { type: Number, default: 0 },
  upcomingSessions: { type: Number, default: 0 },
  certificatesEarned: { type: Number, default: 0 },
  learningStreakDays: { type: Number, default: 0 },
});

// Indexes for performance
// UserSchema.index({ email: 1 }); // Unique index for email lookups
UserSchema.index({ role: 1 }); // For filtering by role
UserSchema.index({ isInstructorApproved: 1 }); // For instructor approval queries
UserSchema.index({ createdAt: -1 }); // For sorting by creation date
UserSchema.index({ role: 1, isInstructorApproved: 1 }); // Compound index for instructor queries

// Hash password before save if modified/new
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
