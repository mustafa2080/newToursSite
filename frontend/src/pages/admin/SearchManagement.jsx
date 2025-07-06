import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { batchUpdateSearchKeywords } from '../../utils/searchUtils';

const SearchManagement = () => {
  const [updating, setUpdating] = useState(false);
  const [results, setResults] = useState({});
  const [stats, setStats] = useState({
    trips: { total: 0, withKeywords: 0 },
    hotels: { total: 0, withKeywords: 0 },
    reviews: { total: 0, withKeywords: 0 }
  });

  const loadStats = async () => {
    try {
      const collections = ['trips', 'hotels', 'reviews'];
      const newStats = {};

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        const total = snapshot.size;
        const withKeywords = snapshot.docs.filter(doc => 
          doc.data().searchKeywords && doc.data().searchKeywords.length > 0
        ).length;

        newStats[collectionName] = { total, withKeywords };
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateSearchKeywords = async (collectionName, type) => {
    setUpdating(true);
    try {
      console.log(`🔄 Updating search keywords for ${collectionName}...`);
      const updateCount = await batchUpdateSearchKeywords(db, collectionName, type);
      
      setResults(prev => ({
        ...prev,
        [collectionName]: {
          success: true,
          count: updateCount,
          timestamp: new Date().toLocaleString()
        }
      }));

      // Reload stats
      await loadStats();
      
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      setResults(prev => ({
        ...prev,
        [collectionName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleString()
        }
      }));
    } finally {
      setUpdating(false);
    }
  };

  const updateAllCollections = async () => {
    setUpdating(true);
    try {
      const collections = [
        { name: 'trips', type: 'trip' },
        { name: 'hotels', type: 'hotel' },
        { name: 'reviews', type: 'review' }
      ];

      for (const { name, type } of collections) {
        await updateSearchKeywords(name, type);
      }
    } finally {
      setUpdating(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const getProgressPercentage = (withKeywords, total) => {
    return total > 0 ? Math.round((withKeywords / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="h-8 w-8 mr-3 text-blue-600" />
                Search Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage search keywords and optimize search functionality
              </p>
            </div>
            <Button
              onClick={updateAllCollections}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowPathIcon className="h-4 w-4 mr-2" />
              )}
              Update All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {Object.entries(stats).map(([collection, data]) => (
            <Card key={collection} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {collection}
                </h3>
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Documents:</span>
                  <span className="font-medium">{data.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">With Keywords:</span>
                  <span className="font-medium">{data.withKeywords}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(data.withKeywords, data.total)}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {getProgressPercentage(data.withKeywords, data.total)}% optimized
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Update Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Trips
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate search keywords for all trip documents including titles, descriptions, locations, and itineraries.
            </p>
            <Button
              onClick={() => updateSearchKeywords('trips', 'trip')}
              disabled={updating}
              className="w-full"
              variant="outline"
            >
              {updating ? 'Updating...' : 'Update Trips'}
            </Button>
            {results.trips && (
              <div className={`mt-3 p-2 rounded text-sm ${
                results.trips.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {results.trips.success ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Updated {results.trips.count} documents
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Error: {results.trips.error}
                  </div>
                )}
                <div className="text-xs mt-1">{results.trips.timestamp}</div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Hotels
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate search keywords for all hotel documents including names, descriptions, amenities, and facilities.
            </p>
            <Button
              onClick={() => updateSearchKeywords('hotels', 'hotel')}
              disabled={updating}
              className="w-full"
              variant="outline"
            >
              {updating ? 'Updating...' : 'Update Hotels'}
            </Button>
            {results.hotels && (
              <div className={`mt-3 p-2 rounded text-sm ${
                results.hotels.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {results.hotels.success ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Updated {results.hotels.count} documents
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Error: {results.hotels.error}
                  </div>
                )}
                <div className="text-xs mt-1">{results.hotels.timestamp}</div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Reviews
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate search keywords for all review documents including content and user feedback.
            </p>
            <Button
              onClick={() => updateSearchKeywords('reviews', 'review')}
              disabled={updating}
              className="w-full"
              variant="outline"
            >
              {updating ? 'Updating...' : 'Update Reviews'}
            </Button>
            {results.reviews && (
              <div className={`mt-3 p-2 rounded text-sm ${
                results.reviews.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {results.reviews.success ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Updated {results.reviews.count} documents
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Error: {results.reviews.error}
                  </div>
                )}
                <div className="text-xs mt-1">{results.reviews.timestamp}</div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How Search Optimization Works
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What it does:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Generates comprehensive search keywords from content</li>
                  <li>• Creates partial matches for better search results</li>
                  <li>• Includes location, category, and feature keywords</li>
                  <li>• Optimizes for both exact and fuzzy matching</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">When to run:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• After adding new content</li>
                  <li>• When search results seem incomplete</li>
                  <li>• After updating existing content</li>
                  <li>• Monthly maintenance recommended</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchManagement;
