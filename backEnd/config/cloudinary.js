const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for different file types
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instruvia/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `video-${uniqueSuffix}`;
    }
  }
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instruvia/images',
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `image-${uniqueSuffix}`;
    }
  }
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instruvia/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `doc-${uniqueSuffix}`;
    }
  }
});

// Upload functions
const uploadVideo = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'instruvia/videos',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'instruvia/images',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

const uploadDocument = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'instruvia/documents',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary document upload error:', error);
    throw new Error('Failed to upload document');
  }
};

// Delete functions
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

// Generate video thumbnail
const generateVideoThumbnail = async (videoUrl) => {
  try {
    const result = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      folder: 'instruvia/thumbnails',
      format: 'jpg',
      start_offset: '5' // Capture thumbnail at 5 seconds
    });
    return result;
  } catch (error) {
    console.error('Cloudinary thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Get video info (duration, format, etc.)
const getVideoInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary video info error:', error);
    throw new Error('Failed to get video info');
  }
};

module.exports = {
  cloudinary,
  videoStorage,
  imageStorage,
  documentStorage,
  uploadVideo,
  uploadImage,
  uploadDocument,
  deleteFile,
  generateVideoThumbnail,
  getVideoInfo
};
