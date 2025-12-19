const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getInstructorDashboard,
  getCourseProgress
} = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { cacheMiddleware } = require('../middleware/cache');

// All dashboard routes require authentication
router.use(protect);

// Student dashboard
router.get('/student', cacheMiddleware('dashboard:student', 300), getStudentDashboard);
router.get('/progress/:courseId', getCourseProgress);

// Instructor dashboard
router.get('/instructor', authorize('instructor'), cacheMiddleware('dashboard:instructor', 300), getInstructorDashboard);

module.exports = router;
