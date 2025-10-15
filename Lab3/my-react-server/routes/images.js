const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, '../uploads');
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and UUID
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to read images data
const readImagesData = () => {
  const dataPath = path.join(__dirname, '../data/images.json');
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images data:', error);
    return { images: [] };
  }
};

// Helper function to write images data
const writeImagesData = (data) => {
  const dataPath = path.join(__dirname, '../data/images.json');
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing images data:', error);
    return false;
  }
};

// GET /api/images - Return all images
router.get('/', (req, res) => {
  try {
    const data = readImagesData();
    res.json({
      success: true,
      count: data.images.length,
      images: data.images
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve images'
    });
  }
});

// POST /api/images - Upload new image
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Read current images data
    const data = readImagesData();
    
    // Create new image object
    const newImage = {
      id: uuidv4(),
      url: `/uploads/${req.file.filename}`,
      source: req.body.source || 'uploaded',
      uploadedAt: new Date().toISOString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    // Add to images array
    data.images.push(newImage);
    
    // Write back to file
    if (writeImagesData(data)) {
      console.log(`✅ Image uploaded: ${req.file.filename}`);
      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        image: newImage
      });
    } else {
      throw new Error('Failed to save image data');
    }

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      details: error.message
    });
  }
});

// GET /api/images/:id - Get single image by ID
router.get('/:id', (req, res) => {
  try {
    const data = readImagesData();
    const image = data.images.find(img => img.id === req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    res.json({
      success: true,
      image: image
    });
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve image'
    });
  }
});

// DELETE /api/images/:id - Delete image by ID
router.delete('/:id', (req, res) => {
  try {
    const imageId = req.params.id;
    const data = readImagesData();
    
    // Find the image to delete
    const imageIndex = data.images.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const imageToDelete = data.images[imageIndex];
    
    // Protect seed images from deletion
    if (imageToDelete.source === 'seed') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete seed images'
      });
    }

    // Delete physical file if it exists
    if (imageToDelete.filename) {
      const filePath = path.join(__dirname, '../uploads', imageToDelete.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted file: ${imageToDelete.filename}`);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with JSON deletion even if file deletion fails
      }
    }

    // Remove from images array
    data.images.splice(imageIndex, 1);
    
    // Write updated data back to file
    if (writeImagesData(data)) {
      console.log(`✅ Image deleted: ${imageId}`);
      res.json({
        success: true,
        message: 'Image deleted successfully',
        deletedImage: imageToDelete,
        remainingCount: data.images.length
      });
    } else {
      throw new Error('Failed to update images data');
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      details: error.message
    });
  }
});

module.exports = router;