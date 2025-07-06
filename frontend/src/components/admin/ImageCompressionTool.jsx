import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { processImageForDatabase, validateImageFile } from '../../utils/imageCompression';
import Card from '../common/Card';
import Button from '../common/Button';

const ImageCompressionTool = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    compressedImages: 0,
    originalSize: 0,
    compressedSize: 0,
    savedSpace: 0
  });

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategories(categoriesData);
      calculateStats(categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate compression statistics
  const calculateStats = (categoriesData) => {
    const imagesWithData = categoriesData.filter(cat => cat.image && cat.image.trim() !== '');
    const compressedImages = categoriesData.filter(cat => cat.imageMetadata);
    
    const totalOriginalSize = categoriesData.reduce((sum, cat) => 
      sum + (cat.imageMetadata?.originalSize || 0), 0
    );
    const totalCompressedSize = categoriesData.reduce((sum, cat) => 
      sum + (cat.imageMetadata?.compressedSize || 0), 0
    );

    setStats({
      totalImages: imagesWithData.length,
      compressedImages: compressedImages.length,
      originalSize: totalOriginalSize,
      compressedSize: totalCompressedSize,
      savedSpace: totalOriginalSize - totalCompressedSize
    });
  };

  // Compress all uncompressed images
  const compressAllImages = async () => {
    const uncompressedCategories = categories.filter(cat => 
      cat.image && cat.image.trim() !== '' && !cat.imageMetadata
    );

    if (uncompressedCategories.length === 0) {
      alert('All images are already compressed!');
      return;
    }

    const confirmCompress = window.confirm(
      `This will compress ${uncompressedCategories.length} uncompressed images. Continue?`
    );

    if (!confirmCompress) return;

    setCompressing(true);
    setProgress({ current: 0, total: uncompressedCategories.length });
    setResults([]);

    for (let i = 0; i < uncompressedCategories.length; i++) {
      const category = uncompressedCategories[i];
      setProgress({ current: i + 1, total: uncompressedCategories.length });

      try {
        console.log(`🗜️ Compressing image for category: ${category.name}`);

        // Convert base64 to blob for compression
        const response = await fetch(category.image);
        const blob = await response.blob();
        
        // Create file object
        const file = new File([blob], `${category.name}.jpg`, { type: 'image/jpeg' });

        // Compress image
        const compressedImage = await processImageForDatabase(file);

        // Update category with compressed image
        await updateDoc(doc(db, 'categories', category.id), {
          image: compressedImage,
          updatedAt: new Date(),
          imageMetadata: {
            originalSize: file.size,
            compressedSize: Math.round(compressedImage.length * 0.75),
            compressionDate: new Date(),
            uploadMethod: 'bulk-compression'
          }
        });

        const savedSpace = file.size - Math.round(compressedImage.length * 0.75);
        const compressionRatio = Math.round((savedSpace / file.size) * 100);

        setResults(prev => [...prev, {
          id: category.id,
          name: category.name,
          status: 'success',
          originalSize: file.size,
          compressedSize: Math.round(compressedImage.length * 0.75),
          savedSpace,
          compressionRatio
        }]);

        console.log(`✅ Compressed ${category.name}: ${Math.round(file.size / 1024)}KB → ${Math.round(compressedImage.length * 0.75 / 1024)}KB`);

      } catch (error) {
        console.error(`❌ Error compressing ${category.name}:`, error);
        setResults(prev => [...prev, {
          id: category.id,
          name: category.name,
          status: 'error',
          error: error.message
        }]);
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setCompressing(false);
    loadCategories(); // Reload to update stats
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
          <span>Loading categories...</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Statistics Card */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Image Compression Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalImages}</div>
            <div className="text-sm text-blue-800">Total Images</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.compressedImages}</div>
            <div className="text-sm text-green-800">Compressed</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.totalImages - stats.compressedImages}</div>
            <div className="text-sm text-orange-800">Uncompressed</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.savedSpace / 1024)}KB</div>
            <div className="text-sm text-purple-800">Space Saved</div>
          </div>
        </div>

        {stats.originalSize > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Compression Ratio:</strong> {Math.round((stats.savedSpace / stats.originalSize) * 100)}% reduction
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Total Size:</strong> {Math.round(stats.originalSize / 1024)}KB → {Math.round(stats.compressedSize / 1024)}KB
            </div>
          </div>
        )}
      </Card>

      {/* Compression Tool */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PhotoIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Bulk Image Compression</h3>
          </div>
          
          <Button
            onClick={compressAllImages}
            disabled={compressing || stats.totalImages - stats.compressedImages === 0}
            className="flex items-center space-x-2"
          >
            {compressing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <PhotoIcon className="h-4 w-4" />
                <span>Compress All Images</span>
              </>
            )}
          </Button>
        </div>

        {stats.totalImages - stats.compressedImages === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckIcon className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>All images are already compressed!</p>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <p>This will compress {stats.totalImages - stats.compressedImages} uncompressed images.</p>
            <p className="mt-1">Images will be resized to max 800x600px with 80% quality (JPEG format).</p>
          </div>
        )}

        {/* Progress Bar */}
        {compressing && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compression Results</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center">
                  {result.status === 'success' ? (
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">{result.name}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {result.status === 'success' ? (
                    <span>
                      {Math.round(result.originalSize / 1024)}KB → {Math.round(result.compressedSize / 1024)}KB 
                      <span className="text-green-600 ml-1">(-{result.compressionRatio}%)</span>
                    </span>
                  ) : (
                    <span className="text-red-600">{result.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default ImageCompressionTool;
