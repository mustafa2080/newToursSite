import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  FolderIcon,
  DocumentIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MediaLibraryDemo = () => {
  console.log('📁 MediaLibraryDemo component loading...');
  
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
    { id: 'uploads', name: 'Uploads', icon: ArrowUpTrayIcon },
  ];

  useEffect(() => {
    loadFiles();
  }, [selectedFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      console.log('📁 Loading demo files...');

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

  const calculateStats = (fileList) => {
    const totalFiles = fileList.length;
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const byType = fileList.reduce((acc, file) => {
      const type = file.contentType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    setStats({ totalFiles, totalSize, byType });
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
      alert(`Files processed successfully in demo mode!\n\nNote: This is a demo. Files are not actually uploaded.`);
      
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
    if (!window.confirm('This will reload sample files in demo mode. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Loading sample files (demo mode)...');

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✅ Sample files loaded successfully (demo mode)');
      await loadFiles();
      alert('Sample files loaded successfully!\n\nNote: This is demo mode.');
    } catch (error) {
      console.error('❌ Error loading sample files:', error);
      alert('Error loading sample files: ' + error.message);
    } finally {
      setLoading(false);
    }
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
      alert(`File "${file.name}" deleted successfully!\n\nNote: This is demo mode.`);
    } catch (error) {
      console.error('❌ Error simulating file deletion:', error);
      alert('Error deleting file: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) return PhotoIcon;
    if (contentType?.startsWith('video/')) return VideoCameraIcon;
    if (contentType?.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.folder.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
              This is a demo version with sample files. Firebase Storage is not configured.
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
            <DocumentIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">File Types</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byType).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ArrowUpTrayIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Current Folder</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{selectedFolder}</p>
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Files (Demo Mode)</h4>
              <p className="text-gray-600 mb-4">Select images to simulate upload process</p>
              
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
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                variant={selectedFolder === folder.id ? 'primary' : 'outline'}
                size="sm"
                icon={<folder.icon />}
              >
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Files Grid */}
      <Card className="overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
            <p className="text-gray-600">No files match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.contentType);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {file.contentType?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center">
                        <FileIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-500 capitalize">{file.folder}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedFile.contentType?.startsWith('image/') && (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{selectedFile.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Size:</span>
                    <p className="text-gray-900">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-900">{selectedFile.contentType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Folder:</span>
                    <p className="text-gray-900 capitalize">{selectedFile.folder}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-900">{selectedFile.timeCreated.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <p className="text-gray-900">{selectedFile.updated.toLocaleDateString()}</p>
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
                    className="text-red-600 hover:text-red-700"
                    icon={<TrashIcon />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryDemo;
