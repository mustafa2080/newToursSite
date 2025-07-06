import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import HotelForm from '../../components/admin/HotelForm';
import Button from '../../components/common/Button';
import { hotelsAPI } from '../../utils/firebaseApi';

const AddHotel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (hotelData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating hotel:', hotelData);

      // Use the API to create hotel
      const result = await hotelsAPI.create(hotelData);

      console.log('Hotel created successfully:', result.data);
      setSuccess('Hotel created successfully!');

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (error) {
      console.error('Error creating hotel:', error);
      setError(error.message || 'Failed to create hotel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/hotels');
  };

  const generateSlug = (name) => {
    return name
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
            onClick={() => navigate('/admin/hotels')}
            icon={<ArrowLeftIcon />}
          >
            Back to Hotels
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Hotel</h1>
            <p className="text-gray-600">Create a new hotel listing</p>
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

      {/* Hotel Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HotelForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for creating a great hotel listing:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload high-quality images that showcase the hotel's best features</li>
          <li>• Write detailed descriptions highlighting unique amenities</li>
          <li>• Set competitive pricing based on location and star rating</li>
          <li>• Include accurate room counts and availability information</li>
          <li>• Specify all amenities and services offered</li>
        </ul>
      </div>
    </div>
  );
};

export default AddHotel;
