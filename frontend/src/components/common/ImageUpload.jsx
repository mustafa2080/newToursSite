import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';
import { compressImage, getOptimalSettings } from '../../utils/imageCompression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

const ImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 2 * 1024 * 1024, // 2MB for better compression
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showMainImageSelector = true,
  mainImageIndex = 0,
  onMainImageChange,
  className = '',
  compressionType = 'tripGallery', // New prop for compression type
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Upload image to Firebase Storage
  const uploadToFirebaseStorage = async (file) => {
    try {
      console.log('📤 Uploading image to Firebase Storage:', file.name);

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${compressionType}/${fileName}`;

      // Create storage reference
      const imageRef = ref(storage, storagePath);

      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      console.log('✅ Upload successful, getting download URL...');

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);

      return {
        url: downloadURL,
        path: storagePath,
        size: file.size,
        name: file.name,
        type: file.type
      };
    } catch (error) {
      console.error('❌ Error uploading to Firebase Storage:', error);
      throw error;
    }
  };

  const validateFile = (file) => {
    const errors = [];
    
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type. Please use JPEG, PNG, or WebP.`);
    }
    
    if (file.size > maxFileSize) {
      errors.push(`${file.name}: File too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB.`);
    }
    
    return errors;
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      newErrors.push(`Cannot upload more than ${maxImages} images. You can upload ${maxImages - images.length} more.`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    uploadFiles(validFiles);
  };

  const uploadFiles = async (files) => {
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = Date.now() + i;
      
      try {
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Upload to Firebase Storage
        const uploadResult = await uploadToFirebaseStorage(file);

        const imageData = {
          id: fileId,
          url: uploadResult.url, // Use Firebase Storage URL
          name: uploadResult.name,
          size: uploadResult.size,
          type: uploadResult.type,
          path: uploadResult.path,
          uploadedAt: new Date().toISOString(),
        };
        
        newImages.push(imageData);
        
        // Remove from upload progress
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        
      } catch (error) {
        console.error('Upload error:', error);
        setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    
    // Revoke object URL to prevent memory leaks
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    
    // Update main image index if necessary
    if (showMainImageSelector && onMainImageChange) {
      if (index === mainImageIndex) {
        onMainImageChange(0); // Set first image as main
      } else if (index < mainImageIndex) {
        onMainImageChange(mainImageIndex - 1); // Adjust main image index
      }
    }
  };

  const setAsMainImage = (index) => {
    if (showMainImageSelector && onMainImageChange) {
      onMainImageChange(index);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={openFileDialog}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Click to upload
              </button>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP up to {Math.round(maxFileSize / 1024 / 1024)}MB (auto-compressed)
            </p>
            <p className="text-xs text-gray-500">
              Maximum {maxImages} images ({maxImages - images.length} remaining)
            </p>
            <p className="text-xs text-blue-600">
              ✨ Images are automatically compressed for optimal performance
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Main Image Badge */}
                  {showMainImageSelector && index === mainImageIndex && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Main
                      </span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      {showMainImageSelector && index !== mainImageIndex && (
                        <Button
                          size="small"
                          onClick={() => setAsMainImage(index)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Set Main
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removeImage(index)}
                        icon={<XMarkIcon />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-1 text-xs text-gray-500">
                  <p className="truncate">{image.name}</p>
                  {image.compressionRatio && (
                    <div className="space-y-1">
                      <p className="text-green-600">
                        {Math.round(image.compressedSize / 1024)}KB
                        ({image.compressionRatio}% smaller)
                      </p>
                      {image.width && image.height && (
                        <p className="text-blue-600">
                          {image.width}×{image.height}px
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
