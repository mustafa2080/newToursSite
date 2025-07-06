import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { convertFirebaseStorageUrl, getCategoryFallbackImage } from '../../utils/firebaseStorageHelper';
import { processImageForDatabase, validateImageFile } from '../../utils/imageCompression';
import ImageCompressionTool from '../../components/admin/ImageCompressionTool';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [imageFilter, setImageFilter] = useState('all'); // all, with-images, without-images
  const [updatingImages, setUpdatingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [showCompressionTool, setShowCompressionTool] = useState(false);

  useEffect(() => {
    // Load categories from Firebase
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      console.log('📂 Loading categories from Firebase...');

      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Fix Firebase Storage URLs
          image: data.image ? convertFirebaseStorageUrl(data.image) : null,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date()
        };
      });

      console.log('📂 Categories loaded:', categoriesData.length);
      console.log('🖼️ Categories with images:', categoriesData.filter(cat => cat.image).length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on search, status, and images
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || category?.status === filterStatus;

    let matchesImage = true;
    if (imageFilter === 'with-images') {
      matchesImage = category.image && category.image.trim() !== '';
    } else if (imageFilter === 'without-images') {
      matchesImage = !category.image || category.image.trim() === '';
    }

    return matchesSearch && matchesStatus && matchesImage;
  });

  // Calculate image statistics
  const categoriesWithImages = categories.filter(cat => cat.image && cat.image.trim() !== '').length;
  const categoriesWithoutImages = categories.length - categoriesWithImages;
  const imagePercentage = categories.length > 0 ? Math.round((categoriesWithImages / categories.length) * 100) : 0;

  // Calculate filtered statistics
  const filteredWithImages = filteredCategories.filter(cat => cat.image && cat.image.trim() !== '').length;
  const filteredWithoutImages = filteredCategories.length - filteredWithImages;

  // Calculate compression statistics
  const compressedImages = categories.filter(cat => cat.imageMetadata).length;
  const totalOriginalSize = categories.reduce((sum, cat) =>
    sum + (cat.imageMetadata?.originalSize || 0), 0
  );
  const totalCompressedSize = categories.reduce((sum, cat) =>
    sum + (cat.imageMetadata?.compressedSize || 0), 0
  );
  const totalSavedSpace = totalOriginalSize - totalCompressedSize;
  const compressionRatio = totalOriginalSize > 0 ? Math.round((totalSavedSpace / totalOriginalSize) * 100) : 0;

  const handleEdit = (categoryId) => {
    console.log('Edit category:', categoryId);
    window.location.href = `/admin/categories/${categoryId}/edit`;
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        loadCategories(); // Reload the list
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const handleView = (category) => {
    // Navigate to category page for customers
    const slug = category.slug || category.id;
    window.open(`/categories/${slug}`, '_blank');
  };

  const handleQuickImageUpdate = async (categoryId, categoryName) => {
    // Quick image update using our predefined images
    const imageMapping = {
      'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'City': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Desert': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Safari': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Island': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Cultural': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Luxury': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Adventure': 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Family': 'https://images.unsplash.com/photo-1502780402662-acc01917949e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Romantic': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };

    // Find matching image
    let imageUrl = null;
    const categoryNameLower = categoryName.toLowerCase();

    // Try exact match first
    if (imageMapping[categoryName]) {
      imageUrl = imageMapping[categoryName];
    } else {
      // Try partial match
      for (const [key, url] of Object.entries(imageMapping)) {
        if (categoryNameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryNameLower)) {
          imageUrl = url;
          break;
        }
      }
    }

    // Fallback to default image
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'categories', categoryId), {
        image: imageUrl,
        updatedAt: new Date()
      });

      console.log(`✅ Updated image for ${categoryName}`);
      loadCategories(); // Reload to show updated image
    } catch (error) {
      console.error('❌ Error updating category image:', error);
      alert('Error updating image. Please try again.');
    }
  };

  const handleUpdateAllImages = async () => {
    if (!window.confirm('Are you sure you want to update all category images? This will replace existing images.')) {
      return;
    }

    setUpdatingImages(true);
    try {
      const { updateCategoriesWithImages } = await import('../../utils/addSampleCategories');
      const result = await updateCategoriesWithImages();

      if (result.success) {
        console.log(`✅ Updated ${result.categoriesUpdated} category images`);
        alert(`Successfully updated ${result.categoriesUpdated} category images!`);
        loadCategories(); // Reload to show updated images
      } else {
        alert('Error updating images: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error updating all images:', error);
      alert('Error updating images. Please try again.');
    } finally {
      setUpdatingImages(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e, categoryId, categoryName) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      alert('Please drop an image file');
      return;
    }

    // Validate image file
    if (!validateImageFile(imageFile)) {
      alert('Invalid image file. Please use JPEG, PNG, WebP, or GIF format (max 10MB)');
      return;
    }

    setUploadingCategory(categoryId);
    try {
      console.log(`🗜️ Compressing dropped image for ${categoryName}...`);

      // Compress image before saving
      const compressedImage = await processImageForDatabase(imageFile);

      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'categories', categoryId), {
        image: compressedImage,
        updatedAt: new Date(),
        imageMetadata: {
          originalSize: imageFile.size,
          compressedSize: Math.round(compressedImage.length * 0.75),
          compressionDate: new Date(),
          uploadMethod: 'drag-drop'
        }
      });

      console.log(`✅ Updated compressed image for ${categoryName} via drag & drop`);
      loadCategories(); // Reload to show updated image
    } catch (error) {
      console.error('❌ Error processing dropped image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleImageUpload = async (categoryId, categoryName, file) => {
    // Validate image file
    if (!validateImageFile(file)) {
      alert('Invalid image file. Please use JPEG, PNG, WebP, or GIF format (max 10MB)');
      return;
    }

    setUploadingCategory(categoryId);
    try {
      console.log(`🗜️ Compressing uploaded image for ${categoryName}...`);

      // Compress image before saving
      const compressedImage = await processImageForDatabase(file);

      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'categories', categoryId), {
        image: compressedImage,
        updatedAt: new Date(),
        imageMetadata: {
          originalSize: file.size,
          compressedSize: Math.round(compressedImage.length * 0.75),
          compressionDate: new Date(),
          uploadMethod: 'file-upload'
        }
      });

      console.log(`✅ Updated compressed image for ${categoryName} via file upload`);
      loadCategories(); // Reload to show updated image
    } catch (error) {
      console.error('❌ Error processing uploaded image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploadingCategory(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">
              {categories.length} total categories
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">{categoriesWithImages} with images</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700">{categoriesWithoutImages} without images</span>
              </div>
              <div className="text-blue-600 font-medium">
                ({imagePercentage}% coverage)
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleUpdateAllImages}
            disabled={updatingImages}
            variant="outline"
            icon={updatingImages ? <ArrowPathIcon className="animate-spin" /> : <PhotoIcon />}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            {updatingImages ? 'Updating...' : 'Update All Images'}
          </Button>
          <Link to="/admin/categories/new">
            <Button
              icon={<PlusIcon />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={imageFilter}
              onChange={(e) => setImageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">🖼️ All Images</option>
              <option value="with-images">✅ With Images</option>
              <option value="without-images">❌ Without Images</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Categories',
            value: categories.length,
            icon: TagIcon,
            color: 'blue'
          },
          {
            label: 'Active Categories',
            value: categories.filter(c => c.status === 'active').length,
            icon: TagIcon,
            color: 'green'
          },
          {
            label: 'Inactive Categories',
            value: categories.filter(c => c.status === 'inactive').length,
            icon: TagIcon,
            color: 'red'
          },
          {
            label: 'Draft Categories',
            value: categories.filter(c => c.status === 'draft').length,
            icon: TagIcon,
            color: 'yellow'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Image Compression Tool */}
      {showCompressionTool && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <ImageCompressionTool />
        </motion.div>
      )}

      {/* Compression Tool Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button
          onClick={() => setShowCompressionTool(!showCompressionTool)}
          variant={showCompressionTool ? "secondary" : "outline"}
          className="flex items-center space-x-2"
        >
          <PhotoIcon className="h-4 w-4" />
          <span>{showCompressionTool ? 'Hide' : 'Show'} Compression Tool</span>
        </Button>
      </div>

      {/* Results Summary */}
      {!isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <div>
                  Showing <span className="font-semibold">{filteredCategories.length}</span> of <span className="font-semibold">{categories.length}</span> categories
                </div>
                <div className="text-xs text-blue-600 mt-1 sm:mt-0">
                  📊 Images: <span className="font-semibold">{filteredWithImages}</span> with • <span className="font-semibold">{filteredWithoutImages}</span> without
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-2 space-y-1">
                <div>💡 Drag & drop images directly onto categories • Click 📷 to upload • Click 🔄 for auto-update</div>
                {compressedImages > 0 && (
                  <div className="text-green-600">
                    🗜️ Compression: <span className="font-semibold">{compressedImages}</span> images compressed •
                    Saved <span className="font-semibold">{Math.round(totalSavedSpace / 1024)}KB</span> ({compressionRatio}% reduction)
                  </div>
                )}
              </div>
            </div>
            {(searchTerm || filterStatus !== 'all' || imageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setImageFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Categories ({filteredCategories.length})
          </h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categories.length === 0 ? 'No categories found' : 'No categories match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {categories.length === 0
                ? 'Get started by creating your first category.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {categories.length === 0 && (
              <Link to="/admin/categories/new">
                <Button
                  icon={<PlusIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add New Category
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Image Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="flex items-center justify-center"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, category.id, category.name)}
                      >
                        {category.image ? (
                          <div className="relative group cursor-pointer" onClick={() => setSelectedImage({ url: category.image, name: category.name })}>
                            <img
                              src={category.image}
                              alt={`${category.name} category`}
                              className="h-16 w-16 rounded-lg object-cover shadow-sm border border-gray-200 group-hover:shadow-md transition-all duration-200 group-hover:scale-105"
                              onError={(e) => {
                                console.log(`❌ Admin category image failed: ${category.name}`);
                                // Replace with fallback
                                e.target.src = getCategoryFallbackImage(category.name, 0);
                              }}
                              onLoad={() => {
                                console.log(`✅ Admin category image loaded: ${category.name}`);
                              }}
                            />

                            {/* Compression indicator */}
                            {category.imageMetadata && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full shadow-sm">
                                🗜️
                              </div>
                            )}
                            {/* Image overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                                <PhotoIcon className="h-5 w-5 mx-auto mb-1" />
                                <span className="text-xs">Click to view</span>
                                {category.imageMetadata && (
                                  <div className="text-xs mt-1 bg-black bg-opacity-50 px-2 py-1 rounded">
                                    📊 {Math.round(category.imageMetadata.compressedSize / 1024)}KB
                                    {category.imageMetadata.originalSize && (
                                      <span className="text-green-300 ml-1">
                                        (-{Math.round((1 - category.imageMetadata.compressedSize / category.imageMetadata.originalSize) * 100)}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(category.image);
                                    alert('Image URL copied to clipboard!');
                                  }}
                                  className="mt-1 text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
                                >
                                  Copy URL
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-dashed border-gray-400 hover:border-blue-500 transition-colors group">
                            {uploadingCategory === category.id ? (
                              <div className="text-center">
                                <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-1" />
                                <span className="text-xs text-blue-500">Uploading...</span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <PhotoIcon className="h-6 w-6 text-gray-500 group-hover:text-blue-500 mx-auto mb-1" />
                                <span className="text-xs text-gray-500 group-hover:text-blue-500">Drop image</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category Info Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.slug}</div>
                        {category.icon && (
                          <div className="text-lg mt-1">{category.icon}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(category.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.createdAt?.toLocaleDateString?.() ||
                       new Date(category.createdAt).toLocaleDateString() ||
                       'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleView(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Category"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {/* Upload Image Button */}
                        <label className="cursor-pointer text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50" title="📷 Upload Image">
                          {uploadingCategory === category.id ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <PhotoIcon className="h-4 w-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageUpload(category.id, category.name, file);
                              }
                            }}
                            disabled={uploadingCategory === category.id}
                          />
                        </label>

                        <button
                          onClick={() => handleQuickImageUpdate(category.id, category.name)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="🔄 Auto Update Image"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Edit Category"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Category"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <h3 className="text-lg font-semibold">{selectedImage.name}</h3>
              <p className="text-sm text-gray-300">Click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
