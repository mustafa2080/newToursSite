import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  FolderIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
// Firebase Storage disabled - using demo mode
// import { ref, listAll, getDownloadURL, deleteObject, getMetadata, uploadBytes } from 'firebase/storage';
// import { storage } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
// import ImageUpload from '../../components/common/ImageUpload';

const MediaLibrary = () => {
  console.log('📁 MediaLibrary component loading...');

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byType: {}
  });

  const folders = [
    { id: 'all', name: 'All Files', icon: FolderIcon },
    { id: 'trips', name: 'Trips', icon: PhotoIcon },
    { id: 'hotels', name: 'Hotels', icon: PhotoIcon },
    { id: 'categories', name: 'Categories', icon: PhotoIcon },
    { id: 'avatars', name: 'Avatars', icon: PhotoIcon },
    { id: 'general', name: 'General', icon: DocumentIcon },
  ];

  useEffect(() => {
    loadFiles();
  }, [selectedFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      console.log('📁 Loading files (demo mode - Firebase Storage not available)...');

      // Demo files for testing
      const demoFiles = [
        // Trips
        {
          id: 'demo-trip-1',
          name: 'mountain-adventure.jpg',
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'trips/mountain-adventure.jpg',
          folder: 'trips',
          size: 245760,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-15'),
          updated: new Date('2024-01-15'),
        },
        {
          id: 'demo-trip-2',
          name: 'beach-paradise.jpg',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'trips/beach-paradise.jpg',
          folder: 'trips',
          size: 198720,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-14'),
          updated: new Date('2024-01-14'),
        },
        {
          id: 'demo-trip-3',
          name: 'desert-safari.jpg',
          url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'trips/desert-safari.jpg',
          folder: 'trips',
          size: 267840,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-13'),
          updated: new Date('2024-01-13'),
        },
        // Hotels
        {
          id: 'demo-hotel-1',
          name: 'luxury-resort.jpg',
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'hotels/luxury-resort.jpg',
          folder: 'hotels',
          size: 189440,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-12'),
          updated: new Date('2024-01-12'),
        },
        {
          id: 'demo-hotel-2',
          name: 'boutique-hotel.jpg',
          url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'hotels/boutique-hotel.jpg',
          folder: 'hotels',
          size: 234560,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-11'),
          updated: new Date('2024-01-11'),
        },
        {
          id: 'demo-hotel-3',
          name: 'city-hotel.jpg',
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'hotels/city-hotel.jpg',
          folder: 'hotels',
          size: 156720,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-10'),
          updated: new Date('2024-01-10'),
        },
        // Categories
        {
          id: 'demo-cat-1',
          name: 'adventure-category.jpg',
          url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'categories/adventure-category.jpg',
          folder: 'categories',
          size: 312320,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-09'),
          updated: new Date('2024-01-09'),
        },
        {
          id: 'demo-cat-2',
          name: 'cultural-category.jpg',
          url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'categories/cultural-category.jpg',
          folder: 'categories',
          size: 278400,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-08'),
          updated: new Date('2024-01-08'),
        },
        // Uploads
        {
          id: 'demo-upload-1',
          name: 'user-upload-1.jpg',
          url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80',
          path: 'uploads/user-upload-1.jpg',
          folder: 'uploads',
          size: 201600,
          contentType: 'image/jpeg',
          timeCreated: new Date('2024-01-07'),
          updated: new Date('2024-01-07'),
        },
      ];

      // Filter by selected folder
      const filteredFiles = selectedFolder === 'all' ?
        demoFiles :
        demoFiles.filter(file => file.folder === selectedFolder);

      setFiles(filteredFiles);
      calculateStats(filteredFiles);
      console.log(`✅ Loaded ${filteredFiles.length} demo files`);
    } catch (error) {
      console.error('❌ Error loading files:', error);
      setFiles([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (filesList) => {
    const stats = {
      totalFiles: filesList.length,
      totalSize: filesList.reduce((sum, file) => sum + file.size, 0),
      byType: {}
    };

    filesList.forEach(file => {
      const type = getFileType(file.contentType);
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    setStats(stats);
  };

  const getFileType = (contentType) => {
    if (contentType?.startsWith('image/')) return 'image';
    if (contentType?.startsWith('video/')) return 'video';
    if (contentType?.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (contentType) => {
    const type = getFileType(contentType);
    switch (type) {
      case 'image': return PhotoIcon;
      case 'video': return VideoCameraIcon;
      case 'audio': return MusicalNoteIcon;
      default: return DocumentIcon;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Simulating file deletion (demo mode):', file.name);

      // Simulate deletion delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ File deletion simulated successfully');
      await loadFiles();
      setSelectedFile(null);
      alert(`File "${file.name}" deleted successfully!\n\nNote: This is demo mode. Firebase Storage is not configured.`);
    } catch (error) {
      console.error('❌ Error simulating file deletion:', error);
      alert('Error deleting file: ' + error.message);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setLoading(true);
      console.log('📤 Processing selected files (demo mode):', files);

      const targetFolder = selectedFolder === 'all' ? 'uploads' : selectedFolder;

      // Simulate file upload in demo mode
      for (const file of files) {
        try {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            console.warn(`Skipping non-image file: ${file.name}`);
            continue;
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            console.warn(`File too large: ${file.name}`);
            continue;
          }

          console.log(`✅ Simulated upload: ${file.name} to ${targetFolder}`);
        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error);
        }
      }

      console.log('✅ All files processed (demo mode)');

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      await loadFiles();
      setShowUpload(false);
      alert(`Files processed successfully in demo mode!\n\nNote: Firebase Storage is not configured. Files are not actually uploaded.`);

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('❌ Error processing files:', error);
      alert('Error processing files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  const addSampleFiles = async () => {
    if (!window.confirm('This will load sample files in demo mode. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Loading sample files (demo mode)...');

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✅ Sample files loaded successfully (demo mode)');
      await loadFiles();
      alert('Sample files loaded successfully!\n\nNote: This is demo mode. Firebase Storage is not configured.');
    } catch (error) {
      console.error('❌ Error loading sample files:', error);
      alert('Error loading sample files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading media library..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Demo Mode Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
            <p className="text-sm text-yellow-700">
              Firebase Storage is not configured. This is a demo version with sample files.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your uploaded files and media assets</p>
        </div>
        <div className="flex space-x-3">
          {files.length === 0 && (
            <Button
              onClick={addSampleFiles}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              loading={loading}
            >
              Add Sample Files
            </Button>
          )}
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 hover:bg-blue-700"
            icon={<ArrowUpTrayIcon />}
          >
            Upload Files
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <PhotoIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <PhotoIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byType.image || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <DocumentIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byType.document || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Files</h3>

          {/* Simple File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h4>
              <p className="text-gray-600 mb-4">Select images to upload to Firebase Storage</p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Select Files
              </label>

              <div className="mt-4 flex justify-center space-x-4">
                <Button
                  onClick={() => setShowUpload(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Files Grid */}
      <Card className="p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No files match your search criteria.' : 'No files uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.contentType);
              const isImage = getFileType(file.contentType) === 'image';
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* File Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  {getFileType(selectedFile.contentType) === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.name}
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      {React.createElement(getFileIcon(selectedFile.contentType), {
                        className: "h-16 w-16 text-gray-400"
                      })}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Name:</p>
                    <p className="text-gray-600">{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Size:</p>
                    <p className="text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Type:</p>
                    <p className="text-gray-600">{selectedFile.contentType}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Folder:</p>
                    <p className="text-gray-600">{selectedFile.folder}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Created:</p>
                    <p className="text-gray-600">{selectedFile.timeCreated.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Updated:</p>
                    <p className="text-gray-600">{selectedFile.updated.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => window.open(selectedFile.url, '_blank')}
                    icon={<EyeIcon />}
                  >
                    View Full Size
                  </Button>
                  <Button
                    onClick={() => handleDeleteFile(selectedFile)}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    icon={<TrashIcon />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
