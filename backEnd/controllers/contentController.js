const {
  uploadVideo,
  uploadImage,
  uploadDocument,
  uploadMultipleImages,
  uploadMultipleDocuments,
  handleUploadError,
  formatFileResponse,
  formatFilesResponse
} = require('../middleware/upload');
const {
  generateVideoThumbnail,
  getVideoInfo,
  deleteFile
} = require('../config/cloudinary');

// POST /api/content/upload/video - Upload video
exports.uploadVideo = async (req, res) => {
  try {
    const upload = uploadVideo.single('video');
    
    upload(req, res, async (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }

      try {
        // Get video info
        const videoInfo = await getVideoInfo(req.file.public_id);
        
        // Generate thumbnail
        const thumbnail = await generateVideoThumbnail(req.file.secure_url);

        const response = {
          success: true,
          video: {
            id: req.file.public_id,
            url: req.file.secure_url,
            originalName: req.file.originalname,
            size: req.file.size,
            duration: videoInfo.duration,
            format: videoInfo.format,
            thumbnail: {
              id: thumbnail.public_id,
              url: thumbnail.secure_url
            }
          }
        };

        res.status(200).json(response);
      } catch (error) {
        console.error('Video processing error:', error);
        res.status(500).json({ message: 'Video upload succeeded but processing failed' });
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/content/upload/image - Upload image
exports.uploadImage = async (req, res) => {
  try {
    const upload = uploadImage.single('image');
    
    upload(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const response = {
        success: true,
        image: formatFileResponse(req.file)
      };

      res.status(200).json(response);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/content/upload/document - Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const upload = uploadDocument.single('document');
    
    upload(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No document file provided' });
      }

      const response = {
        success: true,
        document: formatFileResponse(req.file)
      };

      res.status(200).json(response);
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/content/upload/multiple-images - Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    const upload = uploadMultipleImages;
    
    upload(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }

      const response = {
        success: true,
        images: formatFilesResponse(req.files)
      };

      res.status(200).json(response);
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/content/upload/multiple-documents - Upload multiple documents
exports.uploadMultipleDocuments = async (req, res) => {
  try {
    const upload = uploadMultipleDocuments;
    
    upload(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No document files provided' });
      }

      const response = {
        success: true,
        documents: formatFilesResponse(req.files)
      };

      res.status(200).json(response);
    });
  } catch (error) {
    console.error('Multiple documents upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/content/delete/:publicId/:resourceType - Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType } = req.params;

    if (!publicId || !resourceType) {
      return res.status(400).json({ message: 'Public ID and resource type are required' });
    }

    const validResourceTypes = ['image', 'video', 'raw'];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ 
        message: 'Invalid resource type. Must be: image, video, or raw' 
      });
    }

    await deleteFile(publicId, resourceType);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/content/video-info/:publicId - Get video information
exports.getVideoInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const videoInfo = await getVideoInfo(publicId);

    res.status(200).json({
      success: true,
      video: {
        id: videoInfo.public_id,
        url: videoInfo.secure_url,
        duration: videoInfo.duration,
        format: videoInfo.format,
        size: videoInfo.bytes,
        createdAt: videoInfo.created_at,
        thumbnails: videoInfo.thumbnails || []
      }
    });
  } catch (error) {
    console.error('Video info retrieval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/content/generate-thumbnail - Generate thumbnail for video
exports.generateThumbnail = async (req, res) => {
  try {
    const { videoUrl, startTime = '5' } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    const thumbnail = await generateVideoThumbnail(videoUrl);

    res.status(200).json({
      success: true,
      thumbnail: {
        id: thumbnail.public_id,
        url: thumbnail.secure_url,
        size: thumbnail.bytes,
        format: thumbnail.format
      }
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
