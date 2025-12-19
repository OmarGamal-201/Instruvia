const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const InstructorApplication = require('../models/InstructorApplication');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendPasswordResetEmail } = require('../utils/emailService');

// create JWT
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, role: 'student' });
    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me (protected)
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role bio phone specialization isInstructorApproved createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/apply-instructor (protected)
exports.applyInstructor = async (req, res) => {
  try {
    const { bio, specialization, documents } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'student') {
      return res.status(400).json({ message: 'Only students can apply for instructor status' });
    }

    // Check if user already has a pending application
    const existingApplication = await InstructorApplication.findOne({
      applicant: user._id,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You already have a pending instructor application' });
    }

    // Create new instructor application
    const application = await InstructorApplication.create({
      applicant: user._id,
      bio,
      specialization,
      documents: documents || []
    });

    return res.status(201).json({
      success: true,
      message: 'Instructor application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await PasswordResetToken.deleteMany({ user: user._id }); // Remove any existing tokens
    await PasswordResetToken.create({
      user: user._id,
      token: resetToken,
      expiresAt,
    });

    // Send email
    const emailSent = await sendPasswordResetEmail(user, resetToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token,
      isUsed: false,
    });

    if (!resetToken || resetToken.isExpired()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find user and update password
    const user = await User.findById(resetToken.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    // Mark token as used
    resetToken.isUsed = true;
    await resetToken.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
