const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  deleteAccount,
  getInstructors,
  getInstructorById,
  getDashboardData,
  getEnrolledCourses,
  getCourseProgress,
  getCertificates
} = require('../controllers/userController');
const protect = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { cacheMiddleware, invalidateUserCache, invalidateInstructorCache } = require('../middleware/cache');

// Profile management (protected)
router.put('/profile', protect, validate('updateProfile'), invalidateUserCache, updateProfile);
router.put('/password', protect, validate('changePassword'), changePassword);
router.delete('/account', protect, validate('deleteAccount'), deleteAccount);
router.get('/dashboard', protect, getDashboardData);
router.get('/enrolled-courses', protect, getEnrolledCourses);
router.get('/course-progress/:courseId', protect, getCourseProgress);
router.get('/certificates', protect, getCertificates);

// Public instructor routes (with caching)
router.get('/instructors', cacheMiddleware('instructors:list', 600), getInstructors);
router.get('/instructors/:id', cacheMiddleware('instructors:detail', 600), getInstructorById);

module.exports = router;
