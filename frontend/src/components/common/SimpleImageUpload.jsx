import React, { useState, useRef } from 'react';
import { CameraIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { processImageForDatabase, validateImageFile } from '../../utils/imageCompression';

const SimpleImageUpload = ({ 
  currentImage, 
  onImageUpdate, 
  size = 'large',
  className = '' 
}) => {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
    xlarge: 'w-12 h-12'
  };



  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file using enhanced validation
    if (!validateImageFile(file)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP, GIF) under 10MB');
      return;
    }

    setUploading(true);
    try {
      console.log('🖼️ Processing profile image...', file.name);
      console.log('📊 Original file size:', Math.round(file.size / 1024) + 'KB');

      // Compress image with profile-optimized settings
      const compressedImage = await processImageForDatabase(file, {
        maxWidth: 400,  // Profile images don't need to be huge
        maxHeight: 400,
        quality: 0.7,   // Good quality for profile pictures
        outputFormat: 'image/jpeg'
      });

      console.log('✅ Profile image compressed successfully');
      console.log('📊 Compressed size:', Math.round(compressedImage.length * 0.75 / 1024) + 'KB');

      // Update profile with compressed base64 image
      const updateResult = await updateProfile({
        profileImage: compressedImage
      });

      if (updateResult.success) {
        onImageUpdate?.(compressedImage);
        toast.success('Profile picture updated successfully! 🖼️');
        console.log('✅ Profile image updated in Firestore');
      } else {
        throw new Error(updateResult.error);
      }
    } catch (error) {
      console.error('❌ Profile image upload error:', error);
      toast.error('Failed to upload profile picture. Please try again.');
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

  console.log('🖼️ SimpleImageUpload render - currentImage:', currentImage ? 'Available' : 'None');

  return (
    <div className={`relative ${className}`}>
      {/* Main Profile Image */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group border-4 border-white shadow-lg cursor-pointer`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('❌ Image load error:', e);
              console.log('❌ Failed image URL:', currentImage?.substring(0, 100));
              // Hide broken image and show fallback
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully');
            }}
          />
        ) : null}
        
        {/* Fallback Icon */}
        <div 
          className={`${currentImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
          style={{ display: currentImage ? 'none' : 'flex' }}
        >
          <UserIcon className={`${iconSizes[size]} text-blue-600`} />
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="small" color="white" />
          </div>
        )}

        {/* Upload Button Overlay */}
        {!uploading && (
          <button
            onClick={triggerFileInput}
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200"
          >
            <CameraIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {!uploading && (
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

      {/* Status Text */}
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          {uploading ? 'Compressing and uploading...' : 'Click to upload or change picture'}
        </p>
        {currentImage && (
          <p className="text-xs text-green-600 mt-1">
            ✅ Profile picture set & optimized
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Images are automatically compressed for optimal performance
        </p>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
