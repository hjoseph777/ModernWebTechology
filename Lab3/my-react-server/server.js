const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Ensure data directory and images.json exists
const dataDir = path.join(__dirname, 'data');
const imagesDataPath = path.join(dataDir, 'images.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory');
}

if (!fs.existsSync(imagesDataPath)) {
  // Create initial seed data
  const seedData = {
    images: [
      {
        id: "1",
        url: "/uploads/seed-dog1.jpg",
        source: "seed",
        uploadedAt: new Date().toISOString(),
        filename: "seed-dog1.jpg"
      },
      {
        id: "2", 
        url: "/uploads/seed-dog2.jpg",
        source: "seed",
        uploadedAt: new Date().toISOString(),
        filename: "seed-dog2.jpg"
      },
      {
        id: "3",
        url: "/uploads/seed-dog3.jpg", 
        source: "seed",
        uploadedAt: new Date().toISOString(),
        filename: "seed-dog3.jpg"
      }
    ]
  };
  
  fs.writeFileSync(imagesDataPath, JSON.stringify(seedData, null, 2));
  console.log('Created initial images.json with seed data');
}

// Import routes
const imagesRouter = require('./routes/images');
app.use('/api/images', imagesRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CPAN 212 Lab 3 - Express Image Server',
    endpoints: {
      'GET /api/images': 'Get all images',
      'POST /api/images': 'Upload image',
      'GET /uploads/:filename': 'Serve uploaded files'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📊 Images data: ${imagesDataPath}`);
});