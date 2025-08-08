import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  UserIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

const ProfileImageUpload = ({ 
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

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return false;
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          toast.error('Image must be at least 100x100 pixels');
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        toast.error('Invalid image file');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isValid = await validateFile(file);
    if (!isValid) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewImage || !user) return;

    setUploading(true);
    try {
      // Convert preview to blob
      const response = await fetch(previewImage);
      const blob = await response.blob();

      // Upload new image with timestamp to avoid conflicts and CORS issues
      const timestamp = Date.now();
      const fileName = `profile_${user.uid}_${timestamp}.jpg`;
      const imageRef = ref(storage, `avatars/${fileName}`);

      const snapshot = await uploadBytes(imageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          userId: user.uid,
          uploadedAt: new Date().toISOString()
        }
      });

      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      const updateResult = await updateProfile({
        profileImage: downloadURL
      });

      if (updateResult.success) {
        onImageUpdate?.(downloadURL);
        setShowPreview(false);
        setPreviewImage(null);
        toast.success('Profile picture updated successfully!');
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
      // Simply update user profile to remove image reference
      // Don't try to delete from storage to avoid CORS issues
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

  return (
    <div className={`relative ${className}`}>
      {/* Main Profile Image */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center group`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <UserIcon className={`${iconSizes[size]} text-gray-400`} />
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="small" />
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
          <>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileImageUpload;
