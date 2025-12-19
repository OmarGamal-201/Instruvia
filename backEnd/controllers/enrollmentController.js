const Course = require('../models/Course');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

// POST /api/enrollments/:courseId - Enroll in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is published
    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if user is already enrolled
    if (course.isEnrolled(req.user.id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === req.user.id) {
      return res.status(400).json({ message: 'Instructors cannot enroll in their own courses' });
    }

    // Enroll student
    await course.enrollStudent(req.user.id);

    // Get updated course with populated data
    await course.populate('instructor', 'name');

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      course: {
        id: course._id,
        title: course.title,
        instructor: course.instructor,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/enrollments/my-courses - Get student's enrolled courses
exports.getMyCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    // Find courses where user is enrolled
    const courses = await Course.find({
      'enrolledStudents.student': req.user.id,
      status: 'published'
    })
    .populate('instructor', 'name bio')
    .select('title description instructor thumbnail duration lessons enrolledStudents rating category level')
    .sort({ 'enrolledStudents.lastAccessedAt': -1 })
    .skip(skip)
    .limit(limit);

    // Add enrollment info to each course
    const coursesWithEnrollment = courses.map(course => {
      const enrollment = course.enrolledStudents.find(
        enrollment => enrollment.student.toString() === req.user.id
      );

      return {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        duration: course.duration,
        totalLessons: course.lessons.length,
        rating: course.rating,
        category: course.category,
        level: course.level,
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons.length,
          lastAccessedAt: enrollment.lastAccessedAt
        }
      };
    });

    const total = await Course.countDocuments({
      'enrolledStudents.student': req.user.id,
      status: 'published'
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(coursesWithEnrollment, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/enrollments/my-courses/:courseId - Get enrolled course details
exports.getMyCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name bio')
      .populate('reviews.student', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Get user's enrollment data
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === req.user.id
    );

    // Mark lesson completion status
    const lessonsWithStatus = course.lessons.map(lesson => ({
      ...lesson.toObject(),
      isCompleted: enrollment.completedLessons.some(
        completedLesson => completedLesson.lessonId.toString() === lesson._id.toString()
      )
    }));

    const courseData = {
      id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      thumbnail: course.thumbnail,
      duration: course.duration,
      requirements: course.requirements,
      whatYouWillLearn: course.whatYouWillLearn,
      lessons: lessonsWithStatus,
      rating: course.rating,
      reviews: course.reviews,
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        lastAccessedAt: enrollment.lastAccessedAt
      }
    };

    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/enrollments/my-courses/:courseId/lessons/:lessonId/complete - Mark lesson as completed
exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if lesson exists
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update progress
    await course.updateProgress(req.user.id, lessonId);

    // Get updated enrollment data
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      totalLessons: course.lessons.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/enrollments/my-courses/:courseId/lessons/:lessonId - Get lesson details
exports.getLessonDetails = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = course.isEnrolled(req.user.id);
    const isInstructor = course.instructor.toString() === req.user.id;

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get lesson
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if lesson is preview or user has access
    if (!lesson.isPreview && !isEnrolled && !isInstructor) {
      return res.status(403).json({ message: 'This lesson is not available for preview' });
    }

    // Get completion status if enrolled
    let isCompleted = false;
    if (isEnrolled) {
      const enrollment = course.enrolledStudents.find(
        enrollment => enrollment.student.toString() === req.user.id
      );
      isCompleted = enrollment.completedLessons.some(
        completedLesson => completedLesson.lessonId.toString() === lessonId
      );
    }

    // Get previous and next lessons
    const currentOrder = lesson.order;
    const previousLesson = course.lessons.find(l => l.order === currentOrder - 1);
    const nextLesson = course.lessons.find(l => l.order === currentOrder + 1);

    res.status(200).json({
      success: true,
      lesson: {
        ...lesson.toObject(),
        isCompleted,
        courseInfo: {
          id: course._id,
          title: course.title
        },
        navigation: {
          previousLesson: previousLesson ? {
            id: previousLesson._id,
            title: previousLesson.title
          } : null,
          nextLesson: nextLesson ? {
            id: nextLesson._id,
            title: nextLesson.title
          } : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/enrollments/:courseId - Unenroll from a course
exports.unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user.id)) {
      return res.status(400).json({ message: 'You are not enrolled in this course' });
    }

    // Remove enrollment
    course.enrolledStudents = course.enrolledStudents.filter(
      enrollment => enrollment.student.toString() !== req.user.id
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Unenrolled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
