import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import searchService from '../../services/searchService';
import Button from '../common/Button';
import Card from '../common/Card';

const SearchDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('luxury');
  const [searchResults, setSearchResults] = useState(null);
  const [updateResults, setUpdateResults] = useState(null);

  // Test search functionality
  const testSearch = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing search with query:', testQuery);
      const results = await searchService.search(testQuery, {
        types: ['trip', 'hotel'],
        limit: 10
      });
      
      console.log('📊 Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ Search test failed:', error);
      setSearchResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Update existing data with search keywords
  const updateDataWithSearchKeywords = async () => {
    setLoading(true);
    setUpdateResults(null);
    
    try {
      const updates = [];
      
      // Update hotels
      const hotelsRef = collection(db, 'hotels');
      const hotelsSnapshot = await getDocs(hotelsRef);
      
      for (const hotelDoc of hotelsSnapshot.docs) {
        const data = hotelDoc.data();
        if (!data.searchKeywords) {
          const keywords = generateHotelKeywords(data);
          await updateDoc(doc(db, 'hotels', hotelDoc.id), {
            searchKeywords: keywords
          });
          updates.push(`Hotel: ${data.name || hotelDoc.id}`);
        }
      }
      
      // Update trips
      const tripsRef = collection(db, 'trips');
      const tripsSnapshot = await getDocs(tripsRef);
      
      for (const tripDoc of tripsSnapshot.docs) {
        const data = tripDoc.data();
        if (!data.searchKeywords) {
          const keywords = generateTripKeywords(data);
          await updateDoc(doc(db, 'trips', tripDoc.id), {
            searchKeywords: keywords
          });
          updates.push(`Trip: ${data.title || data.name || tripDoc.id}`);
        }
      }
      
      setUpdateResults({
        success: true,
        updated: updates,
        count: updates.length
      });
      
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

  // Generate search keywords for hotels
  const generateHotelKeywords = (data) => {
    const keywords = [];
    
    // Basic info
    if (data.name) keywords.push(...data.name.toLowerCase().split(' '));
    if (data.location) keywords.push(...data.location.toLowerCase().split(' '));
    if (data.category) keywords.push(data.category.toLowerCase());
    
    // Amenities
    if (data.amenities) {
      data.amenities.forEach(amenity => {
        keywords.push(...amenity.toLowerCase().split(' '));
      });
    }
    
    // Tags
    if (data.tags) {
      keywords.push(...data.tags.map(tag => tag.toLowerCase()));
    }
    
    // Room types
    if (data.roomTypes) {
      Object.keys(data.roomTypes).forEach(roomType => {
        keywords.push(...roomType.toLowerCase().split(' '));
      });
    }
    
    // Common hotel keywords
    keywords.push('hotel', 'accommodation', 'stay', 'booking', 'room');
    
    // Remove duplicates and filter out short words
    return [...new Set(keywords)].filter(keyword => keyword.length > 2);
  };

  // Generate search keywords for trips
  const generateTripKeywords = (data) => {
    const keywords = [];
    
    // Basic info
    if (data.title) keywords.push(...data.title.toLowerCase().split(' '));
    if (data.name) keywords.push(...data.name.toLowerCase().split(' '));
    if (data.location) keywords.push(...data.location.toLowerCase().split(' '));
    if (data.destination) keywords.push(...data.destination.toLowerCase().split(' '));
    if (data.category) keywords.push(data.category.toLowerCase());
    
    // Tags
    if (data.tags) {
      keywords.push(...data.tags.map(tag => tag.toLowerCase()));
    }
    
    // Highlights
    if (data.highlights) {
      data.highlights.forEach(highlight => {
        keywords.push(...highlight.toLowerCase().split(' '));
      });
    }
    
    // Common trip keywords
    keywords.push('trip', 'tour', 'travel', 'adventure', 'vacation', 'journey');
    
    // Remove duplicates and filter out short words
    return [...new Set(keywords)].filter(keyword => keyword.length > 2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Debugger
        </h1>
        <p className="text-gray-600">
          Test and debug search functionality
        </p>
      </motion.div>

      {/* Search Test */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Test Search
          </h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={testSearch}
              disabled={loading || !testQuery.trim()}
              className="flex items-center"
            >
              {loading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Test Search
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Search Results:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Update Data */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Update Data with Search Keywords
          </h2>
          
          <p className="text-gray-600 mb-4">
            Add search keywords to existing hotels and trips for better search functionality.
          </p>
          
          <Button
            onClick={updateDataWithSearchKeywords}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4 mr-2" />
            )}
            Update Data
          </Button>

          {updateResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {updateResults.success ? (
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Successfully updated {updateResults.count} items
                    </h3>
                    <ul className="mt-2 text-sm text-gray-600">
                      {updateResults.updated.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
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
    </div>
  );
};

export default SearchDebugger;
