// Required dependencies
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

/**
 * Initialize AWS SDK
 * @returns {AWS.S3} - Configured S3 client
 */
const initializeAWS = () => {
  // Log only critical credential info
  console.log('AWS Config - Access Key exists:', !!process.env.AWS_ACCESS_KEY);
  console.log('AWS Config - Secret Key exists:', !!process.env.AWS_SECRET_KEY);
  
  // Apply configuration
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    maxRetries: 3
  });

  // Create and return S3 instance
  return new AWS.S3();
};

// Initialize S3 client
const s3 = initializeAWS();

// Get bucket name from environment or use default
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'stride-image-bucket';

/**
 * Sanitize a file path to make it a valid S3 key
 * @param {string} filePath - Original file path
 * @returns {string} - Sanitized S3 key
 */
const sanitizeS3Key = (filePath) => {
  // Get just the filename without the path
  const fileName = path.basename(filePath);
  
  // Replace any invalid characters
  const sanitizedName = fileName.replace(/[^\w\-\.]/g, '_');
  
  return sanitizedName;
};

/**
 * Upload file to S3
 * @param {Object} file - File object from multer middleware
 * @returns {Promise<Object>} - S3 upload result
 */
exports.uploadFile = async (file) => {
  try {
    // Refresh the S3 client to ensure latest credentials
    const s3Client = initializeAWS();
    
    // Validate input
    if (!file || !file.path) {
      throw new Error('Invalid file object or missing path');
    }
    
    // Log minimal file info
    console.log('Processing upload:', {
      name: file.originalname,
      type: file.mimetype,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    // Verify file exists on disk
    if (!fs.existsSync(file.path)) {
      throw new Error(`File not found at path: ${file.path}`);
    }
    
    // Sanitize the original filename for S3
    const sanitizedFileName = sanitizeS3Key(file.originalname);
    
    // Generate unique S3 key with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const key = `uploads/${timestamp}-${randomString}-${sanitizedFileName}`;
    
    // Read file content as buffer
    const fileContent = fs.readFileSync(file.path);
    
    // Set S3 upload parameters with explicit ACL
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read',
      ContentDisposition: `inline; filename="${sanitizedFileName}"`
    };
    
    console.log(`Uploading to S3 bucket: ${BUCKET_NAME}`);
    
    // Use the S3 client with a longer timeout
    const uploadOptions = {
      partSize: 10 * 1024 * 1024, // 10 MB per part
      queueSize: 1 // Number of simultaneous uploads
    };
    
    // Upload to S3
    const data = await s3Client.upload(params, uploadOptions).promise();
    console.log('Upload successful:', data.Location);
    
    // Clean up temporary file
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete temporary file');
    }
    
    // Return upload data with additional metadata

    response  = {
      ...data,
      originalName: file.originalname,
      sanitizedName: sanitizedFileName,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    console.log("response",response);

    return response;
    
  } catch (error) {
    console.error('S3 Upload Error:', error.code, '-', error.message);
    
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
      }
    }
    
    throw error;
  }
};

/**
 * Test S3 connection and permissions
 * @returns {Promise<Object>} - Test results
 */
exports.testS3Connection = async () => {
  try {
    console.log('Testing S3 connection...');
    
    // Refresh the S3 client
    const s3Client = initializeAWS();
    
    // Test 1: List buckets
    const listBucketsResult = await s3Client.listBuckets().promise();
    const bucketExists = listBucketsResult.Buckets.some(b => b.Name === BUCKET_NAME);
    console.log(`Target bucket '${BUCKET_NAME}' exists:`, bucketExists);
    
    // Test 2: List objects in the bucket
    try {
      const listObjectsResult = await s3Client.listObjectsV2({ 
        Bucket: BUCKET_NAME,
        MaxKeys: 5
      }).promise();
      console.log('ListBucket permission check passed');
    } catch (listError) {
      console.error('ListBucket permission check failed:', listError.code);
    }
    
    // Test 3: Upload a tiny test file
    const testKey = `test-${Date.now()}.txt`;
    try {
      await s3Client.putObject({
        Bucket: BUCKET_NAME,
        Key: testKey,
        Body: 'Test file',
        ContentType: 'text/plain',
        ACL: 'public-read'
      }).promise();
      console.log('PutObject permission check passed');
      
      // Try to delete the test file if upload succeeded
      await s3Client.deleteObject({
        Bucket: BUCKET_NAME,
        Key: testKey
      }).promise();
      console.log('DeleteObject permission check passed');
    } catch (putError) {
      console.error('PutObject permission check failed:', putError.code);
    }
    
    return {
      success: true,
      bucketExists,
      message: 'Connection tests completed'
    };
  } catch (error) {
    console.error('S3 connection test error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a presigned URL for direct browser-to-S3 upload
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<Object>} - Presigned URL data
 */
exports.getPresignedUrl = async (fileName, fileType) => {
  try {
    // Validate input
    if (!fileName || !fileType) {
      throw new Error('fileName and fileType are required');
    }
    
    // Sanitize the filename for S3
    const sanitizedFileName = sanitizeS3Key(fileName);
    
    // Generate unique key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const key = `uploads/direct/${timestamp}-${randomString}-${sanitizedFileName}`;
    
    // Set URL parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 300 // 5 minutes expiration
    };
    
    console.log(`Generating presigned URL for: ${sanitizedFileName}`);
    
    // Generate the presigned URL
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    
    // Build the eventual public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
    // Return URL data
    return {
      presignedUrl,
      fileUrl,
      key,
      bucket: BUCKET_NAME,
      expiresAt: new Date(Date.now() + 300 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Presigned URL Error:', error.message);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {string} key - S3 object key to delete
 * @returns {Promise<Object>} - Deletion result
 */
exports.deleteFile = async (key) => {
  try {
    // Validate input
    if (!key) {
      throw new Error('S3 object key is required');
    }
    
    console.log(`Deleting file from S3: ${key}`);
    
    // Set deletion parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    // Delete file from S3
    const result = await s3.deleteObject(params).promise();
    
    return {
      success: true,
      key,
      result
    };
  } catch (error) {
    console.error('File Deletion Error:', error.message);
    throw error;
  }
};