import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import TripForm from '../../components/admin/TripForm';
import Button from '../../components/common/Button';
import { tripsAPI } from '../../utils/firebaseApi';

const AddTrip = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (tripData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating trip:', tripData);

      // Use the API to create trip
      const result = await tripsAPI.create(tripData);

      console.log('Trip created successfully:', result.data);
      setSuccess('Trip created successfully!');

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/trips');
      }, 2000);

    } catch (error) {
      console.error('Error creating trip:', error);
      setError(error.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/trips');
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/admin/trips')}
            icon={<ArrowLeftIcon />}
          >
            Back to Trips
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Trip</h1>
            <p className="text-gray-600">Create a new travel package</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-md p-4"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trip Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TripForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for creating a great trip:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality images that showcase the destination</li>
          <li>• Write compelling descriptions that highlight unique experiences</li>
          <li>• Set competitive pricing based on similar trips</li>
          <li>• Include detailed information about what's included/excluded</li>
          <li>• Choose appropriate difficulty level for your target audience</li>
        </ul>
      </div>
    </div>
  );
};

export default AddTrip;
