import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

const FirestoreProfileImageUpload = ({ 
  currentImage, 
  onImageUpdate, 
  size = 'large',
  showUploadButton = true,
  className = '' 
}) => {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return false;
    }

    // Check file size (1MB limit for base64)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return false;
    }

    return true;
  };

  const compressImage = (file, maxWidth = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isValid = validateFile(file);
    if (!isValid) return;

    try {
      // Compress and convert to base64
      const compressedImage = await compressImage(file);
      setPreviewImage(compressedImage);
      setShowPreview(true);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  };

  const handleUpload = async () => {
    if (!previewImage || !user) return;

    setUploading(true);
    try {
      console.log('Uploading image to Firestore...');
      
      // Save base64 image directly to Firestore
      const updateResult = await updateProfile({
        profileImage: previewImage
      });

      if (updateResult.success) {
        onImageUpdate?.(previewImage);
        setShowPreview(false);
        setPreviewImage(null);
        toast.success('Profile picture updated successfully!');
        console.log('Image uploaded successfully to Firestore');
      } else {
        throw new Error(updateResult.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage || !user) return;

    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setUploading(true);
    try {
      // Remove image from Firestore
      const updateResult = await updateProfile({
        profileImage: null
      });

      if (updateResult.success) {
        onImageUpdate?.(null);
        toast.success('Profile picture removed successfully!');
      } else {
        throw new Error(updateResult.error);
      }
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Debug: Log current image
  console.log('🖼️ FirestoreProfileImageUpload - currentImage:', currentImage);
  console.log('🖼️ FirestoreProfileImageUpload - user:', user);

  return (
    <div className={`relative ${className}`}>
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mb-2">
          Image: {currentImage ? 'Available' : 'None'} | User: {user?.uid || 'No user'}
        </div>
      )}

      {/* Main Profile Image */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group border-4 border-white shadow-lg`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('❌ Image load error:', e);
              console.log('❌ Failed image URL:', currentImage);
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', currentImage);
            }}
          />
        ) : (
          <UserIcon className={`${iconSizes[size]} text-blue-600`} />
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="small" color="white" />
          </div>
        )}

        {/* Upload Button Overlay */}
        {showUploadButton && !uploading && (
          <button
            onClick={triggerFileInput}
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200"
          >
            <CameraIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {showUploadButton && !uploading && (
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <button
            onClick={triggerFileInput}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Upload new picture"
          >
            <CameraIcon className="w-4 h-4" />
          </button>
          
          {currentImage && (
            <button
              onClick={handleRemoveImage}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
              title="Remove picture"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview Profile Picture
                </h3>
                
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-gray-200">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                    icon={uploading ? <LoadingSpinner size="small" /> : <CheckIcon />}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewImage(null);
                    }}
                    variant="outline"
                    className="flex-1"
                    icon={<XMarkIcon />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirestoreProfileImageUpload;
