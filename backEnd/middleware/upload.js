const multer = require('multer');
const { videoStorage, imageStorage, documentStorage } = require('../config/cloudinary');

// File filter for different types
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Video upload middleware
const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: fileFilter([
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm'
  ])
});

// Image upload middleware
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: fileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ])
});

// Document upload middleware
const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
  },
  fileFilter: fileFilter([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ])
});

// Multiple file upload middleware
const uploadMultipleImages = uploadImage.array('images', 5); // Max 5 images
const uploadMultipleDocuments = uploadDocument.array('documents', 10); // Max 10 documents

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        maxSize: err.limit
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        maxFiles: err.limit
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field'
      });
    }
  } else if (err) {
    return res.status(400).json({
      message: err.message
    });
  }
  next();
};

// Helper function to format uploaded file response
const formatFileResponse = (file) => {
  return {
    id: file.filename || file.public_id,
    url: file.secure_url || file.url,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    resourceType: file.resource_type || file.fieldname
  };
};

// Helper function to format multiple files response
const formatFilesResponse = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(formatFileResponse);
};

module.exports = {
  uploadVideo,
  uploadImage,
  uploadDocument,
  uploadMultipleImages,
  uploadMultipleDocuments,
  handleUploadError,
  formatFileResponse,
  formatFilesResponse
};
