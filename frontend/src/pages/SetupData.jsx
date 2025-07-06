import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { setupAllSampleData } from '../utils/addSampleData';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const SetupData = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSetupData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting data setup...');
      const setupResult = await setupAllSampleData();
      
      if (setupResult.success) {
        setResult(setupResult);
        console.log('✅ Data setup completed successfully!');
      } else {
        setError(setupResult.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('❌ Setup failed:', err);
      setError(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setup Sample Data
          </h1>
          <p className="text-lg text-gray-600">
            Add sample hotel, trip, and review data to test the rating system
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Setup Card */}
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <PlayIcon className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Initialize Sample Data
              </h2>

              <p className="text-gray-600 mb-6">
                This will add comprehensive sample data including a luxury hotel and safari trip with ratings and reviews to test the system:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🏨 Hotel Data</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Luxury Beach Resort</li>
                    <li>• Multiple room types</li>
                    <li>• Comprehensive amenities</li>
                    <li>• High-quality images</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🗺️ Trip Data</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Safari Adventure in Kenya</li>
                    <li>• 7 days with professional guide</li>
                    <li>• Wildlife viewing experience</li>
                    <li>• Luxury camping accommodation</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">⭐ Ratings & Reviews</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5 sample reviews</li>
                    <li>• Different users</li>
                    <li>• Various star ratings</li>
                    <li>• English comments</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleSetupData}
                loading={loading}
                disabled={loading || result?.success}
                size="large"
                icon={loading ? <ArrowPathIcon className="animate-spin" /> : <PlayIcon />}
              >
                {loading ? 'Setting up data...' : 'Setup Sample Data'}
              </Button>
            </div>
          </Card>

          {/* Success Result */}
          {result?.success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-green-200 bg-green-50">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      ✅ Setup Completed Successfully!
                    </h3>
                    <div className="text-green-800 space-y-2">
                      <p>• Hotel data added: <strong>{result.hotel?.name}</strong></p>
                      <p>• Sample ratings added: <strong>{result.ratingsCount} ratings</strong></p>
                      <p>• Hotel ID: <code className="bg-green-100 px-2 py-1 rounded">{result.hotel?.id}</code></p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-green-800 font-medium mb-2">Next Steps:</p>
                      <div className="space-y-2">
                        <a 
                          href="/hotels/luxury-beach-resort" 
                          className="inline-flex items-center text-green-700 hover:text-green-900 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          🏨 View Hotel Page
                        </a>
                        <br />
                        <span className="text-green-700">
                          ⭐ Try rating the hotel (login required)
                        </span>
                        <br />
                        <span className="text-green-700">
                          📊 Check the rating statistics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error Result */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      ❌ Setup Failed
                    </h3>
                    <p className="text-red-800">
                      {error}
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => {
                          setError(null);
                          setResult(null);
                        }}
                        variant="outline"
                        size="small"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Instructions
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold text-center mr-3 mt-0.5">1</span>
                <p>Click "Setup Sample Data" to add the hotel and rating data to Firebase</p>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold text-center mr-3 mt-0.5">2</span>
                <p>Visit the hotel page to see the rating system in action</p>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold text-center mr-3 mt-0.5">3</span>
                <p>Login to your account and try rating the hotel</p>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold text-center mr-3 mt-0.5">4</span>
                <p>Check that the rating statistics update correctly</p>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  ⚠️ Development Only
                </h3>
                <p className="text-yellow-800">
                  This setup page is for development and testing purposes only. 
                  Remove it before deploying to production.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetupData;
