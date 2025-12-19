const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyCourses,
  getMyCourseDetails,
  completeLesson,
  getLessonDetails,
  unenrollFromCourse
} = require('../controllers/enrollmentController');
const protect = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// All routes require authentication
router.use(protect);

// Enrollment management
router.post('/:courseId', enrollInCourse);
router.delete('/:courseId', unenrollFromCourse);

// Student course access
router.get('/my-courses', cacheMiddleware('student:courses', 300), getMyCourses);
router.get('/my-courses/:courseId', getMyCourseDetails);

// Lesson management
router.post('/my-courses/:courseId/lessons/:lessonId/complete', completeLesson);
router.get('/my-courses/:courseId/lessons/:lessonId', getLessonDetails);

module.exports = router;
