const Course = require('../models/Course');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

// POST /api/courses - Create new course (instructor only)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      price,
      thumbnail,
      previewVideo,
      language,
      duration,
      lessons,
      requirements,
      whatYouWillLearn,
      tags
    } = req.body;

    // Validate instructor approval
    if (req.user.role !== 'instructor' || !req.user.isInstructorApproved) {
      return res.status(403).json({ 
        message: 'Only approved instructors can create courses' 
      });
    }

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      category,
      level,
      price,
      thumbnail,
      previewVideo,
      language,
      duration,
      lessons,
      requirements,
      whatYouWillLearn,
      tags,
      status: 'draft'
    });

    // Populate instructor details
    await course.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/courses - Get all published courses (public)
exports.getCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    // Build filter
    const filter = { status: 'published' };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.price_min || req.query.price_max) {
      filter.price = {};
      if (req.query.price_min) filter.price.$gte = parseFloat(req.query.price_min);
      if (req.query.price_max) filter.price.$lte = parseFloat(req.query.price_max);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_low':
        sort = { price: 1 };
        break;
      case 'price_high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { 'enrolledStudents.length': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name bio')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(courses, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/courses/:id - Get course details
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name bio')
      .populate('reviews.student', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is published or user is the instructor
    if (course.status !== 'published' && course.instructor._id.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Course not available' });
    }

    // Check if user is enrolled
    let isEnrolled = false;
    let userProgress = null;
    
    if (req.user) {
      const enrollment = course.enrolledStudents.find(
        enrollment => enrollment.student.toString() === req.user.id
      );
      isEnrolled = !!enrollment;
      if (enrollment) {
        userProgress = {
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          lastAccessedAt: enrollment.lastAccessedAt
        };
      }
    }

    // Filter lessons for non-enrolled users (only show preview lessons)
    let lessons = course.lessons;
    if (!isEnrolled && course.instructor._id.toString() !== req.user?.id) {
      lessons = course.lessons.filter(lesson => lesson.isPreview);
    }

    const courseData = {
      ...course.toObject(),
      lessons,
      isEnrolled,
      userProgress
    };

    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/courses/:id - Update course (instructor only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only course instructor can update this course' 
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'category', 'level', 'price', 
      'thumbnail', 'previewVideo', 'language', 'duration', 
      'lessons', 'requirements', 'whatYouWillLearn', 'tags', 'status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/courses/:id - Delete course (instructor only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only course instructor can delete this course' 
      });
    }

    // Check if course has enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with enrolled students' 
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/courses/instructor/my-courses - Get instructor's courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = { instructor: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json(formatPaginatedResponse(courses, pagination));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/courses/:id/review - Add course review (enrolled students only)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user.id)) {
      return res.status(403).json({ 
        message: 'Only enrolled students can review this course' 
      });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.student.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this course' 
      });
    }

    // Add review
    course.reviews.push({
      student: req.user.id,
      rating,
      comment
    });

    // Recalculate rating
    course.calculateRating();
    await course.save();

    await course.populate('reviews.student', 'name');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: course.reviews[course.reviews.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/courses/categories - Get available categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      'Programming', 'Design', 'Business', 'Marketing', 
      'Photography', 'Music', 'Data Science', 'Personal Development',
      'Health & Fitness', 'Language', 'Academic', 'Other'
    ];

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
