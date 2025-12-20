const User = require('../models/User');
const InstructorApplication = require('../models/InstructorApplication');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const mongoose = require('mongoose');


// GET /api/admin/users - Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isInstructorApproved !== undefined) {
      filter.isInstructorApproved = req.query.isInstructorApproved === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(users, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/users/:id - Get single user details (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id - Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, bio, specialization, isInstructorApproved } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (specialization !== undefined) user.specialization = specialization;
    if (isInstructorApproved !== undefined) user.isInstructorApproved = isInstructorApproved;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        specialization: user.specialization,
        isInstructorApproved: user.isInstructorApproved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/users/:id - Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/stats - Get dashboard statistics (admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingInstructors = await User.countDocuments({
      role: 'student',
      isInstructorRequest: true
    });
    const approvedInstructors = await User.countDocuments({
      role: 'instructor',
      isInstructorApproved: true
    });

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        pendingInstructors,
        approvedInstructors
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/instructors/pending - Get pending instructor applications
exports.getPendingInstructors = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const instructors = await User.find({
      role: 'student',
      isInstructorRequest: true
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      role: 'student',
      isInstructorRequest: true
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(instructors, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/instructor-applications - Get all instructor applications
exports.getInstructorApplications = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const applications = await InstructorApplication.find(filter)
      .populate('applicant', 'name email createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InstructorApplication.countDocuments(filter);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(applications, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/instructor-applications/:id - Get single instructor application
exports.getInstructorApplicationById = async (req, res) => {
  try {
    const application = await InstructorApplication.findById(req.params.id)
      .populate('applicant', 'name email role createdAt')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/instructor-applications/:id/approve - Approve instructor application
exports.approveInstructorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;
    console.log("ID:", req.params.id);
console.log("Valid ObjectId:", mongoose.Types.ObjectId.isValid(req.params.id));


    const application = await InstructorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been reviewed' });
    }

    const user = await User.findById(application.applicant);
    if (!user) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    const action = approved ? 'approved' : 'rejected';
    // Update application
    application.status = approved ? 'approved' : 'rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    if (!approved && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // Update user role and approval status
    if (approved) {
      user.role = 'instructor';
      user.isInstructorApproved = true;
      user.bio = application.bio;
      user.specialization = application.specialization;
    }

    await user.save();



    res.status(200).json({
      success: true,
      message: `Instructor application ${action} successfully`,
      application,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isInstructorApproved: user.isInstructorApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
