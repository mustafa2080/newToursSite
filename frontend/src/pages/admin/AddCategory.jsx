import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TagIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { processImageForDatabase, validateImageFile } from '../../utils/imageCompression';

const AddCategory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'active',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    sortOrder: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-generate slug when name changes
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (!validateImageFile(file)) {
        alert('Invalid image file. Please use JPEG, PNG, WebP, or GIF format (max 10MB)');
        return;
      }

      try {
        console.log(`🗜️ Compressing image for preview: ${file.name}...`);

        // Compress image for preview and storage
        const compressedImage = await processImageForDatabase(file);

        setImageFile(file);
        setImagePreview(compressedImage);

        // Update form data with compressed image
        setFormData(prev => ({
          ...prev,
          image: compressedImage
        }));

        console.log(`✅ Image compressed and ready for upload`);
      } catch (error) {
        console.error('❌ Error compressing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';

    try {
      setImageUploading(true);
      console.log('📤 Starting image upload...');

      // Create a unique filename
      const fileName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, `categories/${fileName}`);

      console.log('📤 Uploading to:', `categories/${fileName}`);

      // Upload the file
      const snapshot = await uploadBytes(imageRef, imageFile);
      console.log('✅ Upload successful, getting download URL...');

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);

      // More specific error handling
      if (error.code === 'storage/unauthorized') {
        alert('Error: You do not have permission to upload images. Please check Firebase Storage rules.');
      } else if (error.code === 'storage/canceled') {
        alert('Upload was canceled.');
      } else if (error.code === 'storage/unknown') {
        alert('Unknown error occurred during upload. Please try again.');
      } else {
        alert(`Upload failed: ${error.message}`);
      }

      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('📂 Creating new category...');
      console.log('📊 Form data:', formData);
      console.log('🖼️ Image file:', imageFile);
      console.log('🔗 Image preview:', imagePreview ? 'Available' : 'None');

      // Upload image if selected
      let imageUrl = formData.image;
      if (imageFile) {
        console.log('📷 Processing image upload...');

        // Use base64 directly (more reliable than Firebase Storage with CORS issues)
        if (imagePreview) {
          console.log('📷 Using base64 image encoding');
          imageUrl = imagePreview;
          console.log('✅ Image processed successfully as base64');
        } else {
          console.error('❌ No image preview available');
          throw new Error('Image processing failed - no preview available');
        }
      }

      // Prepare category data with compression metadata
      const categoryData = {
        ...formData,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        imageMetadata: imageFile ? {
          originalSize: imageFile.size,
          compressedSize: Math.round(imageUrl.length * 0.75),
          compressionDate: new Date(),
          uploadMethod: 'new-category'
        } : null
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      console.log('✅ Category created with ID:', docRef.id);

      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (error) {
      console.error('❌ Error creating category:', error);
      alert('Error creating category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
            <p className="text-gray-600">Create a new travel category</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TagIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="category-slug"
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              <p className="text-gray-500 text-xs mt-1">URL-friendly version of the name</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter category description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PhotoIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Category Image</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                <div className="relative inline-block group">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-300 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                  />
                  {/* Image overlay with info */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                      <PhotoIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Click to view full size</span>
                    </div>
                  </div>
                  {/* Full size preview on click */}
                  <button
                    type="button"
                    onClick={() => window.open(imagePreview, '_blank')}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    Click image to view full size • Preview size: 48x48 display
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove the selected image?')) {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, image: '' }));
                        setImageFile(null);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Image Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Image Selection
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'City', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Desert', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Safari', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Island', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Cultural', url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
                  { name: 'Luxury', url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: preset.url }));
                      setImagePreview(preset.url);
                      setImageFile(null);
                    }}
                    className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-blue-600 text-xs mt-2">
                💡 Click on any image above to use it, or upload your own custom image
              </p>
            </div>

            {/* Or Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-green-600 text-xs mt-1">
                ✅ Upload images directly from your device or use external URLs. Images are processed as base64 for maximum compatibility!
              </p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Featured Category
              </label>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="px-6 py-2"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || imageUploading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
          >
            {isLoading || imageUploading ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : (
              <CheckIcon className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Creating...' : imageUploading ? 'Uploading...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
