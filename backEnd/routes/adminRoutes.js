const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getPendingInstructors,
  getInstructorApplications,
  getInstructorApplicationById,
  approveInstructorApplication
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { validate } = require('../middleware/validation');
const { cacheMiddleware, invalidateAdminCache, invalidateInstructorCache } = require('../middleware/cache');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', cacheMiddleware('admin:users', 300), getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', invalidateAdminCache, updateUser);
router.delete('/users/:id', invalidateAdminCache, deleteUser);

// Instructor application management
router.get('/instructor-applications', cacheMiddleware('admin:applications', 300), getInstructorApplications);
router.get('/instructor-applications/:id', getInstructorApplicationById);
router.put('/instructor-applications/:id/approve', invalidateInstructorCache, invalidateAdminCache, validate('approveInstructorApplication'), approveInstructorApplication);

// Legacy instructor management (for backward compatibility)
router.get('/instructors/pending', cacheMiddleware('admin:instructors:pending', 300), getPendingInstructors);

router.put(
  '/instructors/:id/approve',
  invalidateInstructorCache,
  invalidateAdminCache,
  approveInstructorApplication
);




// Dashboard
router.get('/stats', cacheMiddleware('admin:stats', 600), getDashboardStats);

module.exports = router;