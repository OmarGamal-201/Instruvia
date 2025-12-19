const express = require('express');
const router = express.Router();
const {
  uploadVideo,
  uploadImage,
  uploadDocument,
  uploadMultipleImages,
  uploadMultipleDocuments,
  deleteFile,
  getVideoInfo,
  generateThumbnail
} = require('../controllers/contentController');
const protect = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All content routes require authentication
router.use(protect);

// Video upload (instructors and admins only)
router.post('/upload/video', authorize('instructor', 'admin'), uploadVideo);

// Image upload (all authenticated users)
router.post('/upload/image', uploadImage);
router.post('/upload/multiple-images', uploadMultipleImages);

// Document upload (instructors and admins only)
router.post('/upload/document', authorize('instructor', 'admin'), uploadDocument);
router.post('/upload/multiple-documents', authorize('instructor', 'admin'), uploadMultipleDocuments);

// File management
router.delete('/delete/:publicId/:resourceType', deleteFile);

// Video utilities
router.get('/video-info/:publicId', getVideoInfo);
router.post('/generate-thumbnail', generateThumbnail);

module.exports = router;
