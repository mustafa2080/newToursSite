import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { processImageForDatabase, validateImageFile } from '../../utils/imageCompression';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [category, setCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: '',
    status: 'active',
    featured: false,
    metaTitle: '',
    metaDescription: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading category:', id);

      const categoryDoc = await getDoc(doc(db, 'categories', id));
      if (categoryDoc.exists()) {
        const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
        setCategory(categoryData);
        setFormData({
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          description: categoryData.description || '',
          image: categoryData.image || '',
          icon: categoryData.icon || '',
          status: categoryData.status || 'active',
          featured: categoryData.featured || false,
          metaTitle: categoryData.metaTitle || '',
          metaDescription: categoryData.metaDescription || ''
        });
        setImagePreview(categoryData.image || '');
        console.log('✅ Category loaded:', categoryData);
      } else {
        console.error('Category not found');
        navigate('/admin/categories');
      }
    } catch (error) {
      console.error('Error loading category:', error);
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

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
        console.log(`🗜️ Compressing image for edit: ${file.name}...`);

        // Compress image for preview and storage
        const compressedImage = await processImageForDatabase(file);

        setImageFile(file);
        setImagePreview(compressedImage);

        console.log(`✅ Image compressed and ready for update`);
      } catch (error) {
        console.error('❌ Error compressing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Updating category...');

      // Upload image if selected
      let imageUrl = formData.image;
      if (imageFile) {
        console.log('📷 Processing image update...');

        // Use base64 directly (more reliable than Firebase Storage with CORS issues)
        if (imagePreview) {
          console.log('📷 Using base64 image encoding');
          imageUrl = imagePreview;
          console.log('✅ Image processed successfully as base64');
        } else {
          console.error('❌ No image preview available');

          const continueWithoutImage = window.confirm(
            'Image processing failed. Do you want to continue with the current image?'
          );

          if (!continueWithoutImage) {
            return;
          }
        }
      }

      const categoryData = {
        ...formData,
        image: imageUrl,
        updatedAt: new Date().toISOString(),
        imageMetadata: imageFile ? {
          originalSize: imageFile.size,
          compressedSize: Math.round(imageUrl.length * 0.75),
          compressionDate: new Date(),
          uploadMethod: 'edit-category'
        } : formData.imageMetadata // Keep existing metadata if no new image
      };

      await updateDoc(doc(db, 'categories', id), categoryData);

      console.log('✅ Category updated successfully');
      alert('Category updated successfully!');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      console.log('🗑️ Deleting category...');

      await deleteDoc(doc(db, 'categories', id));

      console.log('✅ Category deleted successfully');
      alert('Category deleted successfully!');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading category..." />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/admin/categories')} icon={<ArrowLeftIcon />}>
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => navigate('/admin/categories')}
                variant="outline"
                size="small"
                icon={<ArrowLeftIcon />}
                className="mb-4"
              >
                Back to Categories
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
              <p className="text-gray-600 mt-2">Update category information and settings</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate(`/categories/${category.slug || category.id}`)}
                variant="outline"
                icon={<EyeIcon />}
                size="small"
              >
                Preview
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                icon={<TrashIcon />}
                size="small"
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Adventure Tours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="adventure-tours"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this category..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🏞️"
                  />
                </div>

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
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Category</span>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Image</h2>
              
              <div className="space-y-6">
                {/* Current Image */}
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Image
                    </label>
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
                        Click image to view full size • Current size: 48x48 display
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove the current image?')) {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                            setImageFile(null);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imageUploading && (
                      <div className="text-sm text-blue-600">Uploading...</div>
                    )}
                  </div>
                </div>

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
                </div>
              </div>
            </Card>
          </motion.div>

          {/* SEO Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO description for search engines"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end space-x-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || imageUploading}
              icon={<PencilIcon />}
            >
              {saving ? 'Updating...' : 'Update Category'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
