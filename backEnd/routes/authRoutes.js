const express = require('express');
const router = express.Router();
const { register, login, me, applyInstructor, forgotPassword, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { uploadInstructorDocuments, processUploadedFiles, handleMulterError } = require('../middleware/fileUpload');

// Test route 
router.get('/ping', (req, res) => res.status(200).json({ message: 'auth ok' }));

// Auth routes with rate limiting
router.post('/register', authLimiter, validate('register'), register);
router.post('/login', authLimiter, validate('login'), login);
router.post('/forgot-password', passwordResetLimiter, validate('forgotPassword'), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate('resetPassword'), resetPassword);
router.get('/me', protect, me);
router.post('/apply-instructor', protect, uploadInstructorDocuments, processUploadedFiles, validate('applyInstructor'), applyInstructor);

module.exports = router;
