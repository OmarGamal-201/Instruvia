const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  addReview,
  getCategories
} = require('../controllers/courseController');
const protect = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { validate } = require('../middleware/validation');
const { cacheMiddleware, invalidateInstructorCache } = require('../middleware/cache');

// Public routes (with caching)
router.get('/', cacheMiddleware('courses:list', 300), getCourses);
router.get('/categories', cacheMiddleware('courses:categories', 3600), getCategories);
router.get('/:id', cacheMiddleware('courses:detail', 300), getCourseById);

// Protected routes
router.post('/:id/review', protect, validate('addReview'), addReview);

// Instructor routes
router.post('/', protect, authorize('instructor'), validate('createCourse'), createCourse);
router.get('/instructor/my-courses', protect, authorize('instructor'), getInstructorCourses);
router.put('/:id', protect, authorize('instructor'), validate('updateCourse'), invalidateInstructorCache, updateCourse);
router.delete('/:id', protect, authorize('instructor'), invalidateInstructorCache, deleteCourse);

module.exports = router;
