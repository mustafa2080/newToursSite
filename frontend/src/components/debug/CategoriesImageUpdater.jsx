import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhotoIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../common/Button';
import Card from '../common/Card';

const CategoriesImageUpdater = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [updateResults, setUpdateResults] = useState(null);

  // High-quality destination images from Unsplash
  const destinationImages = {
    'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'City': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Desert': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Island': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Safari': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Adventure': 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Cultural': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Luxury': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Budget': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Family': 'https://images.unsplash.com/photo-1502780402662-acc01917949e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Romantic': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Historical': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Urban': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Tropical': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Winter': 'https://images.unsplash.com/photo-1551524164-6cf2ac531400?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Summer': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Spring': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };

  // Load current categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categoriesData = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        categoriesData.push({
          id: doc.id,
          ...data
        });
      });
      
      setCategories(categoriesData);
      console.log('📊 Loaded categories:', categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update categories with proper images
  const updateCategoriesImages = async () => {
    setLoading(true);
    setUpdateResults(null);
    
    try {
      const updates = [];
      
      for (const category of categories) {
        // Find matching image based on category name
        let imageUrl = null;
        
        // Try exact match first
        if (destinationImages[category.name]) {
          imageUrl = destinationImages[category.name];
        } else {
          // Try partial match
          const categoryNameLower = category.name.toLowerCase();
          for (const [key, url] of Object.entries(destinationImages)) {
            if (categoryNameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryNameLower)) {
              imageUrl = url;
              break;
            }
          }
        }
        
        // Fallback to a default beautiful image
        if (!imageUrl) {
          imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
        
        // Update the category
        await updateDoc(doc(db, 'categories', category.id), {
          image: imageUrl,
          updatedAt: new Date()
        });
        
        updates.push({
          name: category.name,
          oldImage: category.image ? 'Had image' : 'No image',
          newImage: imageUrl
        });
      }
      
      setUpdateResults({
        success: true,
        updates: updates,
        count: updates.length
      });
      
      // Reload categories to show updated data
      await loadCategories();
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      setUpdateResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Get image for category name
  const getImageForCategory = (categoryName) => {
    if (destinationImages[categoryName]) {
      return destinationImages[categoryName];
    }
    
    const categoryNameLower = categoryName.toLowerCase();
    for (const [key, url] of Object.entries(destinationImages)) {
      if (categoryNameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryNameLower)) {
        return url;
      }
    }
    
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Categories Image Updater
        </h1>
        <p className="text-gray-600">
          Update Popular Destinations with beautiful images
        </p>
      </motion.div>

      {/* Load Categories */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PhotoIcon className="h-5 w-5 mr-2" />
            Load Current Categories
          </h2>
          
          <Button
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center mb-4"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4 mr-2" />
            )}
            Load Categories
          </Button>

          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Current Categories ({categories.length}):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        category.image ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.image ? 'Has Image' : 'No Image'}
                      </span>
                    </div>
                    
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-24 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <p>Suggested: {getImageForCategory(category.name).substring(0, 50)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Update Images */}
      {categories.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Update Categories with Beautiful Images
            </h2>
            
            <p className="text-gray-600 mb-4">
              This will update all categories with high-quality destination images from Unsplash.
            </p>
            
            <Button
              onClick={updateCategoriesImages}
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Update All Images
            </Button>

            {updateResults && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {updateResults.success ? (
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Successfully updated {updateResults.count} categories
                      </h3>
                      <div className="mt-2 space-y-1">
                        {updateResults.updates.map((update, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            <strong>{update.name}</strong>: {update.oldImage} → New image added
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800">Update Failed</h3>
                      <p className="text-sm text-red-600">{updateResults.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CategoriesImageUpdater;
