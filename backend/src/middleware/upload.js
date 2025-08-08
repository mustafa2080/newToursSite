import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirs = ['trips', 'hotels', 'users', 'categories'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../../uploads', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on route
    if (req.baseUrl.includes('/trips')) {
      uploadPath += 'trips/';
    } else if (req.baseUrl.includes('/hotels')) {
      uploadPath += 'hotels/';
    } else if (req.baseUrl.includes('/users') || req.baseUrl.includes('/auth')) {
      uploadPath += 'users/';
    } else if (req.baseUrl.includes('/categories')) {
      uploadPath += 'categories/';
    } else {
      uploadPath += 'general/';
    }
    
    const fullPath = path.join(__dirname, '../../', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 20);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
export const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File too large. Maximum size is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: 'Too many files. Maximum is 10 files.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // Add file info to request
      if (req.file) {
        req.file.url = `/uploads/${path.relative(path.join(__dirname, '../../uploads'), req.file.path)}`.replace(/\\/g, '/');
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName = 'images', maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File too large. Maximum size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: `Too many files. Maximum is ${maxCount} files.`
          });
        }
        return res.status(400).json({
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // Add file URLs to request
      if (req.files && req.files.length > 0) {
        req.files = req.files.map(file => ({
          ...file,
          url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), file.path)}`.replace(/\\/g, '/')
        }));
      }
      
      next();
    });
  };
};

// Middleware for mixed file upload (single + multiple)
export const uploadMixed = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File too large. Maximum size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: 'Too many files uploaded.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // Add file URLs to request
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName] = req.files[fieldName].map(file => ({
            ...file,
            url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), file.path)}`.replace(/\\/g, '/')
          }));
        });
      }
      
      next();
    });
  };
};

// Utility function to delete file
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Middleware to clean up files on error
export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If there's an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.forEach(file => deleteFile(file.path));
        } else {
          Object.values(req.files).flat().forEach(file => deleteFile(file.path));
        }
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
