import React, { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MediaLibrary = () => {
  console.log('📁 MediaLibrary component loading...');
  
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    console.log('📁 MediaLibrary useEffect running...');
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      console.log('📁 MediaLibrary loading complete');
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading media library..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your uploaded files and media assets</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Upload Files
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <PhotoIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Files Grid */}
      <Card className="p-6">
        <div className="text-center py-12">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
          <p className="text-gray-600">No files uploaded yet.</p>
        </div>
      </Card>
    </div>
  );
};

export default MediaLibrary;
