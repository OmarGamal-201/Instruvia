const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instructor-applications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${file.fieldname}-${uniqueSuffix}`;
    }
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files
  }
});

// Middleware to handle multiple file uploads for instructor applications
const uploadInstructorDocuments = upload.array('documents', 5);

// Middleware to process uploaded files and add to request body
const processUploadedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'documents', message: 'At least one document is required' }]
    });
  }

  // Process uploaded files and add to request body
  const documents = req.files.map((file, index) => {
    // Determine document type from field name or request body
    let documentType = 'other';
    if (req.body[`documents[${index}][type]`]) {
      documentType = req.body[`documents[${index}][type]`];
    } else if (req.body.documentTypes && req.body.documentTypes[index]) {
      documentType = req.body.documentTypes[index];
    }

    return {
      type: documentType,
      filename: file.filename,
      originalName: file.originalname,
      url: file.path,
      size: file.size,
      uploadedAt: new Date()
    };
  });

  req.body.documents = documents;
  next();
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{ field: 'documents', message: 'File size too large. Maximum size is 10MB per file.' }]
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{ field: 'documents', message: 'Too many files. Maximum is 5 files.' }]
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{ field: 'documents', message: 'Unexpected file field.' }]
      });
    }
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'documents', message: err.message }]
    });
  }

  next(err);
};

module.exports = {
  uploadInstructorDocuments,
  processUploadedFiles,
  handleMulterError
};
