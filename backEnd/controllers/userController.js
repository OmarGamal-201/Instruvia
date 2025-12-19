const User = require("../models/User");
const Course = require("../models/Course");

const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../utils/pagination");

// PUT /api/users/profile - Update user profile
exports.updateProfile = async (req, res) => {
  try {
    
    const { name, bio, phone, specialization } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        specialization: user.specialization,
        isInstructorApproved: user.isInstructorApproved,
        createdAt: user.createdAt,
        enrolledCourses: user.enrolledCourses,
        upcomingSessions: user.upcomingSessions,
        certificatesEarned: user.certificatesEarned,
        learningStreakDays: user.learningStreakDays,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/dashboard - Get user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with basic info
    const user = await User.findById(userId).select(
      "name email role enrolledCourses upcomingSessions certificatesEarned learningStreakDays"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get enrolled courses with progress
    const enrolledCourses = await Course.find({
      "enrolledStudents.student": userId,
      status: "published",
    })
      .select("title description instructor lessons enrolledStudents thumbnail category")
      .populate("instructor", "name specialization")
      .lean();

    // Extract enrollment data for current user
    const coursesWithProgress = enrolledCourses.map((course) => {
      const enrollment = course.enrolledStudents.find(
        (e) => e.student.toString() === userId.toString()
      );

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor?.name || "Unknown",
        instructorSpecialization: course.instructor?.specialization,
        thumbnail: course.thumbnail,
        category: course.category,
        totalLessons: course.lessons.length,
        completedLessons: enrollment?.completedLessons.length || 0,
        progress: enrollment?.progress || 0,
        lastAccessedAt: enrollment?.lastAccessedAt,
        enrolledAt: enrollment?.enrolledAt,
      };
    });

    // Sort by last accessed for "Continue Learning"
    const continueLearning = coursesWithProgress
      .filter((c) => c.progress > 0 && c.progress < 100)
      .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
      .slice(0, 3);

    // Get recently accessed courses for activity feed
    const recentActivity = coursesWithProgress
      .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
      .slice(0, 5)
      .map((course) => ({
        title: course.title,
        subtitle: `${course.completedLessons} of ${course.totalLessons} lessons completed`,
        instructor: course.instructor,
        time: getRelativeTime(course.lastAccessedAt),
        type: "course",
      }));

    // Get recommended courses (not enrolled, same category as enrolled courses)
    const enrolledCategories = [...new Set(enrolledCourses.map((c) => c.category))];
    const recommendedCourses = await Course.find({
      status: "published",
      "enrolledStudents.student": { $ne: userId },
      ...(enrolledCategories.length > 0 && {
        category: { $in: enrolledCategories },
      }),
    })
      .select("title instructor rating thumbnail")
      .populate("instructor", "name")
      .sort({ "rating.average": -1 })
      .limit(4)
      .lean();

    const recommended = recommendedCourses.map((course) => ({
      _id: course._id,
      title: course.title,
      instructor: course.instructor?.name || "Unknown",
      rating: course.rating.average.toFixed(1),
      thumbnail: course.thumbnail,
    }));

    // Statistics
    const stats = {
      enrolledCourses: coursesWithProgress.length,
      upcomingSessions: user.upcomingSessions || 0,
      certificatesEarned: coursesWithProgress.filter((c) => c.progress === 100).length,
      learningStreakDays: user.learningStreakDays || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        stats,
        continueLearning,
        recentActivity,
        recommended,
        consultations: [], // Placeholder for consultation feature
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/enrolled-courses - Get all enrolled courses with details
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, sort = "recent" } = req.query;

    // Build query
    const query = {
      "enrolledStudents.student": userId,
      status: "published",
    };

    // Get courses
    let courses = await Course.find(query)
      .select("title description instructor lessons enrolledStudents thumbnail category rating duration")
      .populate("instructor", "name specialization")
      .lean();

    // Process and filter courses
    const processedCourses = courses
      .map((course) => {
        const enrollment = course.enrolledStudents.find(
          (e) => e.student.toString() === userId.toString()
        );

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          instructor: {
            name: course.instructor?.name || "Unknown",
            specialization: course.instructor?.specialization,
          },
          thumbnail: course.thumbnail,
          category: course.category,
          rating: course.rating.average,
          ratingCount: course.rating.count,
          duration: course.duration,
          totalLessons: course.lessons.length,
          completedLessons: enrollment?.completedLessons.length || 0,
          progress: enrollment?.progress || 0,
          lastAccessedAt: enrollment?.lastAccessedAt,
          enrolledAt: enrollment?.enrolledAt,
          status: enrollment?.progress === 100 ? "completed" : 
                  enrollment?.progress > 0 ? "in-progress" : "not-started",
        };
      })
      .filter((course) => {
        if (!status) return true;
        return course.status === status;
      });

    // Sort courses
    switch (sort) {
      case "recent":
        processedCourses.sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt));
        break;
      case "progress":
        processedCourses.sort((a, b) => b.progress - a.progress);
        break;
      case "title":
        processedCourses.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    res.status(200).json({
      success: true,
      count: processedCourses.length,
      courses: processedCourses,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/course-progress/:courseId - Get specific course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .select("title lessons enrolledStudents")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = course.enrolledStudents.find(
      (e) => e.student.toString() === userId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    // Map lessons with completion status
    const lessonsWithStatus = course.lessons.map((lesson) => ({
      _id: lesson._id,
      title: lesson.title,
      duration: lesson.duration,
      order: lesson.order,
      isCompleted: enrollment.completedLessons.some(
        (cl) => cl.lessonId.toString() === lesson._id.toString()
      ),
      completedAt: enrollment.completedLessons.find(
        (cl) => cl.lessonId.toString() === lesson._id.toString()
      )?.completedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        progress: enrollment.progress,
        totalLessons: course.lessons.length,
        completedLessons: enrollment.completedLessons.length,
        lessons: lessonsWithStatus,
        lastAccessedAt: enrollment.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  } catch (error) {
    console.error("Get course progress error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/certificates - Get earned certificates
exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all completed courses
    const completedCourses = await Course.find({
      "enrolledStudents.student": userId,
      status: "published",
    })
      .select("title description instructor lessons enrolledStudents category thumbnail")
      .populate("instructor", "name specialization")
      .lean();

    // Filter only 100% completed courses
    const certificates = completedCourses
      .map((course) => {
        const enrollment = course.enrolledStudents.find(
          (e) => e.student.toString() === userId.toString()
        );

        if (enrollment && enrollment.progress === 100) {
          // Find last completed lesson date as completion date
          const lastCompletedLesson = enrollment.completedLessons.reduce(
            (latest, current) => {
              return new Date(current.completedAt) > new Date(latest.completedAt)
                ? current
                : latest;
            },
            enrollment.completedLessons[0]
          );

          return {
            _id: course._id,
            courseTitle: course.title,
            courseDescription: course.description,
            instructor: {
              name: course.instructor?.name || "Unknown",
              specialization: course.instructor?.specialization,
            },
            category: course.category,
            thumbnail: course.thumbnail,
            completedAt: lastCompletedLesson?.completedAt || enrollment.lastAccessedAt,
            totalLessons: course.lessons.length,
            enrolledAt: enrollment.enrolledAt,
          };
        }
        return null;
      })
      .filter((cert) => cert !== null)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// PUT /api/users/password - Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/users/account - Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/instructors - Get approved instructors
exports.getInstructors = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const instructors = await User.find({
      role: "instructor",
      isInstructorApproved: true,
    })
      .select("name bio specialization createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      role: "instructor",
      isInstructorApproved: true,
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    res.status(200).json(formatPaginatedResponse(instructors, pagination));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/users/instructors/:id - Get instructor details
exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor",
      isInstructorApproved: true,
    }).select("name bio specialization createdAt");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      success: true,
      instructor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
