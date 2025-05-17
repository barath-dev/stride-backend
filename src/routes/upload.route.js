const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile: uploadFileService } = require("../services/fileUpload");

const uploadRoutes = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter function to restrict file types if needed
const fileFilter = (req, file, cb) => {
  // Accept images, documents, etc.
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/jpg', 'image/bmp', 'image/tiff',
    'application/octet-stream',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  console.log("file.mimetype",file.mimetype);
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only images, PDFs, and office documents are allowed.'), false);
  }
};

// Create the multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

uploadRoutes.use('/uploadFile', (req, res, next) => {
  console.log('⭐ Upload request received:');
  console.log('- Content-Type:', req.headers['content-type']);
  console.log('- Body keys:', Object.keys(req.body || {}));
  next();
});

// Updated route handler for file upload with error handling
uploadRoutes.post('/uploadFile', (req, res) => {
  upload.single('file')(req, res, async function(err) {
    if (err) {
      console.error('❌ Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File too large! Maximum size is 10MB'
          });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            status: 'error',
            message: 'Unexpected field. Please use the field name "file" for your upload.'
          });
        }
        
        return res.status(400).json({
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      }
      
      // Other errors
      return res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Please make sure you are sending a file with field name "file".'
      });
    }

    try {
      console.log('✅ File received:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,
        size: req.file.size
      });

      // Use the service function to upload to S3
      const result = await uploadFileService(req.file);
      
      return res.status(200).json({
        status: 'success',
        data: {
          fileUrl: result.Location,
          key: result.Key,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('❌ Upload service error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to upload file'
      });
    }
  });
});

// Add route for getting presigned URL if needed
uploadRoutes.post('/getPresignedUrl', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({
        status: 'error',
        message: 'fileName and fileType are required'
      });
    }

    const { getPresignedUrl } = require("../services/fileUpload");
    const urlData = await getPresignedUrl(fileName, fileType);
    
    return res.status(200).json({
      status: 'success',
      data: urlData
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate presigned URL'
    });
  }
});

uploadRoutes.get('/test-s3-connection', async (req, res) => {
    try {
      const { testS3Connection } = require("../services/fileUpload");
      const testResult = await testS3Connection();
      
      return res.status(200).json({
        status: 'success',
        data: testResult
      });
    } catch (error) {
      console.error('S3 Connection Test Error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to test S3 connection'
      });
    }
  });

module.exports = uploadRoutes;