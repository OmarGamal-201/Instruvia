const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');

// GET /api/dashboard/student - Student dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enrolled courses with progress
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': userId,
      status: 'published'
    })
    .populate('instructor', 'name')
    .select('title thumbnail instructor duration lessons enrolledStudents rating category level')
    .sort({ 'enrolledStudents.lastAccessedAt': -1 })
    .limit(5);

    // Format enrolled courses with progress
    const enrolledCoursesWithProgress = enrolledCourses.map(course => {
      const enrollment = course.enrolledStudents.find(
        enrollment => enrollment.student.toString() === userId
      );

      return {
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        duration: course.duration,
        totalLessons: course.lessons.length,
        category: course.category,
        level: course.level,
        rating: course.rating,
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length,
        lastAccessedAt: enrollment.lastAccessedAt
      };
    });
    

    // Get recent payments
    const recentPayments = await Payment.find({ user: userId })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(3);

    // Calculate overall statistics
    const totalEnrolled = await Course.countDocuments({
      'enrolledStudents.student': userId,
      status: 'published'
    });

    const completedCourses = await Course.countDocuments({
      'enrolledStudents.student': userId,
      'enrolledStudents.progress': 100,
      status: 'published'
    });

    const totalSpent = await Payment.aggregate([
      { $match: { user: userId, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get learning streak (consecutive days with activity)
    const learningStreak = await calculateLearningStreak(userId);

    // Get achievements (placeholder for future implementation)
    const achievements = await getStudentAchievements(userId);

    res.status(200).json({
      success: true,
      dashboard: {
        enrolledCourses: enrolledCoursesWithProgress,
        recentPayments,
        statistics: {
          totalEnrolled,
          completedCourses,
          inProgress: totalEnrolled - completedCourses,
          totalSpent: totalSpent[0]?.total || 0,
          learningStreak
        },
        achievements
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/dashboard/instructor - Instructor dashboard
exports.getInstructorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get instructor's courses
    const courses = await Course.find({ instructor: userId })
      .select('title status enrolledStudents rating price createdAt')
      .sort({ createdAt: -1 });

    // Calculate instructor statistics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.status === 'published').length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents.length, 0);
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const averageRating = courses.reduce((sum, course) => sum + course.rating.average, 0) / (totalCourses || 1);

    // Get recent enrollments
    const recentEnrollments = await Course.aggregate([
      { $match: { instructor: userId } },
      { $unwind: '$enrolledStudents' },
      { $sort: { 'enrolledStudents.enrolledAt': -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'enrolledStudents.student', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      {
        $project: {
          student: { name: '$student.name', email: '$student.email' },
          course: { title: '$course.title', id: '$course._id' },
          enrolledAt: '$enrolledStudents.enrolledAt',
          progress: '$enrolledStudents.progress'
        }
      }
    ]);

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = await getMonthlyRevenue(userId);

    res.status(200).json({
      success: true,
      dashboard: {
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          status: course.status,
          enrolledStudents: course.enrolledStudents.length,
          rating: course.rating.average,
          price: course.price,
          createdAt: course.createdAt
        })),
        statistics: {
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalRevenue: totalRevenue[0]?.total || 0,
          averageRating: Math.round(averageRating * 10) / 10
        },
        recentEnrollments,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/dashboard/progress/:courseId - Detailed course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name')
      .select('title instructor lessons enrolledStudents');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(userId)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === userId
    );

    // Get lesson completion details
    const lessonsWithProgress = course.lessons.map(lesson => {
      const isCompleted = enrollment.completedLessons.some(
        completedLesson => completedLesson.lessonId.toString() === lesson._id.toString()
      );

      return {
        id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
        isCompleted,
        completedAt: isCompleted ? 
          enrollment.completedLessons.find(
            completedLesson => completedLesson.lessonId.toString() === lesson._id.toString()
          ).completedAt : null
      };
    });

    // Calculate time spent (placeholder - would need tracking system)
    const timeSpent = calculateTimeSpent(enrollment);

    res.status(200).json({
      success: true,
      progress: {
        course: {
          id: course._id,
          title: course.title,
          instructor: course.instructor
        },
        overall: {
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons.length,
          totalLessons: course.lessons.length,
          timeSpent,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt
        },
        lessons: lessonsWithProgress
      }
    });
  } catch (error) {
    console.error('Course progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper functions
const calculateLearningStreak = async (userId) => {
  try {
    const enrollments = await Course.aggregate([
      { $match: { 'enrolledStudents.student': userId } },
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.student': userId } },
      { $sort: { 'enrolledStudents.lastAccessedAt': -1 } },
      { $limit: 30 }, // Last 30 days
      { $group: { _id: null, dates: { $push: '$enrolledStudents.lastAccessedAt' } } }
    ]);

    if (!enrollments[0] || !enrollments[0].dates.length) {
      return 0;
    }

    const dates = enrollments[0].dates.map(date => new Date(date).toDateString());
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (const dateStr of uniqueDates) {
      if (dateStr === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (currentDate.toDateString() !== today) {
        // If we're not starting from today, check if streak is broken
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Learning streak calculation error:', error);
    return 0;
  }
};

const getStudentAchievements = async (userId) => {
  // Placeholder for achievement system
  return [
    {
      id: 'first_course',
      title: 'First Steps',
      description: 'Enrolled in your first course',
      icon: '🎓',
      unlocked: true,
      unlockedAt: new Date()
    },
    {
      id: 'fast_learner',
      title: 'Fast Learner',
      description: 'Complete a course in under 7 days',
      icon: '⚡',
      unlocked: false
    }
  ];
};

const calculateTimeSpent = (enrollment) => {
  // Placeholder - would need actual time tracking
  const daysSinceEnrollment = Math.floor((Date.now() - new Date(enrollment.enrolledAt)) / (1000 * 60 * 60 * 24));
  return Math.round(daysSinceEnrollment * 30); // Assume 30 minutes per day
};

const getMonthlyRevenue = async (instructorId) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': instructorId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    return revenue.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.revenue,
      enrollments: item.enrollments
    })).reverse();
  } catch (error) {
    console.error('Monthly revenue calculation error:', error);
    return [];
  }
};
